import { createFileRoute, Link } from '@tanstack/react-router'
import { getGraves } from '@/server/graves'
import { Gravestone } from '@/components/Gravestone'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => await getGraves(),
})

// Random low number for "tests written" (always abysmally low)
function getRandomTestsWritten() {
  const options = [0, 0, 0, 1, 1, 2, 0, 0, 1, 0, 3, 0]
  return options[Math.floor(Math.random() * options.length)]
}

function HomePage() {
  const graves = Route.useLoaderData()
  const testsWritten = getRandomTestsWritten()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl glow-text mb-4 flicker">
          REST IN PEACE
        </h2>
        <p className="readable text-[var(--grave-green-dim)] max-w-xl mx-auto">
          A memorial for vibe-coded projects shared with great fanfare, 
          then quietly abandoned. Here lie the dreams of weekend hackathons 
          and "I'll maintain this later" promises.
        </p>
        
        <Link to="/submit" className="pixel-btn inline-block mt-6 text-[10px]">
          SUBMIT A GRAVE
        </Link>
      </div>

      {/* Graveyard grid */}
      {graves.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg glow-text-dim mb-4">THE GRAVEYARD IS EMPTY</p>
          <p className="readable text-[var(--grave-green-dim)]">
            No projects have been laid to rest yet. Be the first to submit one.
          </p>
        </div>
      ) : (
        <>
          <div className="readable-sm text-[var(--grave-green-dim)] mb-4 text-center">
            {graves.length} PROJECT{graves.length !== 1 ? 'S' : ''} INTERRED
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {graves.map((grave, index) => (
              <Gravestone key={grave.id} grave={grave} index={index} />
            ))}
          </div>
        </>
      )}

      {/* Sarcastic stats section */}
      <div className="mt-16 py-8 border-t-2 border-[var(--grave-green-dim)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl glow-text mb-2">{graves.length}</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TOTAL GRAVES</div>
          </div>
          <div>
            <div className="text-3xl glow-text mb-2">
              {graves.reduce((acc, g) => acc + (g.starCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">STARS WASTED</div>
          </div>
          <div>
            <div className="text-3xl glow-text mb-2">∞</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">PROMISES BROKEN</div>
          </div>
          <div>
            <div className="text-3xl glow-text mb-2">{testsWritten}</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TESTS WRITTEN</div>
          </div>
        </div>
      </div>
    </div>
  )
}
