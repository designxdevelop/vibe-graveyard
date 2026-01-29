import { useEffect, useState, useCallback, useRef } from 'react'

interface Ghost {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  speed: number
  opacity: number
  fadeState: 'in' | 'visible' | 'out'
}

// Check if mobile (client-side only)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  
  return isMobile
}

export function GraveyardBackground() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number; size: number }[]>([])
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const ghostIdRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)
  const isMobile = useIsMobile()

  const getRandomPosition = useCallback(() => ({
    x: 5 + Math.random() * 90,
    y: 8 + Math.random() * 65,
  }), [])

  const createGhost = useCallback((mobile: boolean): Ghost => {
    const start = getRandomPosition()
    const target = getRandomPosition()
    // Smaller ghosts on mobile
    const baseSize = mobile ? 20 : 28
    const sizeRange = mobile ? 16 : 28
    return {
      id: ghostIdRef.current++,
      x: start.x,
      y: start.y,
      targetX: target.x,
      targetY: target.y,
      size: baseSize + Math.random() * sizeRange,
      speed: 0.0004 + Math.random() * 0.0006, // Very slow, dreamy drift
      opacity: 0,
      fadeState: 'in' as const,
    }
  }, [getRandomPosition])

  useEffect(() => {
    // Generate random stars with varying sizes (fewer on mobile)
    const starCount = isMobile ? 50 : 100
    const newStars = Array.from({ length: starCount }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 55,
      delay: Math.random() * 5,
      size: Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1,
    }))
    setStars(newStars)

    // Initialize with fewer, more subtle ghosts on mobile
    const ghostCount = isMobile ? 3 : 6
    const maxOpacity = isMobile ? 0.25 : 0.4
    const initialGhosts = Array.from({ length: ghostCount }, () => {
      const ghost = createGhost(isMobile)
      ghost.opacity = 0.15 + Math.random() * maxOpacity
      ghost.fadeState = 'visible'
      return ghost
    })
    setGhosts(initialGhosts)
  }, [createGhost, isMobile])

  // Main animation loop - ghosts float toward targets
  useEffect(() => {
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTime, 50) // Cap delta to avoid jumps
      lastTime = currentTime

      setGhosts(prev => {
        return prev.map(ghost => {
          let { x, y, targetX, targetY, opacity, fadeState } = ghost

          // Move toward target
          const dx = targetX - x
          const dy = targetY - y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 1) {
            // Move toward target with very subtle wobble
            const wobbleX = Math.sin(currentTime * 0.00015 + ghost.id * 2) * 0.02
            const wobbleY = Math.cos(currentTime * 0.0002 + ghost.id * 1.5) * 0.015
            x += (dx / distance) * ghost.speed * deltaTime + wobbleX
            y += (dy / distance) * ghost.speed * deltaTime + wobbleY
          } else {
            // Reached target, pick new random target
            const newTarget = { x: 5 + Math.random() * 90, y: 8 + Math.random() * 65 }
            targetX = newTarget.x
            targetY = newTarget.y
          }

          // Handle fading (slower, lower max on mobile)
          const maxOpacity = 0.35
          if (fadeState === 'in') {
            opacity = Math.min(opacity + 0.003 * (deltaTime / 16), maxOpacity)
            if (opacity >= maxOpacity) {
              fadeState = 'visible'
            }
          } else if (fadeState === 'out') {
            opacity = Math.max(opacity - 0.002 * (deltaTime / 16), 0)
          }

          // Add very gentle bobbing
          const bobY = Math.sin(currentTime * 0.0003 + ghost.id) * 0.05

          return { ...ghost, x, y: y + bobY * 0.1, targetX, targetY, opacity, fadeState }
        }).filter(g => !(g.fadeState === 'out' && g.opacity <= 0))
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Spawn/despawn ghosts periodically
  useEffect(() => {
    const maxGhosts = isMobile ? 4 : 8
    const spawnInterval = setInterval(() => {
      setGhosts(prev => {
        let updated = [...prev]

        // Randomly fade out a visible ghost (more aggressive on mobile)
        const visibleGhosts = updated.filter(g => g.fadeState === 'visible')
        const minGhosts = isMobile ? 2 : 3
        if (visibleGhosts.length > minGhosts && Math.random() < 0.3) {
          const ghostToFade = visibleGhosts[Math.floor(Math.random() * visibleGhosts.length)]
          updated = updated.map(g =>
            g.id === ghostToFade.id ? { ...g, fadeState: 'out' as const } : g
          )
        }

        // Spawn new ghost if we have room (less frequent on mobile)
        const activeGhosts = updated.filter(g => g.fadeState !== 'out' || g.opacity > 0)
        const spawnChance = isMobile ? 0.3 : 0.5
        if (activeGhosts.length < maxGhosts && Math.random() < spawnChance) {
          updated.push(createGhost(isMobile))
        }

        return updated
      })
    }, 8000) // Slower spawn/despawn cycle

    return () => clearInterval(spawnInterval)
  }, [createGhost, isMobile])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Dark gradient sky with atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #000000 0%, #030806 15%, #061008 40%, #0a180a 70%, #0f200f 100%)',
        }}
      />

      {/* Subtle noise texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#00ff00',
            boxShadow: star.size > 2 ? '0 0 6px #00ff00' : undefined,
            animation: `twinkle ${2.5 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Floating pixel ghosts */}
      {ghosts.map((ghost) => (
        <div
          key={`ghost-${ghost.id}`}
          className="bg-ghost-sprite"
          style={{
            position: 'absolute',
            left: `${ghost.x}%`,
            top: `${ghost.y}%`,
            width: `${ghost.size}px`,
            height: `${ghost.size}px`,
            opacity: ghost.opacity,
            filter: `drop-shadow(0 0 ${4 + ghost.size * 0.1}px rgba(0, 255, 0, 0.2))`,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <svg
            viewBox="0 0 16 16"
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
          >
            {/* Ghost body - pixel art style */}
            <rect x="5" y="1" width="6" height="1" fill="#00ff00" />
            <rect x="4" y="2" width="8" height="1" fill="#00ff00" />
            <rect x="3" y="3" width="10" height="1" fill="#00ff00" />
            <rect x="2" y="4" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="5" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="6" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="7" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="8" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="9" width="12" height="1" fill="#00ff00" />
            <rect x="2" y="10" width="12" height="1" fill="#00ff00" />
            {/* Wavy bottom */}
            <rect x="2" y="11" width="3" height="1" fill="#00ff00" />
            <rect x="6" y="11" width="4" height="1" fill="#00ff00" />
            <rect x="11" y="11" width="3" height="1" fill="#00ff00" />
            <rect x="2" y="12" width="2" height="1" fill="#00ff00" />
            <rect x="7" y="12" width="2" height="1" fill="#00ff00" />
            <rect x="12" y="12" width="2" height="1" fill="#00ff00" />
            {/* Eyes */}
            <rect x="4" y="5" width="2" height="3" fill="#0a0a0a" />
            <rect x="10" y="5" width="2" height="3" fill="#0a0a0a" />
            {/* Eye shine */}
            <rect x="4" y="5" width="1" height="1" fill="#003300" />
            <rect x="10" y="5" width="1" height="1" fill="#003300" />
          </svg>
        </div>
      ))}

      {/* Pixel moon with glow */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '7%',
          width: '70px',
          height: '70px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffdd 0%, #ddddaa 35%, #aaaa77 65%, #888855 100%)',
            boxShadow: '0 0 50px #ffff0033, 0 0 100px #ffff0022, 0 0 150px #ffff0011',
          }}
        >
          {/* Craters */}
          <div style={{ position: 'absolute', top: '20%', left: '38%', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#999977' }} />
          <div style={{ position: 'absolute', top: '48%', left: '20%', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#999977' }} />
          <div style={{ position: 'absolute', top: '60%', left: '58%', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#888866' }} />
          <div style={{ position: 'absolute', top: '30%', left: '62%', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#888866' }} />
        </div>
      </div>

      {/* Ground fog layers */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '250px',
          background: 'linear-gradient(0deg, rgba(0,50,0,0.12) 0%, rgba(0,30,0,0.06) 40%, transparent 100%)',
        }}
      />

      {/* Distant tree silhouettes */}
      <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '120px', opacity: 0.22 }}>
        <svg viewBox="0 0 500 60" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
          <path
            d="M0,60 L0,48 L10,35 L20,48 L30,22 L40,48 L50,40 L60,48 L60,60 Z
               M85,60 L85,42 L98,18 L111,42 L124,30 L137,42 L137,60 Z
               M170,60 L170,45 L182,25 L194,45 L206,32 L218,45 L218,60 Z
               M260,60 L260,50 L270,32 L280,50 L290,20 L300,50 L310,38 L320,50 L320,60 Z
               M360,60 L360,40 L375,15 L390,40 L405,28 L420,40 L420,60 Z
               M455,60 L455,48 L465,30 L475,48 L485,38 L495,48 L500,45 L500,60 Z"
            fill="#001800"
          />
        </svg>
      </div>
    </div>
  )
}
