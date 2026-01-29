import { Link } from '@tanstack/react-router'
import type { Grave } from '@/server/schema'

interface GravestoneProps {
  grave: Grave
  index?: number
}

export function Gravestone({ grave, index = 0 }: GravestoneProps) {
  const techStack = JSON.parse(grave.techStack) as string[]
  
  // Calculate days since death for "freshness"
  const deathDate = new Date(grave.deathDate)
  const now = new Date()
  const daysDead = Math.floor((now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Determine gravestone style based on age
  const isAncient = daysDead > 365 * 2 // Over 2 years
  const isOld = daysDead > 365 // Over 1 year
  
  // Format dates nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }
  
  return (
    <Link
      to="/grave/$id"
      params={{ id: grave.id }}
      className="block ghost-float focus-visible:outline-none group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="gravestone-enter relative">
        {/* Gravestone SVG shape */}
        <div className="relative">
          <svg 
            viewBox="0 0 200 280" 
            className="w-full h-auto"
            style={{ filter: isAncient ? 'brightness(0.7)' : undefined }}
          >
            {/* Main gravestone shape */}
            <defs>
              <linearGradient id={`stone-grad-${grave.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#888888" />
                <stop offset="50%" stopColor="#666666" />
                <stop offset="100%" stopColor="#444444" />
              </linearGradient>
              <linearGradient id={`stone-dark-${grave.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#333333" />
                <stop offset="100%" stopColor="#555555" />
              </linearGradient>
              {/* Glow filter for hover */}
              <filter id={`glow-${grave.id}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Gravestone base/shadow */}
            <rect x="25" y="250" width="150" height="20" fill="#333333" />
            
            {/* Main stone body */}
            <path 
              d="M30 250 L30 60 Q30 30 60 30 L140 30 Q170 30 170 60 L170 250 Z" 
              fill={`url(#stone-grad-${grave.id})`}
              className="transition-all duration-200 group-hover:filter group-hover:brightness-110"
            />
            
            {/* Stone edge highlight (left) */}
            <path 
              d="M30 250 L30 60 Q30 30 60 30 L65 30 L65 60 Q40 60 40 70 L40 250 Z" 
              fill="rgba(255,255,255,0.1)"
            />
            
            {/* Stone edge shadow (right) */}
            <path 
              d="M160 250 L160 70 Q160 60 150 60 L150 35 Q170 35 170 60 L170 250 Z" 
              fill="rgba(0,0,0,0.2)"
            />
            
            {/* Decorative arch at top */}
            <path 
              d="M50 50 Q100 20 150 50" 
              fill="none" 
              stroke="#00ff00" 
              strokeWidth="2"
              opacity="0.4"
              className="group-hover:opacity-80 transition-opacity duration-200"
            />
            
            {/* Inner border */}
            <rect 
              x="45" y="55" width="110" height="180" 
              fill="none" 
              stroke="#00ff00" 
              strokeWidth="1.5"
              opacity="0.3"
              className="group-hover:opacity-60 transition-opacity duration-200"
            />
            
            {/* Cross decoration at top */}
            <rect x="95" y="35" width="10" height="25" fill="#00ff00" opacity="0.6" className="group-hover:opacity-100 transition-opacity" />
            <rect x="88" y="42" width="24" height="8" fill="#00ff00" opacity="0.6" className="group-hover:opacity-100 transition-opacity" />
            
            {/* Cracks for old graves */}
            {isOld && (
              <g opacity="0.4">
                <path d="M60 80 L65 100 L60 120 L68 140" stroke="#333" strokeWidth="2" fill="none" />
                <path d="M140 150 L135 170 L142 190" stroke="#333" strokeWidth="2" fill="none" />
              </g>
            )}
            
            {/* Moss/weathering for ancient graves */}
            {isAncient && (
              <g opacity="0.3">
                <ellipse cx="40" cy="240" rx="15" ry="8" fill="#1a4d1a" />
                <ellipse cx="165" cy="235" rx="12" ry="6" fill="#1a4d1a" />
                <ellipse cx="60" cy="248" rx="10" ry="5" fill="#1a4d1a" />
              </g>
            )}
            
            {/* Ground/grass */}
            <rect x="0" y="260" width="200" height="20" fill="#1a4d1a" />
            <rect x="0" y="270" width="200" height="10" fill="#3d2817" />
            
            {/* Grass tufts */}
            <path d="M20 260 L25 250 L30 260" fill="#1a4d1a" />
            <path d="M50 260 L55 252 L60 260" fill="#1a4d1a" />
            <path d="M140 260 L145 253 L150 260" fill="#1a4d1a" />
            <path d="M170 260 L175 251 L180 260" fill="#1a4d1a" />
          </svg>
          
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-[22%] px-6 text-center">
            {/* R.I.P. */}
            <div className="text-[10px] tracking-[0.3em] mb-1 opacity-50 glow-text-dim">
              R.I.P.
            </div>
            
            {/* Project name */}
            <h3 className="text-sm glow-text mb-2 leading-tight break-words max-w-full font-bold group-hover:text-shadow-lg transition-all">
              {grave.name}
            </h3>
            
            {/* Dates */}
            <div className="text-[9px] opacity-60 mb-2 tabular-nums">
              {formatDate(grave.birthDate)} — {formatDate(grave.deathDate)}
            </div>
            
            {/* Divider */}
            <div className="w-16 h-[2px] bg-[var(--grave-green)] opacity-30 mb-2" />
            
            {/* Epitaph preview */}
            <p className="text-[9px] italic opacity-50 line-clamp-2 mb-3 leading-relaxed px-2">
              "{grave.epitaph}"
            </p>
            
            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-1 justify-center mt-auto mb-4">
              {techStack.slice(0, 2).map((tech) => (
                <span
                  key={tech}
                  className="text-[8px] px-2 py-0.5 bg-[var(--grave-green)] text-[var(--grave-black)] font-bold"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 2 && (
                <span className="text-[8px] px-2 py-0.5 opacity-50">
                  +{techStack.length - 2}
                </span>
              )}
            </div>
          </div>
          
          {/* Star count badge */}
          {grave.starCount && grave.starCount > 0 && (
            <div className="absolute top-[12%] right-[18%] text-[9px] opacity-70 flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="tabular-nums">{grave.starCount.toLocaleString()}</span>
            </div>
          )}
          
          {/* Respect count badge */}
          {grave.respectCount && grave.respectCount > 0 && (
            <div className="absolute top-[12%] left-[18%] text-[9px] opacity-70 tabular-nums">
              {grave.respectCount} F
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
