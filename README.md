# DevLog — AI-Polished Developer Changelogs

> Dump your raw build notes. AI turns them into a polished changelog — published, shareable, and embeddable anywhere.

**Live:** [devlog-wheat.vercel.app](https://devlog-wheat.vercel.app) · **Built in 7 days** as Week 3 of a 21-day build challenge.

---

## What it does

DevLog is a changelog tool for developers who ship but hate writing. You paste raw, messy bullet points — "fixed the auth bug", "new dark mode", "rewrote caching, way faster" — and Groq's LLM rewrites them into a structured, professional changelog entry with a title, summary, polished bullets, and auto-generated tags.

Every entry lives on your public profile at `/u/username`, can be embedded on any external site with a single `<script>` tag, and is subscribable via RSS.

---

## Features

- **AI entry writer** — paste raw notes, get a polished changelog entry in seconds (editable before publishing)
- **Public profile page** — timeline view of all published entries at `/u/username`, no login required
- **Shareable entry links** — each entry has its own page at `/u/username/:id`
- **Embeddable widget** — drop one `<script>` tag anywhere and your changelog renders inline via shadow DOM
- **RSS feed** — valid RSS XML at `/rss/username`, subscribable in any reader
- **Dashboard CRUD** — edit, delete, draft/publish toggle on all entries
- **Auth** — email/password signup via Supabase Auth

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (Postgres + RLS) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Project structure

```
devlog/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Public landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx      # Private — manage entries
│   │   │   ├── NewEntry.jsx       # AI polish flow
│   │   │   ├── PublicProfile.jsx  # Public — /u/:username
│   │   │   └── EntryDetail.jsx    # Public — /u/:username/:id
│   │   ├── components/
│   │   │   └── EditModal.jsx
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   └── api.js             # Supabase + backend calls
│   │   └── App.jsx
│   └── public/
│       └── widget.js              # Embeddable widget (vanilla JS + shadow DOM)
└── backend/
    └── main.py                    # FastAPI — /api/polish, /rss/:username
```

---

## How the AI polish works

The `/api/polish` endpoint takes raw input and sends it to Groq with a strict prompt that returns JSON only:

```json
{
  "title": "Concise action-oriented title",
  "summary": "2-3 sentence product announcement style summary",
  "bullets": ["Past-tense verb bullet points"],
  "tags": ["lowercase", "technical", "tags"]
}
```

The result is displayed in an editable preview — you can tweak title, bullets, add/remove tags before publishing. The raw input is also saved so nothing is lost.

---

## Embeddable widget

Any external site can embed a user's changelog with:

```html
<script src="https://devlog-wheat.vercel.app/widget.js" data-username="yourname"></script>
```

The widget is vanilla JS with shadow DOM for style isolation — it fetches published entries directly from Supabase using the public anon key, renders a styled timeline, and inserts itself after the script tag. No iframe, no dependencies, no React.

---

## Database schema

```sql
-- entries table (RLS enabled)
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  summary text,
  bullets jsonb not null default '[]',
  raw_input text not null,
  status text default 'published' check (status in ('draft', 'published')),
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- profiles table (public)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null
);
```

---

## Local setup

**Backend:**
```bash
cd devlog/backend
pip install -r requirements.txt

# .env
GROQ_API_KEY=your_groq_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_publishable_key

uvicorn main:app --reload
```

**Frontend:**
```bash
cd devlog/frontend
npm install

# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000

npm run dev
```

---

## What I learned

- Shadow DOM for style-isolated embeddable widgets — surprisingly clean once the mental model clicks
- Supabase RLS is powerful but requires careful policy design when mixing public and private access patterns
- Groq's `llama-3.3-70b-versatile` is fast enough for real-time UX (< 2s) and reliably returns structured JSON with the right prompt
- The difference between a feature and a product is the landing page — building the marketing surface forces clarity on what the actual value proposition is

---

## Part of the 21-day build challenge

This is Day 15–21 of a 21-day daily build challenge. Each day = one deployed project.

- **Week 1** — Python/Streamlit data apps
- **Week 2** — React + FastAPI + AI full-stack apps  
- **Week 3** — DevLog (this project)

All 21 projects: [github.com/yourusername](https://github.com/yourusername)
