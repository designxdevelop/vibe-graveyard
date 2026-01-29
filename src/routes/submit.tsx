import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { submitGrave } from '@/server/graves'

const CAUSES_OF_DEATH = [
  'Died of AI hype',
  'Lost to dependency hell',
  'Killed by scope creep',
  'Succumbed to burnout',
  'Murdered by technical debt',
  'Starved of funding',
  'Abandoned after Show HN',
  'Consumed by feature creep',
  'Died waiting for v1.0',
  'Killed by a breaking change',
  'Lost in a rewrite',
  'Choked on its own complexity',
  'Ghosted by maintainer',
  'Death by a thousand PRs',
  'Suffocated by enterprise requirements',
]

const COMMON_TECH = [
  'React',
  'Vue',
  'Svelte',
  'Next.js',
  'Nuxt',
  'Node.js',
  'Python',
  'Rust',
  'Go',
  'TypeScript',
  'JavaScript',
  'TailwindCSS',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Vercel',
  'Supabase',
]

export const Route = createFileRoute('/submit')({
  component: SubmitPage,
})

function SubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    birthDate: '',
    deathDate: '',
    causeOfDeath: CAUSES_OF_DEATH[0],
    customCause: '',
    epitaph: '',
    techStack: [] as string[],
    customTech: '',
    starCount: '',
    submittedBy: '',
  })

  const handleTechToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Combine tech stack
      let finalTechStack = [...formData.techStack]
      if (formData.customTech.trim()) {
        const customTechs = formData.customTech
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        finalTechStack = [...finalTechStack, ...customTechs]
      }

      // Determine cause of death
      const causeOfDeath =
        formData.causeOfDeath === 'Other'
          ? formData.customCause
          : formData.causeOfDeath

      await submitGrave({
        data: {
          name: formData.name,
          url: formData.url,
          birthDate: formData.birthDate,
          deathDate: formData.deathDate,
          causeOfDeath,
          epitaph: formData.epitaph,
          techStack: finalTechStack,
          starCount: formData.starCount ? parseInt(formData.starCount, 10) : undefined,
          submittedBy: formData.submittedBy || undefined,
        },
      })

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit grave')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl glow-text mb-4">SUBMISSION RECEIVED</h2>
        <p className="text-[10px] text-[var(--grave-green-dim)] mb-8 leading-relaxed">
          Your submission has been sent to the undertaker for review. 
          If approved, the project will be laid to rest in our graveyard.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setFormData({
              name: '',
              url: '',
              birthDate: '',
              deathDate: '',
              causeOfDeath: CAUSES_OF_DEATH[0],
              customCause: '',
              epitaph: '',
              techStack: [],
              customTech: '',
              starCount: '',
              submittedBy: '',
            })
          }}
          className="pixel-btn text-[10px]"
        >
          SUBMIT ANOTHER
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-xl glow-text mb-2">SUBMIT A GRAVE</h2>
        <p className="text-[10px] text-[var(--grave-green-dim)]">
          Know of a project that deserves a final resting place?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-[10px] mb-2">PROJECT NAME *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. my-awesome-cli"
            className="pixel-input"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-[10px] mb-2">PROJECT URL *</label>
          <input
            type="url"
            required
            value={formData.url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, url: e.target.value }))
            }
            placeholder="https://github.com/user/repo"
            className="pixel-input"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] mb-2">BIRTH DATE *</label>
            <input
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, birthDate: e.target.value }))
              }
              className="pixel-input"
            />
          </div>
          <div>
            <label className="block text-[10px] mb-2">DEATH DATE *</label>
            <input
              type="date"
              required
              value={formData.deathDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deathDate: e.target.value }))
              }
              className="pixel-input"
            />
          </div>
        </div>

        {/* Cause of Death */}
        <div>
          <label className="block text-[10px] mb-2">CAUSE OF DEATH *</label>
          <select
            required
            value={formData.causeOfDeath}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, causeOfDeath: e.target.value }))
            }
            className="pixel-select"
          >
            {CAUSES_OF_DEATH.map((cause) => (
              <option key={cause} value={cause}>
                {cause}
              </option>
            ))}
            <option value="Other">Other (specify below)</option>
          </select>
          {formData.causeOfDeath === 'Other' && (
            <input
              type="text"
              required
              value={formData.customCause}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customCause: e.target.value }))
              }
              placeholder="Custom cause of death..."
              className="pixel-input mt-2"
            />
          )}
        </div>

        {/* Epitaph */}
        <div>
          <label className="block text-[10px] mb-2">EPITAPH *</label>
          <textarea
            required
            value={formData.epitaph}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, epitaph: e.target.value }))
            }
            placeholder="Here lies a project that promised to change everything..."
            className="pixel-textarea"
            maxLength={200}
          />
          <div className="text-[8px] text-[var(--grave-green-dim)] mt-1 text-right">
            {formData.epitaph.length}/200
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-[10px] mb-2">TECH STACK</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_TECH.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => handleTechToggle(tech)}
                className={`text-[8px] px-2 py-1 transition-colors ${
                  formData.techStack.includes(tech)
                    ? 'bg-[var(--grave-green)] text-[var(--grave-black)]'
                    : 'bg-[var(--grave-green-dim)] text-[var(--grave-green)] hover:bg-[var(--grave-green)] hover:text-[var(--grave-black)]'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.customTech}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customTech: e.target.value }))
            }
            placeholder="Other tech (comma separated)..."
            className="pixel-input"
          />
        </div>

        {/* Star Count */}
        <div>
          <label className="block text-[10px] mb-2">
            GITHUB STARS (OPTIONAL)
          </label>
          <input
            type="number"
            min="0"
            value={formData.starCount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, starCount: e.target.value }))
            }
            placeholder="e.g. 1234"
            className="pixel-input"
          />
        </div>

        {/* Submitted By */}
        <div>
          <label className="block text-[10px] mb-2">YOUR NAME (OPTIONAL)</label>
          <input
            type="text"
            value={formData.submittedBy}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, submittedBy: e.target.value }))
            }
            placeholder="Anonymous gravedigger"
            className="pixel-input"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-[var(--grave-red)] text-[10px] text-center">
            ERROR: {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="pixel-btn w-full text-[10px] disabled:opacity-50"
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT TO THE UNDERTAKER'}
        </button>
      </form>
    </div>
  )
}
