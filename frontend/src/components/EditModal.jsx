import { useState, useEffect } from 'react'
import { updateEntry } from '../lib/api'

export default function EditModal({ entry, onClose, onSaved }) {
  const [title, setTitle] = useState(entry.title)
  const [summary, setSummary] = useState(entry.summary || '')
  const [bullets, setBullets] = useState(Array.isArray(entry.bullets) ? entry.bullets : [])
  const [tags, setTags] = useState(Array.isArray(entry.tags) ? entry.tags : [])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const updateBullet = (i, val) => {
    const updated = [...bullets]
    updated[i] = val
    setBullets(updated)
  }

  const removeBullet = (i) => setBullets(bullets.filter((_, idx) => idx !== i))

  const addBullet = () => setBullets([...bullets, ''])

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!tags.includes(tag)) setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (i) => setTags(tags.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const updated = await updateEntry(entry.id, {
        title: title.trim(),
        summary: summary.trim(),
        bullets: bullets.filter(b => b.trim()),
        tags,
      })
      onSaved(updated.entry)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <h2 className="font-display font-bold text-lg text-ink">Edit Entry</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-border flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 font-body text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-display font-semibold text-lg text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              placeholder="Entry title"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-2">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-body text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all leading-relaxed"
              placeholder="Short summary of this update..."
            />
          </div>

          {/* Bullets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs text-muted uppercase tracking-widest">Changes</label>
              <button
                onClick={addBullet}
                className="font-mono text-xs text-accent hover:text-accent/70 transition-colors"
              >
                + Add bullet
              </button>
            </div>
            <div className="space-y-2">
              {bullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <input
                    value={bullet}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                    placeholder="What changed..."
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {bullets.length === 0 && (
                <p className="font-mono text-xs text-muted/60 italic">No bullets — click "+ Add bullet" above</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/5 border border-accent/20 rounded-lg font-mono text-xs text-accent cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                  onClick={() => removeTag(i)}
                >
                  {tag}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              placeholder="Type a tag and press Enter..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-8 py-5 flex items-center justify-between rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-border text-muted font-display font-medium text-sm rounded-xl hover:border-ink hover:text-ink transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-7 py-2.5 bg-accent text-white font-display font-bold text-sm rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}