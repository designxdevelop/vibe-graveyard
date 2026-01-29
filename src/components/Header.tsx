import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="relative z-10 py-6 px-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="group">
          <h1 className="text-lg md:text-xl glow-text flicker tracking-tight">
            VIBE GRAVEYARD
          </h1>
          <p className="text-[8px] text-[var(--grave-green-dim)] mt-1">
            WHERE ABANDONED PROJECTS REST
          </p>
        </Link>
        
        <div className="flex gap-4 text-[10px]">
          <Link 
            to="/" 
            className="hover:text-[var(--grave-green)] transition-colors glow-text-dim"
            activeProps={{ className: 'glow-text' }}
          >
            [GRAVES]
          </Link>
          <Link 
            to="/submit" 
            className="hover:text-[var(--grave-green)] transition-colors glow-text-dim"
            activeProps={{ className: 'glow-text' }}
          >
            [SUBMIT]
          </Link>
          <Link 
            to="/admin" 
            className="hover:text-[var(--grave-green)] transition-colors opacity-50 hover:opacity-100"
            activeProps={{ className: 'glow-text opacity-100' }}
          >
            [ADMIN]
          </Link>
        </div>
      </nav>
    </header>
  )
}
