import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getEntries } from '../lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)
      setUsername(user.user_metadata?.username || 'dev')

      try {
        const data = await getEntries()
        setEntries(data.entries || [])
      } catch (err) {
        console.error('Failed to load entries:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const timeAgo = (dateStr) => {
    const now = new Date()
    const d = new Date(dateStr)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const published = entries.filter(e => e.status === 'published')
  const drafts = entries.filter(e => e.status === 'draft')

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-ink text-xl tracking-tight">
            Dev<span className="text-accent">Log</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted">@{username}</span>
            <button
              onClick={handleSignOut}
              className="font-mono text-xs text-muted hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome + CTA */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-display font-bold text-4xl text-ink mb-2">
              Hey, {username}
            </h1>
            <p className="font-body text-muted text-base">
              You write it. AI polishes it. The world sees it.
            </p>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="px-6 py-3 bg-ink text-white font-display font-bold text-sm rounded-xl hover:bg-ink/80 transition-all flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total entries', value: String(entries.length), sub: 'all time' },
            { label: 'Published', value: String(published.length), sub: 'public' },
            { label: 'Drafts', value: String(drafts.length), sub: 'unpublished' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-6">
              <p className="font-display font-bold text-4xl text-ink">{stat.value}</p>
              <p className="font-body text-sm text-ink mt-1">{stat.label}</p>
              <p className="font-mono text-xs text-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Entries list */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-xs text-muted">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-3xl p-20 text-center">
            <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-2xl text-ink mb-3">No entries yet</h3>
            <p className="text-muted font-body text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Paste your raw build notes and let AI turn them into a polished changelog.
            </p>
            <button
              onClick={() => navigate('/new')}
              className="px-6 py-3 bg-accent text-white font-display font-bold text-sm rounded-xl hover:bg-accent/90 transition-all"
            >
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-xs text-muted uppercase tracking-widest">Your changelog</p>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-2xl p-6 hover:border-ink/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-lg text-ink leading-tight">
                        {entry.title}
                      </h3>
                      {entry.status === 'draft' && (
                        <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded-md font-mono text-xs text-yellow-700">
                          draft
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted">{formatDate(entry.created_at)} · {timeAgo(entry.created_at)}</p>
                  </div>
                </div>

                {entry.summary && (
                  <p className="font-body text-sm text-muted leading-relaxed mb-4">
                    {entry.summary}
                  </p>
                )}

                {entry.bullets && entry.bullets.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {(Array.isArray(entry.bullets) ? entry.bullets : []).slice(0, 4).map((bullet, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="font-body text-sm text-ink">{bullet}</span>
                      </div>
                    ))}
                    {entry.bullets.length > 4 && (
                      <p className="font-mono text-xs text-muted ml-4">+{entry.bullets.length - 4} more</p>
                    )}
                  </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Week plan */}
        <div className="mt-12 bg-card border border-border rounded-2xl p-8">
          <p className="font-mono text-xs text-muted mb-6 uppercase tracking-widest">Build progress</p>
          <div className="space-y-3">
            {[
              { day: 15, label: 'Auth + Skeleton', done: true },
              { day: 16, label: 'AI Entry Writer', done: true },
              { day: 17, label: 'Public Profile Page', done: false },
              { day: 18, label: 'Dashboard CRUD', done: false },
              { day: 19, label: 'Embeddable JS Widget', done: false },
              { day: 20, label: 'RSS Feed + Shareable Links', done: false },
              { day: 21, label: 'Landing Page + Ship', done: false },
            ].map(item => (
              <div key={item.day} className="flex items-center gap-4">
                <span className={`font-mono text-xs w-12 ${item.done ? 'text-accent' : 'text-muted'}`}>
                  Day {item.day}
                </span>
                <div className={`flex-1 h-px ${item.done ? 'bg-accent/30' : 'bg-border'}`} />
                <span className={`font-body text-sm ${item.done ? 'text-ink font-medium' : 'text-muted'}`}>
                  {item.label}
                </span>
                {item.done && (
                  <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}