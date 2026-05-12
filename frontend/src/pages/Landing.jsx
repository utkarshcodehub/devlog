import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DEMO_ENTRIES = [
  {
    date: 'May 13, 2026',
    title: 'Shipped real-time collaboration',
    summary: 'Multiple users can now edit the same document simultaneously with live cursors and conflict resolution.',
    bullets: ['Added WebSocket-based presence layer', 'Built conflict-free merge for concurrent edits', 'Live cursor positions with user avatars'],
    tags: ['websockets', 'collaboration', 'backend'],
  },
  {
    date: 'May 10, 2026',
    title: 'Redesigned onboarding flow',
    summary: 'New users now reach their first meaningful moment 60% faster after a complete rethink of the setup experience.',
    bullets: ['Reduced onboarding steps from 7 to 3', 'Added progress indicator with time estimates', 'Skip options for advanced users'],
    tags: ['ux', 'onboarding', 'growth'],
  },
  {
    date: 'May 7, 2026',
    title: 'Performance overhaul — 3x faster loads',
    summary: 'Aggressive caching, lazy loading, and a new CDN setup dropped median page load from 2.1s to 0.7s.',
    bullets: ['Implemented Redis caching for hot queries', 'Migrated static assets to edge CDN', 'Lazy-loaded all below-fold components'],
    tags: ['performance', 'infrastructure'],
  },
]

const RAW_EXAMPLE = `- fixed the annoying login bug where users got logged out randomly
- added dark mode finally
- rewrote the image upload thing, now 5x faster
- new email notification for comments`

const POLISHED_EXAMPLE = {
  title: 'Faster uploads, dark mode, and stability fixes',
  summary: 'This release focuses on user-facing polish — a long-requested dark mode, significantly faster image processing, and a fix for the session bug affecting active users.',
  bullets: [
    'Fixed intermittent session expiry causing unexpected logouts',
    'Shipped dark mode with system preference detection',
    'Rewrote image upload pipeline — 5x throughput improvement',
    'Added email notifications for comment activity',
  ],
  tags: ['auth', 'dark-mode', 'performance', 'notifications'],
}

