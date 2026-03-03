import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import type { HitLog } from '../types'
import styles from './SessionSummary.module.css'

export function SessionSummary() {
  const navigate = useNavigate()
  const { sessions, userName, updateSessionNotes } = useApp()
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

  const duration = useMemo(() => {
    if (!lastSession?.endedAt) return null
    const start = new Date(lastSession.startedAt).getTime()
    const end = new Date(lastSession.endedAt).getTime()
    const mins = Math.floor((end - start) / 60000)
    const secs = Math.floor(((end - start) % 60000) / 1000)
    return `${mins}m ${secs}s`
  }, [lastSession])

  if (!lastSession) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.noData}>No session to summarize.</p>
          <Button variant="pink" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <HunchieAvatar mood={stats.total === 0 ? 'happy' : stats.bySeverity.heavy >= 2 ? 'annoyed' : 'calm'} size="large" className={styles.avatar} />
        <h1 className={styles.title}>Session complete</h1>
        <p className={styles.greeting}>
          {userName ? `Great work, ${userName}!` : 'Here’s your summary.'}
        </p>

        <div className={styles.stats}>
          {duration && (
            <div className={styles.stat}>
              <span className={styles.statValue}>{duration}</span>
              <span className={styles.statLabel}>Duration</span>
            </div>
          )}
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total events</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.hits}</span>
            <span className={styles.statLabel}>Hits</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.slouches}</span>
            <span className={styles.statLabel}>Slouches</span>
          </div>
        </div>

        {(stats.bySeverity.light > 0 || stats.bySeverity.medium > 0 || stats.bySeverity.heavy > 0) && (
          <div className={styles.severity}>
            <span className={styles.severityLabel}>By severity</span>
            <div className={styles.severityRow}>
              <span>Light: {stats.bySeverity.light}</span>
              <span>Medium: {stats.bySeverity.medium}</span>
              <span>Heavy: {stats.bySeverity.heavy}</span>
            </div>
          </div>
        )}

        {!showNotes ? (
          <button
            type="button"
            className={styles.notesToggle}
            onClick={() => setShowNotes(true)}
          >
            + Rate environment & add notes
          </button>
        ) : (
          <div className={styles.notesForm}>
            <span className={styles.notesLabel}>Environment comfort</span>
            <select
              className={styles.select}
              value={comfort}
              onChange={(e) => setComfort(e.target.value as typeof comfort)}
            >
              <option value="">Select…</option>
              <option value="chair">Chair</option>
              <option value="floor">Floor</option>
              <option value="cushion">Cushion</option>
              <option value="other">Other</option>
            </select>
            <span className={styles.notesLabel}>Environment state</span>
            <select
              className={styles.select}
              value={state}
              onChange={(e) => setState(e.target.value as typeof state)}
            >
              <option value="">Select…</option>
              <option value="noisy">Noisy</option>
              <option value="calm">Calm</option>
              <option value="mixed">Mixed</option>
            </select>
            <span className={styles.notesLabel}>Energy / how you feel (optional)</span>
            <textarea
              className={styles.textarea}
              placeholder="e.g. tired, focused, relaxed…"
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
              {notesSaved ? 'Saved' : 'Save notes'}
            </Button>
          </div>
        )}

        <Button variant="teal" onClick={() => navigate('/dashboard')} className={styles.cta}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
