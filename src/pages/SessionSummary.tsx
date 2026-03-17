import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import type { HitLog, HunchieMood } from '../types'
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

  const runaways = lastSession?.runawaysThisSession ?? 0

  const getMood = (): HunchieMood => {
    if (runaways === 0) return 'happy'
    if (runaways <= 3) return 'calm'
    return 'annoyed'
  }

  const getMoodComment = (): string => {
    if (runaways === 0) {
      if (stats.total === 0) return 'Perfect session! Hunchie is thrilled — not a single slouch!'
      return 'Great job! Hunchie stayed with you the whole time. Keep it up!'
    }
    if (runaways <= 3) {
      return `Hunchie ran away ${runaways} time${runaways > 1 ? 's' : ''} this session. Not bad, but there's room to improve!`
    }
    return `Hunchie ran away ${runaways} times this session. Try to sit taller next time — Hunchie believes in you!`
  }

  // TEMP: Show all three moods side by side for review
  const showDebugMoods = true

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
        <h1 className={styles.title}>Session Summary</h1>

        {/* TEMP: Debug — show all three moods side by side */}
        {showDebugMoods && (
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <HunchieAvatar mood="happy" size="large" className={styles.avatar} />
              <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>0 runaways</p>
              <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Happy</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <HunchieAvatar mood="calm" size="large" className={styles.avatar} />
              <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>1-3 runaways</p>
              <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Neutral</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <HunchieAvatar mood="annoyed" size="large" className={styles.avatar} />
              <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>4+ runaways</p>
              <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Sad/Angry</p>
            </div>
          </div>
        )}

        <div className={styles.summaryHunchie}>
          <HunchieAvatar mood={getMood()} size="large" className={styles.avatar} />
        </div>
        <p className={styles.moodComment}>{getMoodComment()}</p>

        {timeSpent && (
          <p className={styles.timeSpent}>Time: {timeSpent}</p>
        )}
        <p className={styles.hitCount}>{stats.total} posture event{stats.total !== 1 ? 's' : ''} this session</p>
        {runaways > 0 && (
          <p className={styles.runawayCount}>Hunchie ran away {runaways} time{runaways !== 1 ? 's' : ''}</p>
        )}
        <Button variant="teal" onClick={() => navigate('/dashboard')} className={styles.startAgainBtn}>
          Back to Home
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

        <div className={styles.secondaryLinks}>
          <button
            type="button"
            className={styles.secondaryLink}
            onClick={() => navigate('/dashboard')}
          >
            Start new session
          </button>
          <button
            type="button"
            className={styles.secondaryLink}
            onClick={() => navigate('/trends')}
          >
            View trends
          </button>
        </div>
      </div>
    </div>
  )
}
