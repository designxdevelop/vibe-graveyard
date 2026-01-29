import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getGrave, parseTechStack } from '@/server/graves'

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
      <h2 className="text-2xl glow-text mb-4">GRAVE NOT FOUND</h2>
      <p className="text-[10px] text-[var(--grave-green-dim)] mb-8">
        This project may have been resurrected... or never existed.
      </p>
      <Link to="/" className="pixel-btn text-[10px]">
        RETURN TO GRAVEYARD
      </Link>
    </div>
  ),
})

function GraveDetailPage() {
  const grave = Route.useLoaderData()
  const techStack = parseTechStack(grave)

  // Calculate time dead
  const deathDate = new Date(grave.deathDate)
  const birthDate = new Date(grave.birthDate)
  const now = new Date()
  const daysDead = Math.floor(
    (now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysAlive = Math.floor(
    (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const shareText = encodeURIComponent(
    `RIP ${grave.name} (${grave.birthDate} - ${grave.deathDate}). ${grave.causeOfDeath}. F to pay respects. #VibeGraveyard`
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-[10px] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] mb-8 inline-block"
      >
        ← BACK TO GRAVEYARD
      </Link>

      {/* Main gravestone */}
      <div className="pixel-border bg-[var(--grave-darker)] p-8 text-center">
        <div className="text-[12px] tracking-[0.5em] mb-4 opacity-60">
          R.I.P.
        </div>

        <h1 className="text-2xl md:text-3xl glow-text mb-4 break-words">
          {grave.name}
        </h1>

        <div className="text-sm mb-6">
          <span>{grave.birthDate}</span>
          <span className="mx-3">—</span>
          <span>{grave.deathDate}</span>
        </div>

        <div className="border-t-2 border-b-2 border-[var(--grave-green-dim)] py-6 my-6">
          <p className="text-sm italic leading-relaxed">"{grave.epitaph}"</p>
        </div>

        <div className="text-[10px] text-[var(--grave-red)] mb-6 uppercase tracking-wider">
          CAUSE OF DEATH: {grave.causeOfDeath}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-[8px] px-3 py-1 bg-[var(--grave-green-dim)] text-[var(--grave-green)]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-[var(--grave-green-dim)]">
          <div>
            <div className="text-lg glow-text">{grave.starCount || '?'}</div>
            <div className="text-[8px] text-[var(--grave-green-dim)]">STARS</div>
          </div>
          <div>
            <div className="text-lg glow-text">{daysAlive}</div>
            <div className="text-[8px] text-[var(--grave-green-dim)]">
              DAYS ALIVE
            </div>
          </div>
          <div>
            <div className="text-lg glow-text">{daysDead}</div>
            <div className="text-[8px] text-[var(--grave-green-dim)]">
              DAYS DEAD
            </div>
          </div>
        </div>
      </div>

      {/* Ground */}
      <div className="h-4 bg-[var(--grave-grass)]" />
      <div className="h-3 bg-[var(--grave-dirt)]" />

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={grave.url}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn text-[10px] text-center"
        >
          VISIT REMAINS
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn text-[10px] text-center"
          style={{
            background: 'var(--grave-purple)',
            boxShadow: '4px 4px 0 0 #4b0082',
          }}
        >
          SHARE ON X
        </a>
      </div>

      {/* Submitted by */}
      {grave.submittedBy && (
        <p className="text-[8px] text-[var(--grave-green-dim)] text-center mt-8">
          Submitted by: {grave.submittedBy}
        </p>
      )}
    </div>
  )
}
