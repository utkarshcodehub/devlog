import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getEntries, deleteEntry, updateEntry } from '../lib/api'
import EditModal from '../components/EditModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [copied, setCopied] = useState(false)

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (entry) => {
    const newStatus = entry.status === 'published' ? 'draft' : 'published'
    setTogglingId(entry.id)
    try {
      const updated = await updateEntry(entry.id, { status: newStatus })
      setEntries(prev => prev.map(e => e.id === entry.id ? updated.entry : e))
    } catch (err) {
      alert('Status update failed: ' + err.message)
    } finally {
      setTogglingId(null)
    }
  }

  const handleEditSaved = (updatedEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e))
    setEditingEntry(null)
  }

  const embedCode = `<script src="https://devlog-wheat.vercel.app/widget.js" data-username="${username}"><\/script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={handleEditSaved}
        />
      )}

      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-ink text-xl tracking-tight">
            Dev<span className="text-accent">Log</span>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/u/${username}`)}
              className="font-mono text-xs text-accent hover:text-accent/70 transition-colors"
            >
              View public profile
            </button>
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
            <h1 className="font-display font-bold text-4xl text-ink mb-2">Hey, {username}</h1>
            <p className="font-body text-muted text-base">You write it. AI polishes it. The world sees it.</p>
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
        <div className="grid grid-cols-3 gap-4 mb-10">
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

        {/* Embed snippet */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-display font-semibold text-ink text-base mb-0.5">Embed your changelog</p>
              <p className="font-body text-muted text-sm">Drop this anywhere on your site or portfolio.</p>
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all shrink-0 ${
                copied
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-ink text-white hover:bg-ink/80'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-bg border border-border rounded-xl px-4 py-3 font-mono text-xs text-muted overflow-x-auto">
            <code>{embedCode}</code>
          </div>
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
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Your changelog</p>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-2xl p-6 hover:border-ink/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-lg text-ink leading-tight truncate">
                        {entry.title}
                      </h3>
                      {entry.status === 'draft' && (
                        <span className="shrink-0 px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded-md font-mono text-xs text-yellow-700">
                          draft
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {formatDate(entry.created_at)} · {timeAgo(entry.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleStatus(entry)}
                      disabled={togglingId === entry.id}
                      title={entry.status === 'published' ? 'Move to drafts' : 'Publish'}
                      className="p-2 rounded-lg hover:bg-border text-muted hover:text-ink transition-all disabled:opacity-40"
                    >
                      {togglingId === entry.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : entry.status === 'published' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => setEditingEntry(entry)}
                      title="Edit"
                      className="p-2 rounded-lg hover:bg-border text-muted hover:text-ink transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-all disabled:opacity-40"
                    >
                      {deletingId === entry.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {entry.summary && (
                  <p className="font-body text-sm text-muted leading-relaxed mb-4">{entry.summary}</p>
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
                      <span key={i} className="px-2.5 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent">
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
              { day: 17, label: 'Public Profile Page', done: true },
              { day: 18, label: 'Dashboard CRUD', done: true },
              { day: 19, label: 'Embeddable JS Widget', done: true },
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