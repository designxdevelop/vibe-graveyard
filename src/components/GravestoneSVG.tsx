import type { Grave } from '@/server/schema'

interface GravestoneSVGProps {
  grave: Grave
  size?: 'small' | 'large'
  showRespects?: boolean
}

export function GravestoneSVG({ grave, size = 'small', showRespects = true }: GravestoneSVGProps) {
  const techStack = JSON.parse(grave.techStack) as string[]
  
  // Calculate days since death for "freshness"
  const deathDate = new Date(grave.deathDate)
  const now = new Date()
  const daysDead = Math.floor((now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Determine gravestone style based on age
  const isAncient = daysDead > 365 * 2
  const isOld = daysDead > 365
  
  // Format dates nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  
  const isLarge = size === 'large'
  const viewBox = isLarge ? "0 0 300 400" : "0 0 200 260"
  
  return (
    <div className="relative">
      <svg 
        viewBox={viewBox}
        className="w-full h-auto"
        style={{ filter: isAncient ? 'brightness(0.8)' : undefined }}
      >
        <defs>
          <linearGradient id={`stone-grad-${grave.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#777777" />
            <stop offset="30%" stopColor="#666666" />
            <stop offset="70%" stopColor="#555555" />
            <stop offset="100%" stopColor="#444444" />
          </linearGradient>
          <filter id={`glow-${grave.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {isLarge ? (
          // Large gravestone for detail page
          <>
            {/* Base/platform */}
            <rect x="30" y="340" width="240" height="25" fill="#333333" />
            <rect x="20" y="355" width="260" height="45" fill="#3d2817" />
            
            {/* Main stone body - rounded top */}
            <path 
              d="M40 340 L40 80 Q40 30 100 30 L200 30 Q260 30 260 80 L260 340 Z" 
              fill={`url(#stone-grad-${grave.id})`}
            />
            
            {/* Left highlight */}
            <path 
              d="M40 340 L40 80 Q40 35 90 32 L95 32 Q50 40 50 85 L50 340 Z" 
              fill="rgba(255,255,255,0.08)"
            />
            
            {/* Right shadow */}
            <path 
              d="M250 340 L250 85 Q250 45 210 35 L215 32 Q260 35 260 80 L260 340 Z" 
              fill="rgba(0,0,0,0.15)"
            />
            
            {/* Decorative border */}
            <path 
              d="M55 325 L55 90 Q55 50 105 50 L195 50 Q245 50 245 90 L245 325 Z" 
              fill="none" 
              stroke="#00ff00" 
              strokeWidth="2"
              opacity="0.3"
            />
            
            {/* Cross at top */}
            <rect x="140" y="15" width="20" height="40" fill="#00ff00" opacity="0.7" />
            <rect x="125" y="25" width="50" height="15" fill="#00ff00" opacity="0.7" />
            
            {/* Cracks for old graves */}
            {isOld && (
              <g opacity="0.5">
                <path d="M70 120 L80 160 L72 200 L85 240" stroke="#333" strokeWidth="2" fill="none" />
                <path d="M230 180 L220 220 L228 260 L215 290" stroke="#333" strokeWidth="2" fill="none" />
              </g>
            )}
            
            {/* Grass */}
            <rect x="0" y="355" width="300" height="45" fill="#1a4d1a" />
            <path d="M15 355 L25 340 L35 355" fill="#1a4d1a" />
            <path d="M60 355 L70 342 L80 355" fill="#1a4d1a" />
            <path d="M220 355 L230 343 L240 355" fill="#1a4d1a" />
            <path d="M265 355 L275 341 L285 355" fill="#1a4d1a" />
          </>
        ) : (
          // Small gravestone for grid
          <>
            {/* Base */}
            <rect x="20" y="220" width="160" height="15" fill="#333333" />
            
            {/* Main stone body */}
            <path 
              d="M25 220 L25 55 Q25 20 60 20 L140 20 Q175 20 175 55 L175 220 Z" 
              fill={`url(#stone-grad-${grave.id})`}
            />
            
            {/* Highlight */}
            <path 
              d="M25 220 L25 55 Q25 25 55 22 L60 22 Q32 28 32 58 L32 220 Z" 
              fill="rgba(255,255,255,0.08)"
            />
            
            {/* Shadow */}
            <path 
              d="M168 220 L168 58 Q168 30 145 24 L148 22 Q175 25 175 55 L175 220 Z" 
              fill="rgba(0,0,0,0.15)"
            />
            
            {/* Inner border */}
            <path 
              d="M38 205 L38 62 Q38 35 68 35 L132 35 Q162 35 162 62 L162 205 Z" 
              fill="none" 
              stroke="#00ff00" 
              strokeWidth="1.5"
              opacity="0.25"
            />
            
            {/* Cross */}
            <rect x="92" y="8" width="16" height="28" fill="#00ff00" opacity="0.6" />
            <rect x="82" y="15" width="36" height="10" fill="#00ff00" opacity="0.6" />
            
            {/* Cracks */}
            {isOld && (
              <g opacity="0.4">
                <path d="M50 70 L58 100 L52 130" stroke="#333" strokeWidth="2" fill="none" />
                <path d="M150 110 L142 140 L148 170" stroke="#333" strokeWidth="2" fill="none" />
              </g>
            )}
            
            {/* Ground */}
            <rect x="0" y="230" width="200" height="30" fill="#1a4d1a" />
            <path d="M15 230 L22 218 L29 230" fill="#1a4d1a" />
            <path d="M50 230 L57 220 L64 230" fill="#1a4d1a" />
            <path d="M136 230 L143 219 L150 230" fill="#1a4d1a" />
            <path d="M171 230 L178 217 L185 230" fill="#1a4d1a" />
          </>
        )}
      </svg>
      
      {/* Text overlay */}
      <div className={`absolute inset-0 flex flex-col items-center ${isLarge ? 'pt-[18%] px-12' : 'pt-[18%] px-8'} text-center`}>
        {/* R.I.P. */}
        <div className={`tracking-[0.4em] mb-1 opacity-50 ${isLarge ? 'text-sm' : 'text-[10px]'}`}>
          R.I.P.
        </div>
        
        {/* Project name */}
        <h3 className={`glow-text mb-2 leading-tight break-words max-w-full font-bold ${isLarge ? 'text-2xl' : 'text-sm'}`}>
          {grave.name}
        </h3>
        
        {/* Dates */}
        <div className={`opacity-60 mb-2 tabular-nums ${isLarge ? 'text-sm' : 'text-[9px]'}`}>
          {formatDate(grave.birthDate)}
          <br />
          —
          <br />
          {formatDate(grave.deathDate)}
        </div>
        
        {/* Divider */}
        <div className={`bg-[var(--grave-green)] opacity-30 mb-2 ${isLarge ? 'w-24 h-[2px]' : 'w-12 h-[1px]'}`} />
        
        {/* Epitaph */}
        <p className={`italic opacity-50 leading-relaxed px-2 ${isLarge ? 'text-sm mb-4' : 'text-[9px] line-clamp-2 mb-2'}`}>
          "{grave.epitaph}"
        </p>
        
        {/* Tech stack pills */}
        <div className={`flex flex-wrap gap-1 justify-center ${isLarge ? 'mb-6' : 'mb-2'}`}>
          {techStack.slice(0, isLarge ? 6 : 2).map((tech) => (
            <span
              key={tech}
              className={`bg-[var(--grave-green)] text-[var(--grave-black)] font-bold ${isLarge ? 'text-xs px-3 py-1' : 'text-[8px] px-2 py-0.5'}`}
            >
              {tech}
            </span>
          ))}
          {!isLarge && techStack.length > 2 && (
            <span className="text-[8px] px-2 py-0.5 opacity-50">
              +{techStack.length - 2}
            </span>
          )}
        </div>
      </div>
      
      {/* Badges at bottom of stone, above grass */}
      <div className={`absolute ${isLarge ? 'bottom-[18%]' : 'bottom-[20%]'} left-0 right-0 flex justify-center gap-4`}>
        {/* Star count */}
        {grave.starCount && grave.starCount > 0 && (
          <div className={`${isLarge ? 'text-sm' : 'text-[9px]'} opacity-70 flex items-center gap-1`}>
            <span className="text-yellow-400">★</span>
            <span className="tabular-nums">{grave.starCount.toLocaleString()}</span>
          </div>
        )}
        
        {/* Respect count */}
        {showRespects && grave.respectCount && grave.respectCount > 0 && (
          <div className={`${isLarge ? 'text-sm' : 'text-[9px]'} opacity-70 tabular-nums`}>
            {grave.respectCount.toLocaleString()} F
          </div>
        )}
      </div>
    </div>
  )
}