export default function Landing() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [showPolished, setShowPolished] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate('/dashboard')
      else setChecking(false)
    })
  }, [navigate])

  const handleDemo = () => {
    setAnimating(true)
    setTimeout(() => {
      setShowPolished(true)
      setAnimating(false)
    }, 1200)
  }

  const handleReset = () => {
    setShowPolished(false)
    setAnimating(false)
  }

  if (checking) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-xl text-ink tracking-tight">
            Dev<span className="text-accent">Log</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 font-display font-medium text-sm text-muted hover:text-ink transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 bg-ink text-white font-display font-bold text-sm rounded-xl hover:bg-ink/80 transition-all"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/5 border border-accent/20 rounded-full font-mono text-xs text-accent mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          
        </div>

        <h1 className="font-display font-bold text-6xl text-ink leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto">
          Your changelog,{' '}
          <span className="text-accent">without the effort</span>
        </h1>

        <p className="font-body text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-10">
          Dump your raw build notes. AI turns them into a polished developer changelog — published, shareable, and embeddable anywhere.
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-ink text-white font-display font-bold text-base rounded-2xl hover:bg-ink/80 transition-all flex items-center gap-2"
          >
            Start for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/u/billybutcher')}
            className="px-8 py-4 border border-border text-ink font-display font-semibold text-base rounded-2xl hover:border-ink transition-all"
          >
            See a live example
          </button>
        </div>

        <p className="font-mono text-xs text-muted">No credit card · Free forever for personal use</p>
      </section>

      {/* Interactive demo */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="border-b border-border px-8 py-5 flex items-center justify-between">
            <p className="font-display font-semibold text-ink text-base">Try it — paste raw notes, see the magic</p>
            {showPolished && (
              <button onClick={handleReset} className="font-mono text-xs text-muted hover:text-ink transition-colors">
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Input side */}
            <div className="p-8">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Raw notes</p>
              <div className="bg-bg border border-border rounded-xl p-4 font-mono text-sm text-ink/70 leading-relaxed whitespace-pre-wrap min-h-[180px]">
                {RAW_EXAMPLE}
              </div>
              {!showPolished && (
                <button
                  onClick={handleDemo}
                  disabled={animating}
                  className="mt-4 w-full py-3 bg-ink text-white font-display font-bold text-sm rounded-xl hover:bg-ink/80 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {animating ? (
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
              )}
            </div>

            {/* Output side */}
            <div className="p-8">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Polished result</p>
              {!showPolished ? (
                <div className="min-h-[180px] flex items-center justify-center">
                  <p className="font-mono text-xs text-muted/50 text-center">
                    {animating ? 'AI is writing...' : 'Click "Polish with AI" to see the result'}
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="font-display font-bold text-lg text-ink mb-2">{POLISHED_EXAMPLE.title}</h3>
                  <p className="font-body text-sm text-muted leading-relaxed mb-4">{POLISHED_EXAMPLE.summary}</p>
                  <div className="space-y-1.5 mb-4">
                    {POLISHED_EXAMPLE.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="font-body text-sm text-ink">{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POLISHED_EXAMPLE.tags.map((t, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-ink mb-4">How it works</h2>
          <p className="font-body text-muted text-lg max-w-xl mx-auto">Three steps from raw notes to published changelog.</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Dump your notes',
              desc: 'Paste messy bullet points, half-sentences, whatever you have. No formatting required.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
            },
            {
              step: '02',
              title: 'AI polishes it',
              desc: 'Groq rewrites your notes into a structured changelog with title, summary, bullets, and tags.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              ),
            },
            {
              step: '03',
              title: 'Share everywhere',
              desc: 'Publish to your public profile, embed on any site with one script tag, or subscribe via RSS.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.step} className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  {item.icon}
                </div>
                <span className="font-mono text-3xl font-bold text-ink/10">{item.step}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">{item.title}</h3>
              <p className="font-body text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live changelog preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-ink mb-4">Your public changelog</h2>
          <p className="font-body text-muted text-lg max-w-xl mx-auto">
            Every entry lives at <code className="font-mono text-sm bg-card border border-border px-2 py-0.5 rounded-lg text-accent">devlog-wheat.vercel.app/u/username</code>
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          {/* Fake browser bar */}
          <div className="border-b border-border bg-bg px-6 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 bg-card border border-border rounded-lg px-4 py-1.5 font-mono text-xs text-muted text-center">
              devlog-wheat.vercel.app/u/yourname
            </div>
          </div>

          {/* Fake profile */}
          <div className="p-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border">
              <div className="w-14 h-14 bg-ink rounded-2xl flex items-center justify-center">
                <span className="font-display font-bold text-xl text-white">Y</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-3xl text-ink">@yourname</h3>
                <p className="font-body text-muted text-sm">3 updates published</p>
              </div>
            </div>

            <div className="space-y-8">
              {DEMO_ENTRIES.map((entry, i) => (
                <div key={i} className="relative pl-7 before:absolute before:left-[6px] before:top-[24px] before:bottom-0 before:w-px before:bg-border last:before:hidden">
                  <div className="absolute left-0 top-[5px] w-[13px] h-[13px] rounded-full border-2 border-accent bg-card" />
                  <p className="font-mono text-xs text-muted mb-1">{entry.date}</p>
                  <h4 className="font-display font-bold text-lg text-ink mb-1">{entry.title}</h4>
                  <p className="font-body text-sm text-muted mb-3 leading-relaxed">{entry.summary}</p>
                  <div className="space-y-1 mb-3">
                    {entry.bullets.map((b, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-1.5 shrink-0" />
                        <span className="font-body text-sm text-ink/80">{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {entry.tags.map((t, j) => (
                      <span key={j} className="px-2 py-0.5 bg-accent/5 border border-accent/15 rounded-md font-mono text-xs text-accent/70">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 gap-6">
          {[
            {
              title: 'Embeddable widget',
              desc: 'One script tag. Your changelog renders on any site, portfolio, or docs page automatically.',
              code: '<script src="devlog.app/widget.js" data-username="you"></script>',
            },
            {
              title: 'RSS feed',
              desc: 'Every profile generates a valid RSS feed. Readers can subscribe and get updates automatically.',
              code: 'devlog-wheat.vercel.app/rss/yourname',
            },
            {
              title: 'Shareable entry links',
              desc: 'Each entry has its own page. Share individual updates on Twitter, LinkedIn, or anywhere.',
              code: 'devlog-wheat.vercel.app/u/you/entry-id',
            },
            {
              title: 'Draft & publish control',
              desc: 'Write in private, publish when ready. Toggle any entry between draft and published instantly.',
              code: 'status: draft → published',
            },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl text-ink mb-2">{f.title}</h3>
              <p className="font-body text-sm text-muted leading-relaxed mb-4">{f.desc}</p>
              <div className="bg-bg border border-border rounded-xl px-4 py-2.5 font-mono text-xs text-muted overflow-x-auto">
                {f.code}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-ink rounded-3xl p-16 text-center">
          <h2 className="font-display font-bold text-5xl text-white mb-4 leading-tight">
            Start shipping in public
          </h2>
          <p className="font-body text-white/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Stop keeping your builds private. Every update you ship is worth sharing — let AI do the writing.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-white text-ink font-display font-bold text-base rounded-2xl hover:bg-white/90 transition-all inline-flex items-center gap-2"
          >
            Create your changelog
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="font-mono text-xs text-white/30 mt-4">Free · No credit card · Takes 30 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-display font-bold text-ink text-lg tracking-tight">
            Dev<span className="text-accent">Log</span>
          </span>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/u/billybutcher')} className="font-mono text-xs text-muted hover:text-ink transition-colors">
              Live demo
            </button>
            <button onClick={() => navigate('/signup')} className="font-mono text-xs text-muted hover:text-ink transition-colors">
              Sign up
            </button>
            <button onClick={() => navigate('/login')} className="font-mono text-xs text-muted hover:text-ink transition-colors">
              Sign in
            </button>
          </div>
          <p className="font-mono text-xs text-muted"></p>
        </div>
      </footer>
    </div>
  )
}