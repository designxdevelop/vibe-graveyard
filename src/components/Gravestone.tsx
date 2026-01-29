import { Link } from '@tanstack/react-router'
import type { Grave } from '@/server/schema'
import { GravestoneSVG } from './GravestoneSVG'

interface GravestoneProps {
  grave: Grave
  index?: number
}

export function Gravestone({ grave, index = 0 }: GravestoneProps) {
  return (
    <Link
      to="/grave/$id"
      params={{ id: grave.id }}
      className="block ghost-float focus-visible:outline-none group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="gravestone-enter">
        <GravestoneSVG grave={grave} size="small" />
      </div>
    </Link>
  )
}
