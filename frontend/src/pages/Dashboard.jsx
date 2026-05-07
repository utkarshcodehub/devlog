import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [session])

  const username = profile?.username || session?.user?.user_metadata?.username || 'developer'

  return (
    <div className="min-h-screen bg-bg">
      <Navbar session={session} username={username} />

      <main className="max-w-4xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-xs text-muted bg-card border border-border px-3 py-1 rounded-full">
              devlog.app/u/{username}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              live
            </span>
          </div>
          <h1 className="font-display font-extrabold text-6xl text-ink leading-none mb-4">
            Your Changelog
          </h1>
          <p className="text-muted font-body text-lg">
            Log what you ship. AI polishes it. The world sees it.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total entries', value: '0', sub: 'all time' },
            { label: 'Published',     value: '0', sub: 'public'   },
            { label: 'Profile views', value: '—', sub: 'coming soon' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-6">
              <p className="font-display font-bold text-4xl text-ink">{stat.value}</p>
              <p className="font-body text-sm text-ink mt-1">{stat.label}</p>
              <p className="font-mono text-xs text-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="border-2 border-dashed border-border rounded-3xl p-20 text-center">
          <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-2xl text-ink mb-3">No entries yet</h3>
          <p className="text-muted font-body text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Tomorrow's build adds the AI writing pipeline — paste raw bullet points, get a polished changelog entry in seconds.
          </p>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent/5 border border-accent/20 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-accent">Day 16: AI entry pipeline — coming tomorrow</span>
          </div>
        </div>

        {/* Week plan preview */}
        <div className="mt-12 bg-card border border-border rounded-2xl p-8">
          <p className="font-mono text-xs text-muted mb-6 uppercase tracking-widest">This week's build plan</p>
          <div className="space-y-3">
            {[
              { day: 15, label: 'Auth + Skeleton',              done: true  },
              { day: 16, label: 'AI Entry Writer',              done: false },
              { day: 17, label: 'Public Profile Page',         done: false },
              { day: 18, label: 'Dashboard CRUD',              done: false },
              { day: 19, label: 'Embeddable JS Widget',        done: false },
              { day: 20, label: 'RSS Feed + Shareable Links',  done: false },
              { day: 21, label: 'Landing Page + Ship',         done: false },
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
