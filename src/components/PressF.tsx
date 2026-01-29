import { useState, useEffect, useCallback } from 'react'

interface PressFProps {
  onRespect?: () => void
}

interface FloatingF {
  id: number
  x: number
  y: number
}

export function PressF({ onRespect }: PressFProps) {
  const [respectCount, setRespectCount] = useState(0)
  const [floatingFs, setFloatingFs] = useState<FloatingF[]>([])
  const [isPressed, setIsPressed] = useState(false)

  const payRespect = useCallback((clientX?: number, clientY?: number) => {
    setRespectCount(prev => prev + 1)
    setIsPressed(true)
    
    // Create floating F animation
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
    
    onRespect?.()
  }, [onRespect])

  // Keyboard listener for "F" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !e.repeat && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        payRespect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [payRespect])

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

      {/* Press F button/indicator */}
      <button
        onClick={(e) => payRespect(e.clientX, e.clientY)}
        className={`
          press-f-btn group
          fixed bottom-6 right-6 z-40
          flex items-center gap-3
          px-4 py-3
          bg-[var(--grave-darker)] 
          border-2 border-[var(--grave-green-dim)]
          transition-transform duration-150 ease-out
          ${isPressed ? 'scale-95' : 'scale-100'}
        `}
        style={{ touchAction: 'manipulation' }}
        aria-label="Press F to pay respects"
      >
        <kbd 
          className={`
            inline-flex items-center justify-center
            w-8 h-8 
            bg-[var(--grave-green)] text-[var(--grave-black)]
            text-sm font-bold
            transition-all duration-150 ease-out
            ${isPressed ? 'scale-90 bg-[var(--grave-green-dim)]' : ''}
          `}
        >
          F
        </kbd>
        <span className="readable-sm text-[var(--grave-green-dim)] group-hover:text-[var(--grave-green)] transition-colors duration-150 ease">
          PAY RESPECTS
        </span>
        {respectCount > 0 && (
          <span 
            className="readable-xs text-[var(--grave-green)] tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {respectCount}
          </span>
        )}
      </button>
    </>
  )
}
