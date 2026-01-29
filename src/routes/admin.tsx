import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getPendingGraves, moderateGrave } from '@/server/graves'
import type { Grave } from '@/server/schema'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [pendingGraves, setPendingGraves] = useState<Grave[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const graves = await getPendingGraves({ data: password })
      setPendingGraves(graves)
      setIsAuthed(true)
    } catch (err) {
      setError('Invalid password or server error')
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      await moderateGrave({ data: { id, status, password } })
      setPendingGraves((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      setError('Failed to moderate grave')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h2 className="text-xl glow-text mb-2">UNDERTAKER ACCESS</h2>
          <p className="text-[10px] text-[var(--grave-green-dim)]">
            Enter the password to access moderation
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            className="pixel-input"
            autoFocus
          />

          {error && (
            <div className="text-[var(--grave-red)] text-[10px] text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="pixel-btn w-full text-[10px] disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER CRYPT'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl glow-text mb-1">MODERATION QUEUE</h2>
          <p className="text-[10px] text-[var(--grave-green-dim)]">
            {pendingGraves.length} submission
            {pendingGraves.length !== 1 ? 's' : ''} awaiting judgment
          </p>
        </div>
        <button
          onClick={() => {
            setIsAuthed(false)
            setPassword('')
            setPendingGraves([])
          }}
          className="text-[10px] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)]"
        >
          [LOGOUT]
        </button>
      </div>

      {error && (
        <div className="text-[var(--grave-red)] text-[10px] text-center mb-4">
          {error}
        </div>
      )}

      {pendingGraves.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg glow-text-dim mb-4">NO PENDING SUBMISSIONS</p>
          <p className="text-[10px] text-[var(--grave-green-dim)]">
            All graves have been processed. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingGraves.map((grave) => {
            const techStack = JSON.parse(grave.techStack) as string[]
            return (
              <div
                key={grave.id}
                className="pixel-border bg-[var(--grave-darker)] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm glow-text">{grave.name}</h3>
                    <a
                      href={grave.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] break-all"
                    >
                      {grave.url}
                    </a>
                  </div>
                  <div className="text-[8px] text-[var(--grave-green-dim)]">
                    {new Date(grave.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] mb-4">
                  <div>
                    <span className="text-[var(--grave-green-dim)]">Born:</span>{' '}
                    {grave.birthDate}
                  </div>
                  <div>
                    <span className="text-[var(--grave-green-dim)]">Died:</span>{' '}
                    {grave.deathDate}
                  </div>
                </div>

                <div className="text-[10px] mb-2">
                  <span className="text-[var(--grave-green-dim)]">
                    Cause of Death:
                  </span>{' '}
                  <span className="text-[var(--grave-red)]">
                    {grave.causeOfDeath}
                  </span>
                </div>

                <div className="text-[10px] italic mb-4 text-[var(--grave-green-dim)]">
                  "{grave.epitaph}"
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[8px] px-2 py-1 bg-[var(--grave-green-dim)] text-[var(--grave-green)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 text-[10px] mb-4">
                  {grave.starCount && (
                    <span>
                      <span className="text-[var(--grave-green-dim)]">
                        Stars:
                      </span>{' '}
                      {grave.starCount}
                    </span>
                  )}
                  {grave.submittedBy && (
                    <span>
                      <span className="text-[var(--grave-green-dim)]">By:</span>{' '}
                      {grave.submittedBy}
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleModerate(grave.id, 'approved')}
                    disabled={actionLoading === grave.id}
                    className="pixel-btn text-[10px] flex-1 disabled:opacity-50"
                  >
                    {actionLoading === grave.id ? '...' : 'APPROVE'}
                  </button>
                  <button
                    onClick={() => handleModerate(grave.id, 'rejected')}
                    disabled={actionLoading === grave.id}
                    className="pixel-btn pixel-btn-danger text-[10px] flex-1 disabled:opacity-50"
                  >
                    {actionLoading === grave.id ? '...' : 'REJECT'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
