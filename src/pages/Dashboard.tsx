import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import type { HunchieMood } from '../types'
import type { HitLog } from '../types'
import styles from './Dashboard.module.css'

function getHunchieMood(hits: HitLog[], recentMinutes = 5): HunchieMood {
  const recent = recentMinutes * 60 * 1000
  const now = Date.now()
  const recentHits = hits.filter((h) => now - new Date(h.timestamp).getTime() < recent)
  const heavy = recentHits.filter((h) => h.severity === 'heavy').length
  const any = recentHits.length

  if (any === 0) return 'happy'
  if (heavy >= 2 || any >= 5) return 'annoyed'
  if (any >= 2) return 'sad'
  return 'calm'
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatSeverity(s: HitLog['severity']) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function Dashboard() {
  const navigate = useNavigate()
  const {
    userName,
    currentSession,
    sessions,
    startSession,
    endSession,
    addHit,
  } = useApp()
  const [now, setNow] = useState(() => new Date())

  const sessionNumber = useMemo(() => {
    const withEnd = sessions.filter((s) => s.endedAt).length
    return currentSession ? withEnd : withEnd + 1
  }, [sessions, currentSession])

  const mood = useMemo(
    () => getHunchieMood(currentSession?.hits ?? [], 5),
    [currentSession?.hits, now]
  )

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleStartSession = () => {
    startSession()
  }

  const handleEndSession = () => {
    endSession()
    navigate('/summary', { replace: true })
  }

  const handleLogHit = (severity: HitLog['severity'], type: 'hit' | 'slouch') => {
    addHit(severity, type)
  }

  if (!currentSession) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <HunchieAvatar mood="calm" size="large" className={styles.avatar} />
          <h1 className={styles.title}>Hey{userName ? `, ${userName}` : ''}!</h1>
          <p className={styles.subtitle}>
            Start a session to track your posture with Hunchie.
          </p>
          <Button variant="pink" onClick={handleStartSession}>
            Start session
          </Button>
          <button
            type="button"
            className={styles.trendsLink}
            onClick={() => navigate('/trends')}
          >
            View trends
          </button>
        </div>
      </div>
    )
  }

  const durationMs = now.getTime() - new Date(currentSession.startedAt).getTime()
  const durationMins = Math.floor(durationMs / 60000)
  const durationSecs = Math.floor((durationMs % 60000) / 1000)
  const durationStr = `${durationMins}:${durationSecs.toString().padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.sessionBadge}>Session #{sessionNumber}</span>
        <span className={styles.timer}>{durationStr}</span>
      </header>

      <section className={styles.hunchieSection}>
        <HunchieAvatar mood={mood} size="large" />
        <p className={styles.moodLabel}>
          {mood === 'happy' && "You're doing great!"}
          {mood === 'calm' && 'Keep it up.'}
          {mood === 'sad' && "Hunchie noticed a few slouches."}
          {mood === 'annoyed' && "Too many hits — let's sit up!"}
        </p>
      </section>

      <section className={styles.logSection}>
        <h2 className={styles.sectionTitle}>This session</h2>
        <div className={styles.hitLog}>
          {currentSession.hits.length === 0 ? (
            <p className={styles.emptyLog}>No hits or slouches yet.</p>
          ) : (
            currentSession.hits
              .slice()
              .reverse()
              .map((h) => (
                <div key={h.id} className={styles.hitRow}>
                  <span className={styles.hitTime}>{formatTime(new Date(h.timestamp))}</span>
                  <span className={`${styles.hitType} ${styles[h.type]}`}>{h.type}</span>
                  <span className={styles.hitSeverity}>{formatSeverity(h.severity)}</span>
                </div>
              ))
          )}
        </div>
      </section>

      <section className={styles.actions}>
        <p className={styles.actionsLabel}>Log a hit or slouch (demo)</p>
        <div className={styles.demoButtons}>
          <Button variant="yellow" onClick={() => handleLogHit('light', 'slouch')}>
            Slouch (light)
          </Button>
          <Button variant="lavender" onClick={() => handleLogHit('medium', 'hit')}>
            Hit (medium)
          </Button>
          <Button variant="pink" onClick={() => handleLogHit('heavy', 'hit')}>
            Hit (heavy)
          </Button>
        </div>
        <Button variant="teal" onClick={handleEndSession} className={styles.endBtn}>
          End session
        </Button>
      </section>
    </div>
  )
}
