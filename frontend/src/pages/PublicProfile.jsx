import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .limit(1)

        if (profileErr || !profiles || profiles.length === 0) {
          setNotFound(true); setLoading(false); return
        }

        const userId = profiles[0].id

        const { data: entries, error: entriesErr } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (entriesErr) throw entriesErr
        setEntries(entries || [])
      } catch (err) {
        console.error(err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  const getMonthYear = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  })

  const grouped = entries.reduce((acc, entry) => {
    const key = getMonthYear(entry.created_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  const rssUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/rss/${username}`

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="font-display font-bold text-3xl text-ink mb-3">@{username} not found</h1>
        <p className="font-body text-muted text-base mb-8">This developer doesn't exist on DevLog yet.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-ink text-white font-display font-bold text-sm rounded-xl hover:bg-ink/80 transition-all">
          Go home
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="font-display font-bold text-ink text-base tracking-tight hover:text-accent transition-colors">
            Dev<span className="text-accent">Log</span>
          </button>
          <div className="flex items-center gap-3">
            <a
              href={rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="RSS Feed"
              className="font-mono text-xs text-muted hover:text-orange-500 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"/>
              </svg>
              RSS
            </a>
            <span className="font-mono text-xs text-muted">public changelog</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* Profile header */}
        <div className="pt-16 pb-12 border-b border-border">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-2xl text-white">{username[0].toUpperCase()}</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl text-ink leading-none mb-1">@{username}</h1>
              <p className="font-body text-muted text-sm">{entries.length} update{entries.length !== 1 ? 's' : ''} published</p>
            </div>
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-body text-muted">@{username} hasn't published anything yet.</p>
          </div>
        ) : (
          <div className="py-10">
            {Object.entries(grouped).map(([month, monthEntries]) => (
              <div key={month} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-display font-semibold text-sm text-muted uppercase tracking-widest whitespace-nowrap">{month}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-6">
                  {monthEntries.map((entry) => (
                    <article key={entry.id} className="relative pl-8 before:absolute before:left-[7px] before:top-[28px] before:bottom-0 before:w-px before:bg-border last:before:hidden">
                      <div className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-accent bg-bg" />
                      <p className="font-mono text-xs text-muted mb-2">{formatDate(entry.created_at)}</p>

                      <Link
                        to={`/u/${username}/${entry.id}`}
                        className="block font-display font-bold text-xl text-ink mb-2 leading-tight hover:text-accent transition-colors"
                      >
                        {entry.title}
                      </Link>

                      {entry.summary && (
                        <p className="font-body text-sm text-muted leading-relaxed mb-4">{entry.summary}</p>
                      )}

                      {entry.bullets && entry.bullets.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {(Array.isArray(entry.bullets) ? entry.bullets : []).map((bullet, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-1.5 shrink-0" />
                              <span className="font-body text-sm text-ink/80">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-6">
                          {entry.tags.map((tag, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent/70">{tag}</span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="border-t border-border py-10 text-center">
          <p className="font-mono text-xs text-muted">
            Powered by{' '}
            <button onClick={() => navigate('/')} className="text-accent hover:underline">DevLog</button>
            {' '}— AI-polished developer changelogs
          </p>
        </footer>
      </main>
    </div>
  )
}