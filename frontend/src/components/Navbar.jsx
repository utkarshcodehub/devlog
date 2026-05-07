import { supabase } from '../lib/supabase'

export default function Navbar({ session, username }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="border-b border-border bg-card px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-1.5">
        <span className="font-display font-bold text-xl text-ink tracking-tight">devlog</span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      </div>
      <div className="flex items-center gap-6">
        {username && (
          <span className="font-mono text-xs text-muted bg-bg border border-border px-3 py-1 rounded-full">
            /u/{username}
          </span>
        )}
        <span className="font-body text-sm text-muted hidden sm:block">
          {session?.user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-muted hover:text-accent transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
