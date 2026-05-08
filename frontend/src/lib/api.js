import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function polishEntry(rawInput) {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/polish`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ raw_input: rawInput }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Polish failed' }));
    throw new Error(err.detail || 'Polish failed');
  }
  return res.json();
}

export async function saveEntry(entry) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: user.id,
      title: entry.title,
      summary: entry.summary,
      bullets: entry.bullets,
      raw_input: entry.raw_input,
      tags: entry.tags,
      status: entry.status || 'published',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, entry: data };
}

export async function getEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { entries: data };
}