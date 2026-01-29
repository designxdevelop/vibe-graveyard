import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getGrave, parseTechStack, payRespects } from '@/server/graves'

export const Route = createFileRoute('/grave/$id')({
  component: GraveDetailPage,
  loader: async ({ params }) => {
    const grave = await getGrave({ data: params.id })
    if (!grave) {
      throw notFound()
    }
    return grave
  },
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl glow-text mb-4">GRAVE NOT FOUND</h2>
      <p className="text-[10px] text-[var(--grave-green-dim)] mb-8">
        This project may have been resurrected... or never existed.
      </p>
      <Link to="/" className="pixel-btn text-[10px]">
        RETURN TO GRAVEYARD
      </Link>
    </div>
  ),
})

interface FloatingF {
  id: number
  x: number
  y: number
}

function GraveDetailPage() {
  const grave = Route.useLoaderData()
  const techStack = parseTechStack(grave)
  
  const [respectCount, setRespectCount] = useState(grave.respectCount ?? 0)
  const [floatingFs, setFloatingFs] = useState<FloatingF[]>([])
  const [isPressed, setIsPressed] = useState(false)

  // Calculate time dead
  const deathDate = new Date(grave.deathDate)
  const birthDate = new Date(grave.birthDate)
  const now = new Date()
  const daysDead = Math.floor(
    (now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysAlive = Math.floor(
    (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const handlePayRespects = useCallback(async (clientX?: number, clientY?: number) => {
    // Optimistic update
    setRespectCount(prev => prev + 1)
    setIsPressed(true)
    
    // Create floating F
    const id = Date.now()
    const x = clientX ?? window.innerWidth / 2
    const y = clientY ?? window.innerHeight / 2
    setFloatingFs(prev => [...prev, { id, x, y }])
    
    // Remove floating F after animation
    setTimeout(() => {
      setFloatingFs(prev => prev.filter(f => f.id !== id))
    }, 1000)
    
    // Reset pressed state
    setTimeout(() => setIsPressed(false), 150)
    
    // Persist to database
    try {
      const result = await payRespects({ data: grave.id })
      setRespectCount(result.respectCount)
    } catch (err) {
      // Revert on error
      setRespectCount(prev => prev - 1)
    }
  }, [grave.id])

  // Keyboard listener for F key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !e.repeat &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        handlePayRespects()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePayRespects])

  const shareText = encodeURIComponent(
    `RIP ${grave.name} (${grave.birthDate} - ${grave.deathDate}). ${grave.causeOfDeath}. F to pay respects. #VibeGraveyard`
  )

  return (
    <>
      {/* Floating F animations */}
      {floatingFs.map(f => (
        <div
          key={f.id}
          className="press-f-float pointer-events-none fixed z-50 text-2xl glow-text"
          style={{
            left: f.x,
            top: f.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          F
        </div>
      ))}
      
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] mb-8 inline-block transition-colors duration-150 ease"
      >
        ← BACK TO GRAVEYARD
      </Link>

      {/* Main gravestone */}
      <div className="pixel-border bg-[var(--grave-darker)] p-8 text-center">
        <div className="text-[12px] tracking-[0.5em] mb-4 opacity-60">
          R.I.P.
        </div>

        <h1 className="text-2xl md:text-3xl glow-text mb-4 break-words">
          {grave.name}
        </h1>

        <div className="text-sm mb-6">
          <span>{grave.birthDate}</span>
          <span className="mx-3">—</span>
          <span>{grave.deathDate}</span>
        </div>

        <div className="border-t-2 border-b-2 border-[var(--grave-green-dim)] py-6 my-6">
          <p className="text-sm italic leading-relaxed">"{grave.epitaph}"</p>
        </div>

        <div className="text-[10px] text-[var(--grave-red)] mb-6 uppercase tracking-wider">
          CAUSE OF DEATH: {grave.causeOfDeath}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-[8px] px-3 py-1 bg-[var(--grave-green-dim)] text-[var(--grave-green)]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-center py-4 border-t border-[var(--grave-green-dim)]">
          <div>
            <div className="text-lg glow-text tabular-nums">{grave.starCount?.toLocaleString() || '?'}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">STARS</div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{daysAlive.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">
              DAYS ALIVE
            </div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{daysDead.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">
              DAYS DEAD
            </div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{respectCount.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">
              RESPECTS
            </div>
          </div>
        </div>
      </div>

      {/* Ground */}
      <div className="h-4 bg-[var(--grave-grass)]" />
      <div className="h-3 bg-[var(--grave-dirt)]" />

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={grave.url}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn text-[10px] text-center"
        >
          VISIT REMAINS
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn text-[10px] text-center"
          style={{
            background: 'var(--grave-purple)',
            boxShadow: '4px 4px 0 0 #4b0082',
          }}
        >
          SHARE ON X
        </a>
      </div>

      {/* Press F to pay respects */}
      <div className="mt-8 text-center">
        <button
          onClick={(e) => handlePayRespects(e.clientX, e.clientY)}
          className={`
            pixel-btn text-[10px] inline-flex items-center gap-3
            transition-transform duration-150 ease-out
            ${isPressed ? 'scale-95' : 'scale-100'}
          `}
          style={{ touchAction: 'manipulation' }}
        >
          <kbd 
            className={`
              inline-flex items-center justify-center
              w-6 h-6 
              bg-[var(--grave-black)] text-[var(--grave-green)]
              text-xs font-bold border border-[var(--grave-green)]
              transition-all duration-150 ease-out
              ${isPressed ? 'scale-90' : ''}
            `}
          >
            F
          </kbd>
          PAY RESPECTS
        </button>
        <p className="readable-xs text-[var(--grave-green-dim)] mt-2">
          Press F or click to pay respects
        </p>
      </div>

      {/* Submitted by */}
      {grave.submittedBy && (
        <p className="readable-xs text-[var(--grave-green-dim)] text-center mt-8">
          Submitted by: {grave.submittedBy}
        </p>
      )}
    </div>
    </>
  )
}
