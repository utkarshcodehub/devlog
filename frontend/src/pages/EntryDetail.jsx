import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EntryDetail() {
  const { username, id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single()

        if (error || !data) { setNotFound(true); return }
        setEntry(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display font-bold text-3xl text-ink mb-3">Entry not found</h1>
        <button onClick={() => navigate(`/u/${username}`)} className="font-mono text-sm text-accent hover:underline">
          ← Back to @{username}'s changelog
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(`/u/${username}`)}
            className="font-mono text-xs text-muted hover:text-ink transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            @{username}
          </button>
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-ink text-base tracking-tight hover:text-accent transition-colors"
          >
            Dev<span className="text-accent">Log</span>
          </button>
          <button
            onClick={handleCopy}
            className={`font-mono text-xs transition-colors ${copied ? 'text-green-600' : 'text-muted hover:text-ink'}`}
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-muted mb-4">{formatDate(entry.created_at)}</p>

        <h1 className="font-display font-bold text-4xl text-ink leading-tight mb-6">
          {entry.title}
        </h1>

        {entry.summary && (
          <p className="font-body text-lg text-muted leading-relaxed mb-10 border-l-2 border-accent/30 pl-5">
            {entry.summary}
          </p>
        )}

        {entry.bullets && entry.bullets.length > 0 && (
          <div className="mb-10">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Changes</p>
            <div className="space-y-3">
              {(Array.isArray(entry.bullets) ? entry.bullets : []).map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <span className="font-body text-base text-ink leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {entry.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-accent/5 border border-accent/15 rounded-lg font-mono text-xs text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <button
            onClick={() => navigate(`/u/${username}`)}
            className="font-mono text-xs text-muted hover:text-ink transition-colors"
          >
            ← All updates by @{username}
          </button>
          <button
            onClick={handleCopy}
            className={`font-mono text-xs transition-colors flex items-center gap-1.5 ${copied ? 'text-green-600' : 'text-muted hover:text-ink'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Share this entry'}
          </button>
        </div>
      </main>
    </div>
  )
}