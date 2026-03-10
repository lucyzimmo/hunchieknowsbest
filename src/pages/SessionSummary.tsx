import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import type { HitLog } from '../types'
import styles from './SessionSummary.module.css'

export function SessionSummary() {
  const navigate = useNavigate()
  const { sessions, updateSessionNotes } = useApp()
  const [showNotes, setShowNotes] = useState(false)
  const [comfort, setComfort] = useState<'' | 'chair' | 'floor' | 'cushion' | 'other'>('')
  const [state, setState] = useState<'' | 'noisy' | 'calm' | 'mixed'>('')
  const [userNotes, setUserNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  const lastSession = useMemo(() => {
    const ended = sessions.filter((s) => s.endedAt)
    ended.sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
    return ended[0] ?? null
  }, [sessions])

  const stats = useMemo(() => {
    if (!lastSession?.hits?.length) {
      return { total: 0, hits: 0, slouches: 0, bySeverity: { light: 0, medium: 0, heavy: 0 } }
    }
    const hits = lastSession.hits as HitLog[]
    const total = hits.length
    const hitCount = hits.filter((h) => h.type === 'hit').length
    const slouchCount = hits.filter((h) => h.type === 'slouch').length
    const bySeverity = {
      light: hits.filter((h) => h.severity === 'light').length,
      medium: hits.filter((h) => h.severity === 'medium').length,
      heavy: hits.filter((h) => h.severity === 'heavy').length,
    }
    return { total, hits: hitCount, slouches: slouchCount, bySeverity }
  }, [lastSession])

  const timeSpent = useMemo(() => {
    if (!lastSession?.endedAt) return null
    const start = new Date(lastSession.startedAt).getTime()
    const end = new Date(lastSession.endedAt).getTime()
    const totalMins = Math.floor((end - start) / 60000)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return `${hrs}hr ${mins}min`
  }, [lastSession])

  const getMood = () => {
    if (stats.total === 0) return 'happy' as const
    if (stats.bySeverity.heavy >= 2 || stats.total >= 6) return 'annoyed' as const
    if (stats.total >= 3) return 'sad' as const
    return 'sleepy' as const
  }

  if (!lastSession) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <HunchieAvatar mood="calm" size="large" className={styles.avatar} />
          <h1 className={styles.title}>No session to show</h1>
          <p className={styles.noData}>Start a session from the dashboard to see your summary here.</p>
          <Button variant="pink" onClick={() => navigate('/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hunchie&apos;s emotional state:</h1>
        <HunchieAvatar mood={getMood()} size="large" className={styles.avatar} />
        {timeSpent && (
          <p className={styles.timeSpent}>Time spent: {timeSpent}</p>
        )}
        <p className={styles.hitCount}># of hits: {stats.total}</p>
        <Button variant="pink" onClick={() => navigate('/dashboard')} className={styles.startAgainBtn}>
          start again
        </Button>

        {!showNotes ? (
          <button
            type="button"
            className={styles.notesToggle}
            onClick={() => setShowNotes(true)}
          >
            + Add notes (environment & energy)
          </button>
        ) : (
          <div className={styles.notesForm}>
            <span className={styles.notesLabel}>Where were you sitting?</span>
            <select
              className={styles.select}
              value={comfort}
              onChange={(e) => setComfort(e.target.value as typeof comfort)}
            >
              <option value="">Select...</option>
              <option value="chair">Chair / desk</option>
              <option value="floor">Floor</option>
              <option value="cushion">Cushion / pillow</option>
              <option value="other">Other</option>
            </select>
            <span className={styles.notesLabel}>How was your environment?</span>
            <select
              className={styles.select}
              value={state}
              onChange={(e) => setState(e.target.value as typeof state)}
            >
              <option value="">Select...</option>
              <option value="noisy">Noisy / distracting</option>
              <option value="calm">Calm / focused</option>
              <option value="mixed">Mixed</option>
            </select>
            <span className={styles.notesLabel}>How were you feeling? (optional)</span>
            <textarea
              className={styles.textarea}
              placeholder="e.g. tired, focused, stressed, relaxed..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={2}
            />
            <Button
              variant="sky"
              onClick={() => {
                if (lastSession) {
                  updateSessionNotes(lastSession.id, {
                    environmentComfort: comfort || undefined,
                    environmentState: state || undefined,
                    userNotes: userNotes.trim() || undefined,
                  })
                  setNotesSaved(true)
                }
              }}
            >
              {notesSaved ? 'Saved!' : 'Save notes'}
            </Button>
          </div>
        )}

        <button
          type="button"
          className={styles.secondaryLink}
          onClick={() => navigate('/trends')}
        >
          View trends
        </button>
      </div>
    </div>
  )
}
