import { Github, Star } from 'lucide-react'
import type { Grave } from '@/server/schema'

interface GravestoneSVGProps {
  grave: Grave
  size?: 'small' | 'large'
  showRespects?: boolean
}

export function GravestoneSVG({ grave, size = 'small', showRespects = true }: GravestoneSVGProps) {
  const deathDate = new Date(grave.deathDate)
  const now = new Date()
  const daysDead = Math.floor((now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24))

  const isAncient = daysDead > 365 * 2
  const isOld = daysDead > 365

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const isLarge = size === 'large'

  if (isLarge) {
    return <LargeGravestone grave={grave} isOld={isOld} isAncient={isAncient} formatDate={formatDate} showRespects={showRespects} />
  }

  return <SmallGravestone grave={grave} isOld={isOld} isAncient={isAncient} formatDate={formatDate} showRespects={showRespects} />
}

interface GravestoneInnerProps {
  grave: Grave
  isOld: boolean
  isAncient: boolean
  formatDate: (dateStr: string) => string
  showRespects: boolean
}

function SmallGravestone({ grave, isOld, isAncient, formatDate, showRespects }: GravestoneInnerProps) {
  return (
    <div
      className="gravestone-card"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        filter: isAncient ? 'brightness(0.85)' : undefined,
      }}
    >
      {/* Stone background SVG */}
      <svg
        viewBox="0 0 180 240"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          <linearGradient id={`stone-${grave.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6a6a6a" />
            <stop offset="25%" stopColor="#5a5a5a" />
            <stop offset="75%" stopColor="#4a4a4a" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </linearGradient>
          <filter id={`glow-${grave.id}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main stone body */}
        <path
          d="M20 210 L20 50 Q20 15 50 15 L130 15 Q160 15 160 50 L160 210 Z"
          fill={`url(#stone-${grave.id})`}
        />

        {/* Left highlight */}
        <path
          d="M20 210 L20 50 Q20 20 45 17 L50 17 Q28 22 28 52 L28 210 Z"
          fill="rgba(255,255,255,0.06)"
        />

        {/* Right shadow */}
        <path
          d="M152 210 L152 52 Q152 25 135 19 L138 17 Q160 20 160 50 L160 210 Z"
          fill="rgba(0,0,0,0.12)"
        />

        {/* Inner border glow */}
        <path
          d="M32 198 L32 56 Q32 30 56 30 L124 30 Q148 30 148 56 L148 198 Z"
          fill="none"
          stroke="#00ff00"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Traditional cross - centered inside stone near top */}
        <g opacity="0.4">
          {/* Vertical beam */}
          <rect x="87" y="35" width="6" height="35" fill="#00ff00" />
          {/* Horizontal crossbar */}
          <rect x="78" y="42" width="24" height="5" fill="#00ff00" />
        </g>

        {/* Cracks for old graves */}
        {isOld && (
          <g opacity="0.35">
            <path d="M45 65 L52 95 L47 125 L55 150" stroke="#333" strokeWidth="1.5" fill="none" />
            <path d="M138 100 L130 130 L136 160 L128 185" stroke="#333" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {/* Base platform */}
        <rect x="15" y="210" width="150" height="10" fill="#444444" />

        {/* Ground/grass */}
        <rect x="0" y="218" width="180" height="22" fill="#1a4d1a" />
        <path d="M12 218 L18 208 L24 218" fill="#1a4d1a" />
        <path d="M45 218 L51 210 L57 218" fill="#1a4d1a" />
        <path d="M123 218 L129 209 L135 218" fill="#1a4d1a" />
        <path d="M156 218 L162 207 L168 218" fill="#1a4d1a" />
      </svg>

      {/* Text content overlay - starts well below cross area */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '12%',
          right: '12%',
          bottom: '12%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Project name - primary hierarchy */}
        <h3
          className="glow-text"
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            lineHeight: 1.3,
            marginBottom: '6px',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {grave.name}
        </h3>

        {/* Dates - compact */}
        <div
          style={{
            fontSize: '7px',
            opacity: 0.55,
            marginBottom: '6px',
            lineHeight: 1.4,
          }}
        >
          <span className="tabular-nums">{formatDate(grave.birthDate)}</span>
          <span style={{ margin: '0 3px', opacity: 0.5 }}>–</span>
          <span className="tabular-nums">{formatDate(grave.deathDate)}</span>
        </div>

        {/* Epitaph */}
        <p
          style={{
            fontSize: '7px',
            fontStyle: 'italic',
            opacity: 0.45,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textWrap: 'balance',
          }}
        >
          "{grave.epitaph}"
        </p>

        {/* Spacer - smaller to move badges up */}
        <div style={{ flex: 0.5 }} />

        {/* Stats badges - larger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          {grave.starCount && grave.starCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                opacity: 0.8,
              }}
            >
              <Star size={13} fill="#00ff00" color="#00ff00" />
              <span className="tabular-nums">{grave.starCount.toLocaleString()}</span>
            </div>
          )}

          {showRespects && grave.respectCount != null && grave.respectCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                opacity: 0.8,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  backgroundColor: '#00ff00',
                  color: '#0a0a0a',
                }}
              >
                F
              </span>
              <span className="tabular-nums">{grave.respectCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LargeGravestone({ grave, isOld, isAncient, formatDate, showRespects }: GravestoneInnerProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '320px',
        aspectRatio: '3 / 4',
        filter: isAncient ? 'brightness(0.85)' : undefined,
      }}
    >
      {/* Stone background SVG */}
      <svg
        viewBox="0 0 240 320"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          <linearGradient id={`stone-lg-${grave.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#707070" />
            <stop offset="30%" stopColor="#5d5d5d" />
            <stop offset="70%" stopColor="#4d4d4d" />
            <stop offset="100%" stopColor="#3d3d3d" />
          </linearGradient>
        </defs>

        {/* Main stone body */}
        <path
          d="M25 280 L25 65 Q25 20 65 20 L175 20 Q215 20 215 65 L215 280 Z"
          fill={`url(#stone-lg-${grave.id})`}
        />

        {/* Left highlight */}
        <path
          d="M25 280 L25 65 Q25 25 58 22 L65 22 Q35 28 35 68 L35 280 Z"
          fill="rgba(255,255,255,0.07)"
        />

        {/* Right shadow */}
        <path
          d="M205 280 L205 68 Q205 32 182 24 L185 22 Q215 25 215 65 L215 280 Z"
          fill="rgba(0,0,0,0.15)"
        />

        {/* Inner border glow */}
        <path
          d="M40 268 L40 72 Q40 38 72 38 L168 38 Q200 38 200 72 L200 268 Z"
          fill="none"
          stroke="#00ff00"
          strokeWidth="1.5"
          opacity="0.2"
        />

        {/* Traditional cross - centered inside stone near top */}
        <g opacity="0.4">
          {/* Vertical beam */}
          <rect x="115" y="45" width="10" height="50" fill="#00ff00" />
          {/* Horizontal crossbar */}
          <rect x="102" y="55" width="36" height="8" fill="#00ff00" />
        </g>

        {/* Cracks */}
        {isOld && (
          <g opacity="0.4">
            <path d="M55 90 L65 130 L58 175 L70 210" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M190 140 L178 180 L185 220 L172 255" stroke="#333" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* Base */}
        <rect x="18" y="280" width="204" height="14" fill="#444444" />

        {/* Ground */}
        <rect x="0" y="292" width="240" height="28" fill="#1a4d1a" />
        <path d="M15 292 L24 278 L33 292" fill="#1a4d1a" />
        <path d="M55 292 L64 280 L73 292" fill="#1a4d1a" />
        <path d="M167 292 L176 279 L185 292" fill="#1a4d1a" />
        <path d="M207 292 L216 277 L225 292" fill="#1a4d1a" />
      </svg>

      {/* Text content - starts below cross */}
      <div
        style={{
          position: 'absolute',
          top: '34%',
          left: '12%',
          right: '12%',
          bottom: '14%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Project name */}
        <h3
          className="glow-text"
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            lineHeight: 1.25,
            marginBottom: '12px',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {grave.name}
        </h3>

        {/* Dates - single line */}
        <div
          style={{
            fontSize: '11px',
            opacity: 0.6,
            marginBottom: '12px',
          }}
        >
          <span className="tabular-nums">{formatDate(grave.birthDate)}</span>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>–</span>
          <span className="tabular-nums">{formatDate(grave.deathDate)}</span>
        </div>

        {/* Epitaph */}
        <p
          style={{
            fontSize: '11px',
            fontStyle: 'italic',
            opacity: 0.5,
            lineHeight: 1.6,
            marginBottom: '16px',
            maxWidth: '90%',
          }}
        >
          "{grave.epitaph}"
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Stats - horizontal row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          {grave.starCount && grave.starCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                opacity: 0.75,
              }}
            >
              <Github size={14} color="#00ff00" />
              <span className="tabular-nums">{grave.starCount.toLocaleString()}</span>
              <span style={{ opacity: 0.6 }}>STARS</span>
            </div>
          )}

          {showRespects && grave.respectCount != null && grave.respectCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                opacity: 0.75,
              }}
            >
              <span
                className="f-keycap"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                }}
              >
                F
              </span>
              <span className="tabular-nums">{grave.respectCount.toLocaleString()}</span>
              <span style={{ opacity: 0.6 }}>RESPECTS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
