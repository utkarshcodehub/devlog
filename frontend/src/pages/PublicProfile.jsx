import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
        // Find user by username
        const { data: profiles, error: profileErr } = await supabase
          .from('public_profiles')
          .select('id')
          .eq('username', username)
          .limit(1)

        if (profileErr || !profiles || profiles.length === 0) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const userId = profiles[0].id

        // Fetch published entries
        const { data: entries, error: entriesErr } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (entriesErr) throw entriesErr
        setEntries(entries || [])
      } catch (err) {
        console.error('Failed to load profile:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getMonthYear = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Group entries by month
  const grouped = entries.reduce((acc, entry) => {
    const key = getMonthYear(entry.created_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-card border-2 border-border rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="font-display font-bold text-3xl text-muted">?</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-ink mb-3">
            @{username} not found
          </h1>
          <p className="font-body text-muted text-base mb-8 leading-relaxed">
            This developer doesn't exist on DevLog yet. Maybe they haven't signed up, or you've got a typo.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-ink text-white font-display font-semibold text-sm rounded-xl hover:bg-ink/80 transition-all"
          >
            Go home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Minimal top bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-ink text-base tracking-tight hover:text-accent transition-colors"
          >
            Dev<span className="text-accent">Log</span>
          </button>
          <span className="font-mono text-xs text-muted">public changelog</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* Profile header */}
        <div className="pt-16 pb-12 border-b border-border">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-2xl text-white">
                {username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl text-ink leading-none mb-1">
                @{username}
              </h1>
              <p className="font-body text-muted text-sm">
                {entries.length} update{entries.length !== 1 ? 's' : ''} published
              </p>
            </div>
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-body text-muted text-base">
              @{username} hasn't published anything yet.
            </p>
          </div>
        ) : (
          <div className="py-10">
            {Object.entries(grouped).map(([month, monthEntries]) => (
              <div key={month} className="mb-12">
                {/* Month header */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-display font-semibold text-sm text-muted uppercase tracking-widest whitespace-nowrap">
                    {month}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Entries for this month */}
                <div className="space-y-6">
                  {monthEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className="relative pl-8 before:absolute before:left-[7px] before:top-[28px] before:bottom-0 before:w-px before:bg-border last:before:hidden"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-accent bg-bg" />

                      {/* Date */}
                      <p className="font-mono text-xs text-muted mb-2">
                        {formatDate(entry.created_at)}
                      </p>

                      {/* Title */}
                      <h3 className="font-display font-bold text-xl text-ink mb-2 leading-tight">
                        {entry.title}
                      </h3>

                      {/* Summary */}
                      {entry.summary && (
                        <p className="font-body text-sm text-muted leading-relaxed mb-4">
                          {entry.summary}
                        </p>
                      )}

                      {/* Bullets */}
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

                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-6">
                          {entry.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent/70"
                            >
                              {tag}
                            </span>
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

        {/* Footer */}
        <footer className="border-t border-border py-10 text-center">
          <p className="font-mono text-xs text-muted">
            Powered by{' '}
            <button
              onClick={() => navigate('/')}
              className="text-accent hover:underline"
            >
              DevLog
            </button>
            {' '}— AI-polished developer changelogs
          </p>
        </footer>
      </main>
    </div>
  )
}