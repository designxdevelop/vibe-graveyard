import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getGrave, parseTechStack, payRespects } from '@/server/graves'
import { GravestoneSVG } from '@/components/GravestoneSVG'

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
      <p className="readable text-[var(--grave-green-dim)] mb-8">
        This project may have been resurrected... or never existed.
      </p>
      <Link to="/" className="pixel-btn readable-sm">
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

  // Create a modified grave object with current respect count for display
  const displayGrave = { ...grave, respectCount }

  const handlePayRespects = useCallback(async (clientX?: number, clientY?: number) => {
    setRespectCount(prev => prev + 1)
    setIsPressed(true)
    
    const id = Date.now()
    const x = clientX ?? window.innerWidth / 2
    const y = clientY ?? window.innerHeight / 2
    setFloatingFs(prev => [...prev, { id, x, y }])
    
    setTimeout(() => {
      setFloatingFs(prev => prev.filter(f => f.id !== id))
    }, 1000)
    
    setTimeout(() => setIsPressed(false), 150)
    
    try {
      const result = await payRespects({ data: grave.id })
      setRespectCount(result.respectCount)
    } catch (err) {
      setRespectCount(prev => prev - 1)
    }
  }, [grave.id])

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
      
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          to="/"
          className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] mb-6 inline-block transition-colors duration-150 ease"
        >
          ← BACK TO GRAVEYARD
        </Link>

        {/* Main gravestone using shared component */}
        <div className="mb-6">
          <GravestoneSVG grave={displayGrave} size="large" showRespects={false} />
        </div>

        {/* Cause of death */}
        <div className="text-center mb-6">
          <div className="readable-sm text-[var(--grave-red)] uppercase tracking-wider">
            CAUSE OF DEATH
          </div>
          <div className="readable text-[var(--grave-red)] mt-1">
            {grave.causeOfDeath}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center py-4 mb-6 border-t border-b border-[var(--grave-green-dim)]">
          <div>
            <div className="text-lg glow-text tabular-nums">{grave.starCount?.toLocaleString() || '?'}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">STARS</div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{daysAlive.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">DAYS ALIVE</div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{daysDead.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">DAYS DEAD</div>
          </div>
          <div>
            <div className="text-lg glow-text tabular-nums">{respectCount.toLocaleString()}</div>
            <div className="readable-xs text-[var(--grave-green-dim)]">RESPECTS</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href={grave.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn readable-sm text-center"
          >
            VISIT REMAINS
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn readable-sm text-center"
            style={{
              background: 'var(--grave-purple)',
              boxShadow: '4px 4px 0 0 #4b0082',
            }}
          >
            SHARE ON X
          </a>
        </div>

        {/* Press F to pay respects */}
        <div className="text-center">
          <button
            onClick={(e) => handlePayRespects(e.clientX, e.clientY)}
            className={`
              pixel-btn readable-sm inline-flex items-center gap-3
              transition-transform duration-150 ease-out
              ${isPressed ? 'scale-95' : 'scale-100'}
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <kbd 
              className={`
                inline-flex items-center justify-center
                w-7 h-7 
                bg-[var(--grave-black)] text-[var(--grave-green)]
                font-bold border-2 border-[var(--grave-green)]
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
