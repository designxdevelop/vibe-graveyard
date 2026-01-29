import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getGraves, getGlobalRespects } from '@/server/graves'
import { Gravestone } from '@/components/Gravestone'
import { useHomeRespects } from '@/components/HomeRespectsContext'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [graves, globalRespects] = await Promise.all([
      getGraves(),
      getGlobalRespects(),
    ])
    return { graves, globalRespects }
  },
})

// Random low number for "tests written" (always abysmally low)
function getRandomTestsWritten(projectCount: number) {
  const base = Math.max(10, projectCount * 4)
  const swing = Math.max(6, projectCount * 6)
  const roll = Math.random()
  const skewed = Math.floor(Math.pow(roll, 0.65) * swing)
  return base + skewed
}

function useCountUp(value: number, durationMs = 700) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const target = Math.max(0, Math.floor(value))
    if (target === 0) {
      setDisplayValue(0)
      return
    }

    let startTime: number | null = null
    let rafId = 0

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const nextValue = Math.floor(progress * target)
      setDisplayValue(nextValue)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [value, durationMs])

  return displayValue
}

function HomePage() {
  const { graves, globalRespects } = Route.useLoaderData()
  const testsWritten = useMemo(() => getRandomTestsWritten(graves.length), [graves.length])
  const homeRespects = useHomeRespects()
  const setTotalRespects = homeRespects?.setTotalRespects
  const totalGraves = graves.length
  const totalStars = graves.reduce((acc, g) => acc + (g.starCount || 0), 0)

  const totalGravesDisplay = useCountUp(totalGraves)
  const totalStarsDisplay = useCountUp(totalStars)
  const testsWrittenDisplay = useCountUp(testsWritten)

  useEffect(() => {
    if (!setTotalRespects) return
    setTotalRespects(globalRespects)
    return () => setTotalRespects(null)
  }, [setTotalRespects, globalRespects])

  return (
    <div className="mx-auto px-6 sm:px-10 py-6 sm:py-10" style={{ maxWidth: '75rem' }}>
      {/* Hero section */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl glow-text mb-4 flicker">
          REST IN PEACE
        </h2>
        <p className="readable text-[var(--grave-green-dim)] max-w-xl mx-auto">
          A memorial to vibe-coded projects, shared with great fanfare,
          then quietly abandoned. Here lie the dreams of weekend hackathons
          and "I'll maintain this later" promises.
        </p>
        
        <Link to="/submit" className="pixel-btn inline-block mt-6 text-[10px]">
          SUBMIT A PROJECT
        </Link>
      </div>

      {/* Graveyard grid */}
      {graves.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-base sm:text-lg glow-text-dim mb-4">THE GRAVEYARD IS EMPTY</p>
          <p className="readable text-[var(--grave-green-dim)]">
            No projects are laid to rest yet. Be the first to bury one.
          </p>
        </div>
      ) : (
        <>
          <div className="readable-sm text-[var(--grave-green-dim)] mb-4 text-center">
            {graves.length} PROJECT{graves.length !== 1 ? 'S' : ''} INTERRED
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-10 lg:gap-y-12 lg:gap-x-16">
            {graves.map((grave, index) => (
              <Gravestone key={grave.id} grave={grave} index={index} />
            ))}
          </div>
        </>
      )}

      {/* Sarcastic stats section */}
      <div className="mt-12 sm:mt-16 py-8 border-t-2 border-[var(--grave-green-dim)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">
              {totalGravesDisplay.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TOTAL GRAVES</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">
              {totalStarsDisplay.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">STARS EULOGIZED</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2">∞</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">ROADMAPS ABANDONED</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">
              {testsWrittenDisplay}
            </div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TESTS (ALLEGED)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
