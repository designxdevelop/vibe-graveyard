import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getGrave, parseTechStack, payRespects } from '@/server/graves'
import { Github, ExternalLink, Share2, Calendar, Skull, Clock } from 'lucide-react'

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
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💀</div>
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

  // Calculate time statistics
  const deathDate = new Date(grave.deathDate)
  const birthDate = new Date(grave.birthDate)
  const now = new Date()
  const daysDead = Math.floor(
    (now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysAlive = Math.floor(
    (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handlePayRespects = useCallback(
    async (clientX?: number, clientY?: number) => {
      setRespectCount((prev) => prev + 1)
      setIsPressed(true)

      const id = Date.now()
      const x = clientX ?? window.innerWidth / 2
      const y = clientY ?? window.innerHeight / 2
      setFloatingFs((prev) => [...prev, { id, x, y }])

      setTimeout(() => {
        setFloatingFs((prev) => prev.filter((f) => f.id !== id))
      }, 1000)

      setTimeout(() => setIsPressed(false), 150)

      try {
        const result = await payRespects({ data: grave.id })
        setRespectCount(result.respectCount)
      } catch {
        setRespectCount((prev) => prev - 1)
      }
    },
    [grave.id]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'f' &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        handlePayRespects()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePayRespects])

  const shareText = encodeURIComponent(
    `RIP ${grave.name} (${grave.birthDate} - ${grave.deathDate}). ${grave.causeOfDeath}. Press F to pay respects. #VibeGraveyard`
  )

  return (
    <>
      {/* Floating F animations */}
      {floatingFs.map((f) => (
        <div
          key={f.id}
          className="press-f-float pointer-events-none fixed z-50 text-3xl glow-text"
          style={{
            left: f.x,
            top: f.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          F
        </div>
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back link */}
        <Link
          to="/"
          className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] mb-8 inline-flex items-center gap-2 transition-colors duration-150"
        >
          <span>←</span>
          <span>BACK TO GRAVEYARD</span>
        </Link>

        {/* Main memorial card */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(0,40,0,0.3) 0%, rgba(0,20,0,0.2) 100%)',
            border: '2px solid var(--grave-green)',
            boxShadow: '0 0 40px rgba(0,255,0,0.1), inset 0 0 60px rgba(0,255,0,0.03)',
            padding: '0',
            marginBottom: '32px',
          }}
        >
          {/* Header with cross pattern */}
          <div
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,0,0.1) 50%, transparent 100%)',
              borderBottom: '1px solid var(--grave-green-dim)',
              padding: '24px 32px',
              textAlign: 'center',
            }}
          >
            {/* Decorative cross */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '40px',
                  backgroundColor: 'var(--grave-green)',
                  position: 'relative',
                  opacity: 0.6,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '-12px',
                    width: '28px',
                    height: '4px',
                    backgroundColor: 'var(--grave-green)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.4em',
                opacity: 0.5,
                marginBottom: '12px',
              }}
            >
              HERE LIES
            </div>

            <h1
              className="glow-text"
              style={{
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 'bold',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}
            >
              {grave.name}
            </h1>

            <a
              href={grave.url}
              target="_blank"
              rel="noopener noreferrer"
              className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] inline-flex items-center gap-2 transition-colors"
            >
              <Github size={14} />
              <span style={{ wordBreak: 'break-all' }}>{grave.url.replace('https://github.com/', '')}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Dates banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              padding: '20px',
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid var(--grave-green-dim)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div className="readable-xs" style={{ opacity: 0.5, marginBottom: '4px' }}>
                BORN
              </div>
              <div className="readable-sm tabular-nums">{formatDate(grave.birthDate)}</div>
            </div>

            <div
              style={{
                fontSize: '24px',
                opacity: 0.3,
              }}
            >
              †
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="readable-xs" style={{ opacity: 0.5, marginBottom: '4px' }}>
                DIED
              </div>
              <div className="readable-sm tabular-nums">{formatDate(grave.deathDate)}</div>
            </div>
          </div>

          {/* Epitaph */}
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              borderBottom: '1px solid var(--grave-green-dim)',
            }}
          >
            <p
              className="readable"
              style={{
                fontStyle: 'italic',
                opacity: 0.7,
                maxWidth: '500px',
                margin: '0 auto',
                lineHeight: 2,
              }}
            >
              "{grave.epitaph}"
            </p>
          </div>

          {/* Cause of death - dramatic red */}
          <div
            style={{
              padding: '24px 32px',
              background: 'linear-gradient(90deg, rgba(255,0,64,0.1) 0%, rgba(255,0,64,0.05) 50%, rgba(255,0,64,0.1) 100%)',
              borderBottom: '1px solid var(--grave-green-dim)',
            }}
          >
            <div
              className="readable-xs"
              style={{
                opacity: 0.6,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Skull size={14} color="var(--grave-red)" />
              CAUSE OF DEATH
            </div>
            <div
              className="readable"
              style={{
                color: 'var(--grave-red)',
                textAlign: 'center',
                textShadow: '0 0 20px rgba(255,0,64,0.5)',
              }}
            >
              {grave.causeOfDeath}
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderBottom: '1px solid var(--grave-green-dim)',
            }}
          >
            <StatBox
              icon={<Github size={16} />}
              value={grave.starCount?.toLocaleString() || '?'}
              label="STARS"
            />
            <StatBox
              icon={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--grave-green)',
                    color: 'var(--grave-black)',
                  }}
                >
                  F
                </span>
              }
              value={respectCount.toLocaleString()}
              label="RESPECTS"
            />
            <StatBox
              icon={<Calendar size={16} />}
              value={daysAlive.toLocaleString()}
              label="DAYS ALIVE"
            />
            <StatBox
              icon={<Clock size={16} />}
              value={daysDead.toLocaleString()}
              label="DAYS DEAD"
            />
          </div>

          {/* Tech stack */}
          {techStack.length > 0 && (
            <div
              style={{
                padding: '24px 32px',
                borderBottom: '1px solid var(--grave-green-dim)',
              }}
            >
              <div
                className="readable-xs"
                style={{
                  opacity: 0.5,
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                TECH STACK
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center',
                }}
              >
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="readable-sm"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--grave-green)',
                      color: 'var(--grave-black)',
                      fontWeight: 'bold',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Pay respects - main CTA */}
            <button
              onClick={(e) => handlePayRespects(e.clientX, e.clientY)}
              className={`
                pixel-btn readable-sm w-full flex items-center justify-center gap-4
                transition-all duration-150 ease-out
                ${isPressed ? 'scale-[0.98]' : 'scale-100'}
              `}
              style={{
                padding: '16px 24px',
                fontSize: '12px',
              }}
            >
              <kbd
                className={`
                  inline-flex items-center justify-center
                  w-8 h-8
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

            {/* Secondary actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <a
                href={grave.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pixel-btn readable-sm text-center flex items-center justify-center gap-2"
                style={{
                  background: 'var(--grave-green-dim)',
                  boxShadow: '4px 4px 0 0 #001a00',
                  padding: '12px',
                }}
              >
                <ExternalLink size={14} />
                VISIT REMAINS
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pixel-btn readable-sm text-center flex items-center justify-center gap-2"
                style={{
                  background: 'var(--grave-purple)',
                  boxShadow: '4px 4px 0 0 #4b0082',
                  padding: '12px',
                }}
              >
                <Share2 size={14} />
                SHARE
              </a>
            </div>
          </div>
        </div>

        {/* Submitted by */}
        {grave.submittedBy && (
          <p className="readable-xs text-[var(--grave-green-dim)] text-center">
            Memorial submitted by: {grave.submittedBy}
          </p>
        )}
      </div>
    </>
  )
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div
      style={{
        padding: '20px 12px',
        textAlign: 'center',
        borderRight: '1px solid var(--grave-green-dim)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
          opacity: 0.6,
        }}
      >
        {icon}
      </div>
      <div
        className="glow-text tabular-nums"
        style={{
          fontSize: 'clamp(16px, 3vw, 24px)',
          marginBottom: '4px',
        }}
      >
        {value}
      </div>
      <div className="readable-xs" style={{ opacity: 0.5 }}>
        {label}
      </div>
    </div>
  )
}
