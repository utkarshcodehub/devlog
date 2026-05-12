from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supabase import create_client
import os, json
from dotenv import load_dotenv
import jwt as pyjwt

load_dotenv()

app = FastAPI(title="DevLog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ── Models ──

class PolishRequest(BaseModel):
    raw_input: str

class SaveEntryRequest(BaseModel):
    title: str
    summary: str
    bullets: list[str]
    raw_input: str
    tags: list[str] = []
    status: str = "published"

# ── Auth helper ──

def get_user_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    try:
        decoded = pyjwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="No user ID in token")
        return user_id
    except pyjwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── Routes ──

@app.get("/health")
def health():
    return {"status": "ok", "service": "devlog-api", "day": 16}


@app.post("/api/polish")
def polish_entry(body: PolishRequest, authorization: str = Header(...)):
    _ = get_user_id(authorization)

    if not body.raw_input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")

    prompt = f"""You are a developer changelog writer. The user will give you raw, messy bullet points about what they built or shipped today. Your job is to turn them into a polished, professional changelog entry.

Return ONLY valid JSON with this exact structure:
{{
  "title": "A concise, compelling title (max 10 words)",
  "summary": "One paragraph summary of the update (2-3 sentences max)",
  "bullets": ["Polished bullet point 1", "Polished bullet point 2", ...],
  "tags": ["tag1", "tag2", "tag3"]
}}

Rules:
- Title should be specific and action-oriented (e.g. "Added real-time collaboration to editor")
- Summary should read like a product announcement — clear, confident, no filler
- Bullets should be crisp, start with past-tense verbs (Added, Fixed, Improved, Shipped, etc.)
- Tags should be lowercase, relevant technical/domain tags (max 5)
- Do NOT add anything the user didn't mention — only polish what's there
- No markdown, no backticks, no explanation — ONLY the JSON object

Raw input:
{body.raw_input}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1000,
        )

        raw_text = response.choices[0].message.content.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        parsed = json.loads(raw_text)
        return {
            "title": parsed.get("title", "Untitled Update"),
            "summary": parsed.get("summary", ""),
            "bullets": parsed.get("bullets", []),
            "tags": parsed.get("tags", []),
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@app.post("/api/entries")
def save_entry(body: SaveEntryRequest, authorization: str = Header(...)):
    user_id = get_user_id(authorization)

    try:
        result = supabase.table("entries").insert({
            "user_id": user_id,
            "title": body.title,
            "summary": body.summary,
            "bullets": body.bullets,
            "raw_input": body.raw_input,
            "tags": body.tags,
            "status": body.status,
        }).execute()

        return {"success": True, "entry": result.data[0] if result.data else None}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save failed: {str(e)}")


@app.get("/api/entries")
def get_entries(authorization: str = Header(...)):
    user_id = get_user_id(authorization)

    try:
        result = (
            supabase.table("entries")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return {"entries": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetch failed: {str(e)}")
    
from fastapi.responses import Response

@app.get("/rss/{username}")
def rss_feed(username: str):
    try:
        # Get user id from profiles table
        profile = supabase.table("profiles").select("id").eq("username", username).limit(1).execute()
        if not profile.data:
            raise HTTPException(status_code=404, detail="User not found")

        user_id = profile.data[0]["id"]

        entries = (
            supabase.table("entries")
            .select("*")
            .eq("user_id", user_id)
            .eq("status", "published")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        items = ""
        for e in entries.data:
            bullets = e.get("bullets", [])
            bullets_html = "".join(f"<li>{b}</li>" for b in bullets) if bullets else ""
            description = f"{e.get('summary', '')}<ul>{bullets_html}</ul>"
            pub_date = e["created_at"].replace("Z", "+00:00") if e.get("created_at") else ""
            items += f"""
    <item>
      <title><![CDATA[{e['title']}]]></title>
      <link>https://devlog-wheat.vercel.app/u/{username}/{e['id']}</link>
      <guid>https://devlog-wheat.vercel.app/u/{username}/{e['id']}</guid>
      <pubDate>{pub_date}</pubDate>
      <description><![CDATA[{description}]]></description>
    </item>"""

        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{username}'s DevLog</title>
    <link>https://devlog-wheat.vercel.app/u/{username}</link>
    <description>Developer changelog for @{username}</description>
    <language>en-us</language>
    {items}
  </channel>
</rss>"""

        return Response(content=xml, media_type="application/rss+xml")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))