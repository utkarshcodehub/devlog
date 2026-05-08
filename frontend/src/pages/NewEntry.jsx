import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { polishEntry, saveEntry } from '../lib/api'

export default function NewEntry() {
  const navigate = useNavigate()
  const [rawInput, setRawInput] = useState('')
  const [polished, setPolished] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editBullets, setEditBullets] = useState([])
  const [editTags, setEditTags] = useState([])

  const handlePolish = async () => {
    if (!rawInput.trim()) return
    setLoading(true)
    setError('')
    setPolished(null)
    try {
      const result = await polishEntry(rawInput)
      setPolished(result)
      setEditTitle(result.title)
      setEditSummary(result.summary)
      setEditBullets(result.bullets)
      setEditTags(result.tags)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await saveEntry({
        title: editTitle,
        summary: editSummary,
        bullets: editBullets,
        raw_input: rawInput,
        tags: editTags,
        status: 'published',
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateBullet = (index, value) => {
    const updated = [...editBullets]
    updated[index] = value
    setEditBullets(updated)
  }

  const removeBullet = (index) => {
    setEditBullets(editBullets.filter((_, i) => i !== index))
  }

  const removeTag = (index) => {
    setEditTags(editTags.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-mono text-xs text-muted hover:text-ink transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </button>
          <span className="font-display font-bold text-ink text-lg">New Entry</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 font-body text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Raw input */}
        <div className="mb-8">
          <label className="block font-display font-semibold text-ink text-xl mb-1">
            What did you ship?
          </label>
          <p className="font-body text-muted text-sm mb-4">
            Dump your raw notes, bullet points, messy thoughts — the AI will polish them.
          </p>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"- fixed the auth bug that was causing 500s\n- added dark mode toggle\n- rewrote the caching layer, 3x faster now\n- new onboarding flow for first-time users"}
            rows={8}
            className="w-full bg-card border border-border rounded-2xl px-5 py-4 font-mono text-sm text-ink placeholder:text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="font-mono text-xs text-muted">
              {rawInput.trim() ? `${rawInput.trim().split('\n').filter(l => l.trim()).length} lines` : 'Start typing...'}
            </span>
            <button
              onClick={handlePolish}
              disabled={!rawInput.trim() || loading}
              className="px-6 py-2.5 bg-ink text-white font-display font-semibold text-sm rounded-xl hover:bg-ink/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Polishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Polish with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        {polished && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-xs text-accent uppercase tracking-widest">AI-polished result</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Step 2: Polished preview — editable */}
        {polished && (
          <div className="bg-card border border-border rounded-2xl p-8 mb-6">
            {/* Title */}
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full font-display font-bold text-2xl text-ink bg-transparent border-none focus:outline-none focus:ring-0 mb-4 placeholder:text-muted/40"
              placeholder="Entry title"
            />

            {/* Summary */}
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              rows={3}
              className="w-full font-body text-base text-muted bg-transparent border-none focus:outline-none focus:ring-0 resize-none mb-6 placeholder:text-muted/40 leading-relaxed"
              placeholder="Summary..."
            />

            {/* Bullets */}
            <div className="space-y-2 mb-6">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Changes</p>
              {editBullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                  <input
                    value={bullet}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    className="flex-1 font-body text-sm text-ink bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {editTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/5 border border-accent/20 rounded-lg font-mono text-xs text-accent cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => removeTag(i)}
                >
                  {tag}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save actions */}
        {polished && (
          <div className="flex items-center justify-between">
            <button
              onClick={handlePolish}
              disabled={loading}
              className="px-5 py-2.5 border border-border text-muted font-display font-medium text-sm rounded-xl hover:border-ink hover:text-ink transition-all"
            >
              Re-polish
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-accent text-white font-display font-bold text-sm rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  Publish Entry
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}