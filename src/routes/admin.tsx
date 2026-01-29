import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getPendingGraves, getAllGraves, moderateGrave, updateGrave, deleteGrave } from '@/server/graves'
import type { Grave } from '@/server/schema'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

type ViewMode = 'pending' | 'approved' | 'all'

function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [allGraves, setAllGraves] = useState<Grave[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('pending')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    name: string
    url: string
    birthDate: string
    deathDate: string
    causeOfDeath: string
    epitaph: string
    techStack: string
    starCount: string
  } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const graves = await getAllGraves({ data: password })
      setAllGraves(graves)
      setIsAuthed(true)
    } catch (err) {
      setError('Invalid password or server error')
    } finally {
      setLoading(false)
    }
  }

  const filteredGraves = allGraves.filter(g => {
    if (viewMode === 'pending') return g.status === 'pending'
    if (viewMode === 'approved') return g.status === 'approved'
    return true
  })

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      await moderateGrave({ data: { id, status, password } })
      setAllGraves((prev) => prev.map(g => g.id === id ? { ...g, status } : g))
      setEditingId(null)
      setEditForm(null)
    } catch (err) {
      setError('Failed to moderate grave')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      await deleteGrave({ data: { id, password } })
      setAllGraves((prev) => prev.filter(g => g.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete grave')
    } finally {
      setActionLoading(null)
    }
  }

  const startEditing = (grave: Grave) => {
    setEditingId(grave.id)
    const techStack = JSON.parse(grave.techStack) as string[]
    setEditForm({
      name: grave.name,
      url: grave.url,
      birthDate: grave.birthDate,
      deathDate: grave.deathDate,
      causeOfDeath: grave.causeOfDeath,
      epitaph: grave.epitaph,
      techStack: techStack.join(', '),
      starCount: grave.starCount?.toString() || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdits = async (id: string) => {
    if (!editForm) return
    
    setActionLoading(id)
    try {
      const techStack = editForm.techStack
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
      
      await updateGrave({
        data: {
          id,
          password,
          updates: {
            name: editForm.name,
            url: editForm.url,
            birthDate: editForm.birthDate,
            deathDate: editForm.deathDate,
            causeOfDeath: editForm.causeOfDeath,
            epitaph: editForm.epitaph,
            techStack,
            starCount: editForm.starCount ? parseInt(editForm.starCount, 10) : null,
          },
        },
      })
      
      // Update local state
      setAllGraves((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                name: editForm.name,
                url: editForm.url,
                birthDate: editForm.birthDate,
                deathDate: editForm.deathDate,
                causeOfDeath: editForm.causeOfDeath,
                epitaph: editForm.epitaph,
                techStack: JSON.stringify(techStack),
                starCount: editForm.starCount ? parseInt(editForm.starCount, 10) : null,
              }
            : g
        )
      )
      
      setEditingId(null)
      setEditForm(null)
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h2 className="text-xl glow-text mb-2">UNDERTAKER ACCESS</h2>
          <p className="readable-sm text-[var(--grave-green-dim)]">
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
            <div className="text-[var(--grave-red)] readable-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="pixel-btn w-full readable-sm disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER CRYPT'}
          </button>
        </form>
      </div>
    )
  }

  const pendingCount = allGraves.filter(g => g.status === 'pending').length
  const approvedCount = allGraves.filter(g => g.status === 'approved').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl glow-text mb-1">GRAVE MANAGEMENT</h2>
          <p className="readable-sm text-[var(--grave-green-dim)]">
            {allGraves.length} total graves
          </p>
        </div>
        <button
          onClick={() => {
            setIsAuthed(false)
            setPassword('')
            setAllGraves([])
          }}
          className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] transition-colors"
        >
          [LOGOUT]
        </button>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('pending')}
          className={`readable-sm px-4 py-2 transition-colors ${
            viewMode === 'pending'
              ? 'bg-[var(--grave-green)] text-[var(--grave-black)]'
              : 'bg-[var(--grave-darker)] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)]'
          }`}
        >
          PENDING ({pendingCount})
        </button>
        <button
          onClick={() => setViewMode('approved')}
          className={`readable-sm px-4 py-2 transition-colors ${
            viewMode === 'approved'
              ? 'bg-[var(--grave-green)] text-[var(--grave-black)]'
              : 'bg-[var(--grave-darker)] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)]'
          }`}
        >
          APPROVED ({approvedCount})
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`readable-sm px-4 py-2 transition-colors ${
            viewMode === 'all'
              ? 'bg-[var(--grave-green)] text-[var(--grave-black)]'
              : 'bg-[var(--grave-darker)] text-[var(--grave-green-dim)] hover:text-[var(--grave-green)]'
          }`}
        >
          ALL ({allGraves.length})
        </button>
      </div>

      {error && (
        <div className="text-[var(--grave-red)] readable-sm text-center mb-4">
          {error}
        </div>
      )}

      {filteredGraves.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg glow-text-dim mb-4">NO GRAVES FOUND</p>
          <p className="readable text-[var(--grave-green-dim)]">
            {viewMode === 'pending' 
              ? 'No pending submissions to review.'
              : viewMode === 'approved'
              ? 'No approved graves yet.'
              : 'The graveyard is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGraves.map((grave) => {
            const techStack = JSON.parse(grave.techStack) as string[]
            const isEditing = editingId === grave.id
            const isDeleting = deleteConfirm === grave.id
            
            return (
              <div
                key={grave.id}
                className={`pixel-border bg-[var(--grave-darker)] p-6 ${
                  grave.status === 'approved' ? 'border-[var(--grave-green)]' : 
                  grave.status === 'rejected' ? 'border-[var(--grave-red)]' : ''
                }`}
              >
                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="mb-4 p-4 bg-[var(--grave-red)] bg-opacity-20 border border-[var(--grave-red)]">
                    <p className="readable-sm text-[var(--grave-red)] mb-4">
                      Are you sure you want to permanently delete "{grave.name}"? This cannot be undone.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleDelete(grave.id)}
                        disabled={actionLoading === grave.id}
                        className="pixel-btn pixel-btn-danger readable-sm flex-1 disabled:opacity-50"
                      >
                        {actionLoading === grave.id ? 'DELETING...' : 'YES, DELETE'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="pixel-btn readable-sm flex-1"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {isEditing && editForm ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="readable glow-text">EDITING GRAVE</h3>
                      <button
                        onClick={cancelEditing}
                        className="readable-sm text-[var(--grave-green-dim)] hover:text-[var(--grave-green)]"
                      >
                        [CANCEL]
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          PROJECT NAME
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          value={editForm.url}
                          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          BIRTH DATE
                        </label>
                        <input
                          type="date"
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          DEATH DATE
                        </label>
                        <input
                          type="date"
                          value={editForm.deathDate}
                          onChange={(e) => setEditForm({ ...editForm, deathDate: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                        CAUSE OF DEATH
                      </label>
                      <input
                        type="text"
                        value={editForm.causeOfDeath}
                        onChange={(e) => setEditForm({ ...editForm, causeOfDeath: e.target.value })}
                        className="pixel-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                        EPITAPH
                      </label>
                      <textarea
                        value={editForm.epitaph}
                        onChange={(e) => setEditForm({ ...editForm, epitaph: e.target.value })}
                        className="pixel-textarea"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          TECH STACK (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editForm.techStack}
                          onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                      <div>
                        <label className="block readable-xs text-[var(--grave-green-dim)] mb-1">
                          GITHUB STARS
                        </label>
                        <input
                          type="number"
                          value={editForm.starCount}
                          onChange={(e) => setEditForm({ ...editForm, starCount: e.target.value })}
                          className="pixel-input"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => saveEdits(grave.id)}
                        disabled={actionLoading === grave.id}
                        className="pixel-btn readable-sm flex-1 disabled:opacity-50"
                      >
                        {actionLoading === grave.id ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                      {grave.status === 'pending' && (
                        <button
                          onClick={async () => {
                            await saveEdits(grave.id)
                            await handleModerate(grave.id, 'approved')
                          }}
                          disabled={actionLoading === grave.id}
                          className="pixel-btn readable-sm flex-1 disabled:opacity-50"
                          style={{ background: 'var(--grave-green)', color: 'var(--grave-black)' }}
                        >
                          SAVE & APPROVE
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm glow-text">{grave.name}</h3>
                          <span className={`readable-xs px-2 py-0.5 ${
                            grave.status === 'approved' 
                              ? 'bg-[var(--grave-green)] text-[var(--grave-black)]'
                              : grave.status === 'rejected'
                              ? 'bg-[var(--grave-red)] text-white'
                              : 'bg-[var(--grave-purple)] text-white'
                          }`}>
                            {grave.status.toUpperCase()}
                          </span>
                        </div>
                        <a
                          href={grave.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="readable-xs text-[var(--grave-green-dim)] hover:text-[var(--grave-green)] break-all transition-colors"
                        >
                          {grave.url}
                        </a>
                      </div>
                      <div className="readable-xs text-[var(--grave-green-dim)]">
                        {new Date(grave.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 readable-sm mb-4">
                      <div>
                        <span className="text-[var(--grave-green-dim)]">Born:</span>{' '}
                        {grave.birthDate}
                      </div>
                      <div>
                        <span className="text-[var(--grave-green-dim)]">Died:</span>{' '}
                        {grave.deathDate}
                      </div>
                    </div>

                    <div className="readable-sm mb-2">
                      <span className="text-[var(--grave-green-dim)]">
                        Cause of Death:
                      </span>{' '}
                      <span className="text-[var(--grave-red)]">
                        {grave.causeOfDeath}
                      </span>
                    </div>

                    <div className="readable-sm italic mb-4 text-[var(--grave-green-dim)]">
                      "{grave.epitaph}"
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="readable-xs px-2 py-1 bg-[var(--grave-green-dim)] text-[var(--grave-green)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 readable-sm mb-4">
                      {grave.starCount && (
                        <span>
                          <span className="text-[var(--grave-green-dim)]">Stars:</span>{' '}
                          {grave.starCount}
                        </span>
                      )}
                      {grave.submittedBy && (
                        <span>
                          <span className="text-[var(--grave-green-dim)]">By:</span>{' '}
                          {grave.submittedBy}
                        </span>
                      )}
                      {grave.respectCount > 0 && (
                        <span>
                          <span className="text-[var(--grave-green-dim)]">Respects:</span>{' '}
                          {grave.respectCount}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => startEditing(grave)}
                        className="pixel-btn readable-sm flex-1"
                        style={{ background: 'var(--grave-purple)', boxShadow: '4px 4px 0 0 #4b0082' }}
                      >
                        EDIT
                      </button>
                      {grave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleModerate(grave.id, 'approved')}
                            disabled={actionLoading === grave.id}
                            className="pixel-btn readable-sm flex-1 disabled:opacity-50"
                          >
                            {actionLoading === grave.id ? '...' : 'APPROVE'}
                          </button>
                          <button
                            onClick={() => handleModerate(grave.id, 'rejected')}
                            disabled={actionLoading === grave.id}
                            className="pixel-btn pixel-btn-danger readable-sm flex-1 disabled:opacity-50"
                          >
                            {actionLoading === grave.id ? '...' : 'REJECT'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(grave.id)}
                        disabled={actionLoading === grave.id}
                        className="pixel-btn pixel-btn-danger readable-sm disabled:opacity-50"
                      >
                        DELETE
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
