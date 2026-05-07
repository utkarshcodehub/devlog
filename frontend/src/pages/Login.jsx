import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[45%] bg-ink flex-col justify-between p-14 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-2xl text-white tracking-tight">devlog</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-display text-7xl font-extrabold text-white leading-[0.9] mb-8">
            Ship.<br/>Log.<br/>Share.
          </p>
          <p className="text-white/40 font-body text-base max-w-xs leading-relaxed">
            Your public changelog, written in seconds. Paste raw bullet points, get polished prose.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-px bg-white/20" />
          <span className="font-mono text-white/25 text-xs">21-day build challenge — day 15</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="font-mono text-xs text-accent mb-3 tracking-widest uppercase">Welcome back</p>
            <h1 className="font-display font-bold text-4xl text-ink leading-tight">Sign in to DevLog</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-body font-medium text-sm text-ink mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-ink font-body text-sm placeholder-muted/50 focus:border-ink transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block font-body font-medium text-sm text-ink mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-ink font-body text-sm placeholder-muted/50 focus:border-ink transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-body">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-ink text-white font-display font-semibold text-sm rounded-xl hover:bg-accent transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="mt-8 text-center text-muted font-body text-sm">
            No account?{' '}
            <Link to="/signup" className="text-ink font-semibold hover:text-accent transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
