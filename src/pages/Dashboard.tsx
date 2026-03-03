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
    isDemo,
    startSession,
    endSession,
    addHit,
  } = useApp()
  const [now, setNow] = useState(() => new Date())

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.endedAt),
    [sessions]
  )

  const lastSession = useMemo(() => {
    if (completedSessions.length === 0) return null
    return completedSessions
      .slice()
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())[0]
  }, [completedSessions])

  const lastSessionStats = useMemo(() => {
    if (!lastSession?.endedAt) return null
    const durationMs = new Date(lastSession.endedAt).getTime() - new Date(lastSession.startedAt).getTime()
    const mins = Math.round(durationMs / 60000)
    return {
      duration: `${mins} min`,
      events: lastSession.hits.length,
    }
  }, [lastSession])

  const mood = useMemo(
    () => getHunchieMood(currentSession?.hits ?? [], 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Idle state (no active session) ──
  if (!currentSession) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <HunchieAvatar mood="happy" size="large" className={styles.avatar} />
          <h1 className={styles.title}>Hey, {userName || 'there'}!</h1>
          <p className={styles.subtitle}>
            Ready for session #{completedSessions.length + 1}? Hunchie will track your posture and
            give you a gentle nudge when you slouch.
          </p>

          {lastSessionStats && (
            <div className={styles.lastSession}>
              <span className={styles.lastSessionLabel}>Last session</span>
              <span className={styles.lastSessionStat}>
                {lastSessionStats.duration} &middot; {lastSessionStats.events} event{lastSessionStats.events !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <Button variant="pink" onClick={handleStartSession} className={styles.startBtn}>
            Start session
          </Button>

          {isDemo && (
            <p className={styles.demoHint}>
              In demo mode, you can tap buttons to simulate posture events.
              With a real Hunchie device, events are detected automatically.
            </p>
          )}

          <div className={styles.navLinks}>
            {completedSessions.length > 0 && (
              <button
                type="button"
                className={styles.trendsLink}
                onClick={() => navigate('/trends')}
              >
                View trends ({completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''})
              </button>
            )}
            {lastSession && (
              <button
                type="button"
                className={styles.trendsLink}
                onClick={() => navigate('/summary')}
              >
                View last summary
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Active session ──
  const durationMs = now.getTime() - new Date(currentSession.startedAt).getTime()
  const durationMins = Math.floor(durationMs / 60000)
  const durationSecs = Math.floor((durationMs % 60000) / 1000)
  const durationStr = `${durationMins}:${durationSecs.toString().padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.sessionBadge}>Session #{sessions.length}</span>
        <span className={styles.timer}>{durationStr}</span>
      </header>

      <section className={styles.hunchieSection}>
        <HunchieAvatar mood={mood} size="large" />
        <p className={styles.moodLabel}>
          {mood === 'happy' && "You're doing great! No slouches detected."}
          {mood === 'calm' && 'Keep it up — looking good.'}
          {mood === 'sad' && 'A few posture events. Try to sit tall!'}
          {mood === 'annoyed' && "Lots of slouching — let's reset and sit up!"}
        </p>
        <div className={styles.liveStats}>
          <span>{currentSession.hits.filter(h => h.type === 'hit').length} hits</span>
          <span className={styles.statDivider}>&middot;</span>
          <span>{currentSession.hits.filter(h => h.type === 'slouch').length} slouches</span>
        </div>
      </section>

      <section className={styles.logSection}>
        <h2 className={styles.sectionTitle}>Event log</h2>
        <div className={styles.hitLog}>
          {currentSession.hits.length === 0 ? (
            <p className={styles.emptyLog}>
              No events yet. {isDemo ? 'Use the buttons below to simulate posture events.' : 'Hunchie is watching your posture!'}
            </p>
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
        {isDemo && (
          <>
            <p className={styles.actionsLabel}>Simulate posture events</p>
            <div className={styles.demoGroup}>
              <span className={styles.demoGroupLabel}>Slouch</span>
              <div className={styles.demoButtons}>
                <Button variant="yellow" onClick={() => handleLogHit('light', 'slouch')}>
                  Light
                </Button>
                <Button variant="lavender" onClick={() => handleLogHit('medium', 'slouch')}>
                  Medium
                </Button>
                <Button variant="pink" onClick={() => handleLogHit('heavy', 'slouch')}>
                  Heavy
                </Button>
              </div>
            </div>
            <div className={styles.demoGroup}>
              <span className={styles.demoGroupLabel}>Hit</span>
              <div className={styles.demoButtons}>
                <Button variant="yellow" onClick={() => handleLogHit('light', 'hit')}>
                  Light
                </Button>
                <Button variant="lavender" onClick={() => handleLogHit('medium', 'hit')}>
                  Medium
                </Button>
                <Button variant="pink" onClick={() => handleLogHit('heavy', 'hit')}>
                  Heavy
                </Button>
              </div>
            </div>
          </>
        )}
        <Button variant="teal" onClick={handleEndSession} className={styles.endBtn}>
          End session
        </Button>
      </section>
    </div>
  )
}
