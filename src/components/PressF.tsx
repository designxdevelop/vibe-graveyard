import { useState, useEffect, useCallback } from 'react'
import { useHomeRespects } from '@/components/HomeRespectsContext'
import { incrementGlobalRespects } from '@/server/graves'

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
  const homeRespects = useHomeRespects()
  const totalRespects = homeRespects?.totalRespects ?? null
  const incrementTotalRespects = homeRespects?.incrementTotalRespects
  const setTotalRespects = homeRespects?.setTotalRespects
  const showTotalRespects = totalRespects !== null
  const displayCount = showTotalRespects ? totalRespects : respectCount

  const payRespect = useCallback(async (clientX?: number, clientY?: number) => {
    setRespectCount(prev => prev + 1)
    setIsPressed(true)
    if (showTotalRespects) {
      incrementTotalRespects?.()
      const previousTotal = totalRespects
      try {
        const result = await incrementGlobalRespects()
        if (typeof result?.respectCount === 'number') {
          setTotalRespects?.(result.respectCount)
        }
      } catch {
        setTotalRespects?.(previousTotal)
      }
    }
    
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
  }, [incrementTotalRespects, onRespect, setTotalRespects, showTotalRespects, totalRespects])

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
          className="press-f-float pointer-events-none fixed z-50 text-xl sm:text-2xl glow-text"
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
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40
          left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
          flex items-center gap-2 sm:gap-3
          px-3 py-2.5 sm:px-4 sm:py-3
          max-w-[90vw]
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
            w-7 h-7 sm:w-8 sm:h-8 
            text-xs sm:text-sm font-bold f-keycap
            transition-all duration-150 ease-out
            ${isPressed ? 'scale-90 bg-[var(--grave-green-dim)]' : ''}
          `}
        >
          F
        </kbd>
        <span className="readable-xs sm:readable-sm text-[var(--grave-green-dim)] group-hover:text-[var(--grave-green)] transition-colors duration-150 ease-out">
          PAY RESPECTS
        </span>
        {(showTotalRespects || respectCount > 0) && (
          <span 
            className="text-[9px] sm:text-[10px] text-[var(--grave-green)] tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayCount}
          </span>
        )}
      </button>
    </>
  )
}
