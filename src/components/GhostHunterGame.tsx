import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  getGhostHunterLeaderboard, 
  submitGhostHunterScore, 
  checkGhostHunterHighScore 
} from '@/server/graves'
import type { GhostHunterScore } from '@/server/schema'

interface Ghost {
  id: number
  x: number
  y: number
  size: number
  points: number
  expiresAt: number
}

interface Keeper {
  id: number
  x: number
  y: number
  expiresAt: number
}

interface GhostHunterGameProps {
  onClose: () => void
}

const GAME_DURATION = 30_000 // 30 seconds
const SPAWN_INTERVAL = 800 // ms between spawns
const GHOST_LIFETIME = 2500 // how long each ghost stays
const KEEPER_SPAWN_CHANCE = 0.15 // 15% chance to spawn keeper instead
const KEEPER_LIFETIME = 1800 // keepers are faster
const MAX_LIVES = 3

export function GhostHunterGame({ onClose }: GhostHunterGameProps) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const [keepers, setKeepers] = useState<Keeper[]>([])
  const [gameState, setGameState] = useState<'playing' | 'ended' | 'leaderboard'>('playing')
  const [leaderboard, setLeaderboard] = useState<GhostHunterScore[]>([])
  const [playerName, setPlayerName] = useState('')
  const [flashRed, setFlashRed] = useState(false)
  const [canSubmitScore, setCanSubmitScore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const entityIdRef = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // Load leaderboard on mount
  useEffect(() => {
    getGhostHunterLeaderboard().then(setLeaderboard).catch(console.error)
  }, [])

  // Spawn ghosts and keepers
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnEntity = () => {
      const now = Date.now()
      const isKeeper = Math.random() < KEEPER_SPAWN_CHANCE
      
      if (isKeeper) {
        setKeepers(prev => [
          ...prev.filter(k => k.expiresAt > now),
          {
            id: entityIdRef.current++,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 70,
            expiresAt: now + KEEPER_LIFETIME,
          }
        ])
      } else {
        const size = 40 + Math.random() * 30
        const points = Math.round(100 - size)
        
        setGhosts(prev => [
          ...prev.filter(g => g.expiresAt > now),
          {
            id: entityIdRef.current++,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 70,
            size,
            points,
            expiresAt: now + GHOST_LIFETIME,
          }
        ])
      }
    }

    spawnEntity()
    const interval = setInterval(spawnEntity, SPAWN_INTERVAL)
    return () => clearInterval(interval)
  }, [gameState])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          setGameState('ended')
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [gameState])

  // Clean expired entities
  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      const now = Date.now()
      setGhosts(prev => prev.filter(g => g.expiresAt > now))
      setKeepers(prev => prev.filter(k => k.expiresAt > now))
    }, 200)

    return () => clearInterval(interval)
  }, [gameState])

  // Check for game over (no lives)
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('ended')
    }
  }, [lives, gameState])

  // Check if score qualifies for leaderboard when game ends
  useEffect(() => {
    if (gameState === 'ended' && score > 0) {
      checkGhostHunterHighScore({ data: score })
        .then(result => setCanSubmitScore(result.qualifies))
        .catch(() => setCanSubmitScore(false))
    }
  }, [gameState, score])

  const handleGhostClick = useCallback((ghostId: number, points: number) => {
    setScore(prev => prev + points)
    setGhosts(prev => prev.filter(g => g.id !== ghostId))
  }, [])

  const handleKeeperClick = useCallback((keeperId: number) => {
    setLives(prev => prev - 1)
    setKeepers(prev => prev.filter(k => k.id !== keeperId))
    setFlashRed(true)
    setTimeout(() => setFlashRed(false), 200)
  }, [])

  const handlePlayAgain = () => {
    setScore(0)
    setLives(MAX_LIVES)
    setTimeLeft(GAME_DURATION)
    setGhosts([])
    setKeepers([])
    setGameState('playing')
    setPlayerName('')
    setCanSubmitScore(false)
    setSubmittedName(null)
    entityIdRef.current = 0
  }

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const result = await submitGhostHunterScore({ 
        data: { 
          name: playerName.trim(), 
          score 
        } 
      })
      if (result.success && result.leaderboard) {
        setLeaderboard(result.leaderboard)
        setSubmittedName(playerName.trim().toUpperCase())
        setGameState('leaderboard')
      }
    } catch (err) {
      console.error('Failed to submit score:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewLeaderboard = async () => {
    try {
      const scores = await getGhostHunterLeaderboard()
      setLeaderboard(scores)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    }
    setGameState('leaderboard')
  }

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="ghost-hunter-overlay" onClick={onClose}>
      <div 
        className="ghost-hunter-container"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ghost-hunter-header">
          <div className="ghost-hunter-score">
            SCORE: <span className="tabular-nums">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="ghost-hunter-lives">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span 
                key={i} 
                className={`ghost-hunter-life ${i < lives ? '' : 'ghost-hunter-life-lost'}`}
              >
                {i < lives ? '♥' : '♡'}
              </span>
            ))}
          </div>
          <div className="ghost-hunter-time">
            TIME: <span className="tabular-nums">{Math.ceil(timeLeft / 1000).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Game area */}
        <div 
          ref={gameAreaRef}
          className={`ghost-hunter-arena ${flashRed ? 'ghost-hunter-flash' : ''}`}
        >
          {gameState === 'playing' ? (
            <>
              {ghosts.map(ghost => (
                <button
                  key={ghost.id}
                  className="ghost-hunter-ghost"
                  style={{
                    left: `${ghost.x}%`,
                    top: `${ghost.y}%`,
                    width: `${ghost.size}px`,
                    height: `${ghost.size}px`,
                  }}
                  onClick={() => handleGhostClick(ghost.id, ghost.points)}
                  aria-label={`Ghost worth ${ghost.points} points`}
                >
                  <svg viewBox="0 0 16 16" className="ghost-hunter-ghost-svg">
                    <rect x="5" y="1" width="6" height="1" fill="currentColor" />
                    <rect x="4" y="2" width="8" height="1" fill="currentColor" />
                    <rect x="3" y="3" width="10" height="1" fill="currentColor" />
                    <rect x="2" y="4" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="5" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="6" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="7" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="8" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="9" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="10" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="11" width="3" height="1" fill="currentColor" />
                    <rect x="6" y="11" width="4" height="1" fill="currentColor" />
                    <rect x="11" y="11" width="3" height="1" fill="currentColor" />
                    <rect x="2" y="12" width="2" height="1" fill="currentColor" />
                    <rect x="7" y="12" width="2" height="1" fill="currentColor" />
                    <rect x="12" y="12" width="2" height="1" fill="currentColor" />
                    <rect x="4" y="5" width="2" height="3" fill="var(--grave-black)" />
                    <rect x="10" y="5" width="2" height="3" fill="var(--grave-black)" />
                  </svg>
                </button>
              ))}
              {keepers.map(keeper => (
                <button
                  key={keeper.id}
                  className="ghost-hunter-keeper"
                  style={{
                    left: `${keeper.x}%`,
                    top: `${keeper.y}%`,
                  }}
                  onClick={() => handleKeeperClick(keeper.id)}
                  aria-label="Graveyard Keeper - avoid!"
                >
                  <svg viewBox="0 0 16 20" className="ghost-hunter-keeper-svg">
                    {/* Hat */}
                    <rect x="5" y="0" width="6" height="1" fill="currentColor" />
                    <rect x="4" y="1" width="8" height="1" fill="currentColor" />
                    <rect x="3" y="2" width="10" height="2" fill="currentColor" />
                    {/* Head */}
                    <rect x="5" y="4" width="6" height="1" fill="#8B4513" />
                    <rect x="4" y="5" width="8" height="4" fill="#8B4513" />
                    {/* Eyes - angry */}
                    <rect x="5" y="6" width="2" height="1" fill="#ff0000" />
                    <rect x="9" y="6" width="2" height="1" fill="#ff0000" />
                    {/* Mouth - frown */}
                    <rect x="6" y="8" width="4" height="1" fill="#000" />
                    {/* Body/Cloak */}
                    <rect x="4" y="9" width="8" height="1" fill="currentColor" />
                    <rect x="3" y="10" width="10" height="1" fill="currentColor" />
                    <rect x="2" y="11" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="12" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="13" width="12" height="1" fill="currentColor" />
                    <rect x="2" y="14" width="12" height="1" fill="currentColor" />
                    <rect x="3" y="15" width="10" height="1" fill="currentColor" />
                    {/* Shovel handle */}
                    <rect x="13" y="6" width="1" height="10" fill="#8B4513" />
                    {/* Shovel head */}
                    <rect x="12" y="15" width="3" height="1" fill="#666" />
                    <rect x="12" y="16" width="3" height="2" fill="#888" />
                  </svg>
                </button>
              ))}
              {ghosts.length === 0 && keepers.length === 0 && (
                <div className="ghost-hunter-waiting">
                  <p className="flicker">HUNTING...</p>
                </div>
              )}
            </>
          ) : gameState === 'ended' ? (
            <div className="ghost-hunter-gameover">
              <h2 className="glow-text">{lives <= 0 ? 'YOU DIED' : 'TIME UP'}</h2>
              <div className="ghost-hunter-final-score">
                <p>FINAL SCORE</p>
                <p className="ghost-hunter-big-score tabular-nums">{score.toString().padStart(5, '0')}</p>
              </div>
              
              {canSubmitScore ? (
                <form onSubmit={handleSubmitScore} className="ghost-hunter-name-form">
                  <p className="ghost-hunter-enter-name">ENTER YOUR NAME</p>
                  <input
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    maxLength={10}
                    className="ghost-hunter-name-input"
                    placeholder="AAA"
                    autoFocus
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    className="pixel-btn" 
                    disabled={!playerName.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'SAVING...' : 'SUBMIT SCORE'}
                  </button>
                </form>
              ) : (
                <p className="ghost-hunter-no-highscore">NOT A HIGH SCORE</p>
              )}
              
              <div className="ghost-hunter-buttons">
                <button className="pixel-btn" onClick={handlePlayAgain}>
                  PLAY AGAIN
                </button>
                <button className="pixel-btn ghost-hunter-quit" onClick={handleViewLeaderboard}>
                  LEADERBOARD
                </button>
                <button className="pixel-btn ghost-hunter-quit" onClick={onClose}>
                  QUIT
                </button>
              </div>
            </div>
          ) : (
            <div className="ghost-hunter-leaderboard">
              <h2 className="glow-text">HIGH SCORES</h2>
              <div className="ghost-hunter-leaderboard-list">
                {leaderboard.length === 0 ? (
                  <p className="ghost-hunter-no-scores">NO SCORES YET</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>NAME</th>
                        <th>SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, i) => (
                        <tr 
                          key={entry.id} 
                          className={submittedName && entry.name === submittedName && entry.score === score ? 'ghost-hunter-your-score' : ''}
                        >
                          <td>{i + 1}</td>
                          <td>{entry.name}</td>
                          <td className="tabular-nums">{entry.score.toString().padStart(5, '0')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="ghost-hunter-buttons">
                <button className="pixel-btn" onClick={handlePlayAgain}>
                  PLAY AGAIN
                </button>
                <button className="pixel-btn ghost-hunter-quit" onClick={onClose}>
                  QUIT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {gameState === 'playing' && (
          <div className="ghost-hunter-instructions">
            CLICK GHOSTS FOR POINTS - AVOID THE KEEPER!
          </div>
        )}

        {/* Close button */}
        <button 
          className="ghost-hunter-close"
          onClick={onClose}
          aria-label="Close game"
        >
          X
        </button>
      </div>
    </div>
  )
}
