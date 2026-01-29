import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="relative z-10 py-4 sm:py-6 px-4">
      <nav className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/" className="group">
          <h1 className="text-base sm:text-lg md:text-xl glow-text flicker tracking-tight">
            VIBE GRAVEYARD
          </h1>
          <p className="text-[9px] sm:text-[8px] text-[var(--grave-green-dim)] mt-1">
            WHERE ABANDONED PROJECTS REST IN PEACE
          </p>
        </Link>
        
        <div className="flex gap-4 text-[10px] sm:text-[9px]">
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
        </div>
      </nav>
    </header>
  )
}
