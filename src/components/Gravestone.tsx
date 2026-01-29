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
  
  return (
    <Link
      to="/grave/$id"
      params={{ id: grave.id }}
      className="block group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="gravestone-enter ghost-float relative">
        {/* Gravestone shape */}
        <div 
          className={`
            relative px-4 py-6 min-h-[200px] flex flex-col items-center justify-center text-center
            ${isAncient ? 'pixel-border-stone opacity-70' : 'pixel-border'}
            bg-[var(--grave-darker)]
            transition-all duration-200
            group-hover:shadow-[0_0_20px_var(--grave-green-glow)]
          `}
          style={{
            clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 100%, 0 100%, 0 10%)',
          }}
        >
          {/* Cracks overlay for old graves */}
          {isOld && (
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-[20%] left-[30%] w-[2px] h-[40px] bg-[var(--grave-gray)] rotate-[30deg]" />
              <div className="absolute top-[40%] right-[25%] w-[2px] h-[30px] bg-[var(--grave-gray)] rotate-[-20deg]" />
            </div>
          )}
          
          {/* RIP header */}
          <div className="text-[10px] tracking-widest mb-2 opacity-60">R.I.P.</div>
          
          {/* Project name */}
          <h3 className="text-sm glow-text mb-3 leading-tight break-words max-w-full">
            {grave.name}
          </h3>
          
          {/* Dates */}
          <div className="text-[8px] opacity-70 mb-3">
            <span>{grave.birthDate}</span>
            <span className="mx-2">-</span>
            <span>{grave.deathDate}</span>
          </div>
          
          {/* Epitaph preview */}
          <p className="text-[8px] italic opacity-60 line-clamp-2 mb-3">
            "{grave.epitaph}"
          </p>
          
          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-1 justify-center">
            {techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[6px] px-2 py-1 bg-[var(--grave-green-dim)] text-[var(--grave-green)]"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 3 && (
              <span className="text-[6px] px-2 py-1 opacity-50">
                +{techStack.length - 3}
              </span>
            )}
          </div>
          
          {/* Star count */}
          {grave.starCount && grave.starCount > 0 && (
            <div className="absolute top-2 right-2 text-[8px] opacity-60">
              {grave.starCount}
            </div>
          )}
        </div>
        
        {/* Ground/grass beneath */}
        <div className="h-3 bg-[var(--grave-grass)] mt-[-2px]" />
        <div className="h-2 bg-[var(--grave-dirt)]" />
      </div>
    </Link>
  )
}
