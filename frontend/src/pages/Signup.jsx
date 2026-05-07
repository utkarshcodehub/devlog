import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[45%] bg-accent flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative z-10 flex items-center gap-1.5">
          <span className="font-display font-bold text-2xl text-white tracking-tight">devlog</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <p className="font-display text-7xl font-extrabold text-white leading-[0.9] mb-8">
            Start<br/>logging<br/>today.
          </p>
          <p className="text-white/60 font-body text-base max-w-xs leading-relaxed">
            Get a public changelog at <span className="text-white font-semibold">devlog.app/u/yourname</span>. Free forever.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-px bg-white/30" />
          <span className="font-mono text-white/40 text-xs">14 projects → 1 real SaaS</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="font-mono text-xs text-accent mb-3 tracking-widest uppercase">New account</p>
            <h1 className="font-display font-bold text-4xl text-ink leading-tight">Create your DevLog</h1>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block font-body font-medium text-sm text-ink mb-1.5">
                Username <span className="text-muted font-normal">(your public handle)</span>
              </label>
              <div className="flex">
                <span className="px-3 py-3 border border-r-0 border-border rounded-l-xl bg-bg text-muted font-mono text-xs flex items-center whitespace-nowrap">
                  /u/
                </span>
                <input
                  type="text" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  required minLength={3}
                  className="flex-1 px-4 py-3 border border-border rounded-r-xl bg-card text-ink font-mono text-sm placeholder-muted/50 focus:border-ink transition-colors"
                  placeholder="yourhandle"
                />
              </div>
            </div>
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
                type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-ink font-body text-sm placeholder-muted/50 focus:border-ink transition-colors"
                placeholder="Min 6 characters"
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
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="mt-8 text-center text-muted font-body text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-semibold hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
