import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import type { HunchieMood } from '../types'
import type { HitLog } from '../types'
import type { Session } from '../types'
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

/** Post-session mood: sleepy if not too bad, else calm/sad/annoyed */
function getPostSessionMood(session: Session): HunchieMood {
  const n = session.hits.length
  const heavy = session.hits.filter((h) => h.severity === 'heavy').length
  if (n === 0) return 'happy'
  if (heavy >= 2 || n >= 6) return 'annoyed'
  if (n >= 3) return 'sad'
  return 'sleepy'
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
    sessionPaused,
    sessionHealth,
    sessionTreats,
    pauseSession,
    resumeSession,
    takeBreak,
    feedHunchie,
  } = useApp()
  const [now, setNow] = useState(() => new Date())
  const [showBreakReward, setShowBreakReward] = useState(false)

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

  const todaySessions = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return completedSessions.filter((s) => new Date(s.endedAt!) >= today)
  }, [completedSessions])

  const weekSessions = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    return completedSessions
      .filter((s) => new Date(s.endedAt!) >= weekAgo)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
  }, [completedSessions])

  const todayStats = useMemo(() => {
    if (todaySessions.length === 0) return null
    const totalMins = todaySessions.reduce((acc, s) => {
      if (!s.endedAt) return acc
      const ms = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
      return acc + ms / 60000
    }, 0)
    const totalHunches = todaySessions.reduce((acc, s) => acc + s.hits.length, 0)
    return {
      durationMins: Math.round(totalMins),
      hunches: totalHunches,
      sessionCount: todaySessions.length,
      lastSession,
      mood: lastSession ? getPostSessionMood(lastSession) : 'calm' as HunchieMood,
    }
  }, [todaySessions, lastSession])

  const mood = useMemo(
    () => getHunchieMood(currentSession?.hits ?? [], 5),
    [currentSession?.hits, now]
  )

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleStartSession = () => startSession()
  const handleEndSession = () => {
    endSession()
    navigate('/summary', { replace: true })
  }
  const handleLogHit = (severity: HitLog['severity'], type: 'hit' | 'slouch') => {
    addHit(severity, type)
  }

  // ── Idle: Ginelle's dashboard — TODAY + THIS WEEK ──
  if (!currentSession) {
    return (
      <div className={styles.page}>
        <div className={styles.dashboard}>
          <h1 className={styles.dashboardTitle}>Hey, {userName || 'there'}!</h1>

          <section className={styles.todaySection}>
            <h2 className={styles.sectionLabel}>TODAY</h2>
            {todayStats ? (
              <>
                <div className={styles.todayStats}>
                  <div className={styles.todayStat}>
                    <span className={styles.todayStatValue}>{todayStats.durationMins}</span>
                    <span className={styles.todayStatLabel}>min</span>
                  </div>
                  <div className={styles.todayStat}>
                    <span className={styles.todayStatValue}>{todayStats.hunches}</span>
                    <span className={styles.todayStatLabel}>hunches</span>
                  </div>
                </div>
                <div className={styles.todayHunchie}>
                  <HunchieAvatar mood={todayStats.mood} size="large" className={styles.avatar} />
                  <p className={styles.moodCaption}>
                    {todayStats.mood === 'sleepy' && "Hunchie's sleepy — not distraught with your session."}
                    {todayStats.mood === 'happy' && "Hunchie's happy. Great posture today!"}
                    {todayStats.mood === 'calm' && "Hunchie's calm. Nice work."}
                    {todayStats.mood === 'sad' && "Hunchie noticed some slouching."}
                    {todayStats.mood === 'annoyed' && "Hunchie's a bit annoyed — try to sit up more next time."}
                  </p>
                </div>
              </>
            ) : (
              <p className={styles.noToday}>No sessions today yet. Start one below.</p>
            )}
          </section>

          <section className={styles.weekSection}>
            <h2 className={styles.sectionLabel}>THIS WEEK</h2>
            {weekSessions.length === 0 ? (
              <p className={styles.noWeek}>No sessions this week yet.</p>
            ) : (
              <ul className={styles.weekList}>
                {weekSessions.slice(0, 7).map((s, i) => {
                  const start = new Date(s.startedAt)
                  const end = s.endedAt ? new Date(s.endedAt) : null
                  const mins = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0
                  return (
                    <li key={s.id} className={styles.weekItem}>
                      <span className={styles.weekDate}>{start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className={styles.weekMeta}>{mins} min · {s.hits.length} hunches</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <Button variant="pink" onClick={handleStartSession} className={styles.startBtn}>
            Start session
          </Button>

          {isDemo && (
            <p className={styles.demoHint}>
              Demo mode — use buttons during a session to simulate posture events.
            </p>
          )}

          <nav className={styles.navLinks}>
            <button type="button" className={styles.navLink} onClick={() => navigate('/trends')}>
              Trends
            </button>
            <button type="button" className={styles.navLink} onClick={() => navigate('/settings')}>
              Settings
            </button>
            {lastSession && (
              <button type="button" className={styles.navLink} onClick={() => navigate('/summary')}>
                Last summary
              </button>
            )}
          </nav>
        </div>
      </div>
    )
  }

  // ── Active session: meadow BG, pause/restart/feed, health + treats ──
  const durationMs = now.getTime() - new Date(currentSession.startedAt).getTime()
  const durationMins = Math.floor(durationMs / 60000)
  const durationSecs = Math.floor((durationMs % 60000) / 1000)
  const durationStr = `0hr ${durationMins}:${durationSecs.toString().padStart(2, '0')}min`
  const hitCount = currentSession.hits.length

  return (
    <div className={`${styles.page} ${styles.sessionActive}`}>
      <header className={styles.header}>
        <span className={styles.sessionTimer}>Time: {sessionPaused ? 'Paused' : durationStr}</span>
        <div className={styles.headerRight}>
          <button type="button" className={styles.iconBtn} onClick={() => navigate('/settings')} aria-label="Settings">⚙</button>
          <Button variant="pink" onClick={handleEndSession} className={styles.endHeaderBtn}>End</Button>
        </div>
      </header>

      {/* Pause / Restart / Feed bar (Nikki) */}
      <section className={styles.sessionControls}>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={sessionPaused ? resumeSession : pauseSession}
            title={sessionPaused ? 'Resume' : 'Pause'}
            aria-label={sessionPaused ? 'Resume session' : 'Pause session'}
          >
            {sessionPaused ? (
              <span className={styles.controlIcon} aria-hidden>▶</span>
            ) : (
              <span className={styles.controlIcon} aria-hidden>⏸</span>
            )}
          </button>
          <span className={styles.controlLabel}>{sessionPaused ? 'Resume' : 'Pause'}</span>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => { endSession(); startSession(); }}
            title="Restart session"
            aria-label="Restart session"
          >
            <span className={styles.controlIcon} aria-hidden>↻</span>
          </button>
          <span className={styles.controlLabel}>Restart</span>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => {
              takeBreak()
              setShowBreakReward(true)
            }}
            title="Take a break (earn a treat)"
            aria-label="Take a break to earn a treat"
          >
            <span className={styles.controlIcon} aria-hidden>☀</span>
          </button>
          <span className={styles.controlLabel}>Break</span>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={feedHunchie}
            disabled={sessionTreats < 1}
            title={sessionTreats >= 1 ? 'Feed Hunchie (restore health)' : 'No treats yet — take a break to earn one'}
            aria-label={sessionTreats >= 1 ? 'Feed Hunchie' : 'No treats to feed'}
          >
            <span className={styles.controlIcon} aria-hidden>🍎</span>
          </button>
          <span className={styles.controlLabel}>Feed</span>
        </div>
      </section>

      <div className={styles.healthBar}>
        <span className={styles.healthLabel}>HP</span>
        <div className={styles.healthTrack}>
          <div className={styles.healthFill} style={{ width: `${sessionHealth}%` }} />
        </div>
        <span className={styles.hitCount}># of times hit: {hitCount}</span>
      </div>

      {showBreakReward && (
        <div className={styles.breakRewardOverlay} role="dialog" aria-label="Break reward">
          <div className={styles.breakRewardCard}>
            <p className={styles.breakRewardSub}>Break: exercised for 5 minutes</p>
            <p className={styles.breakRewardTitle}>CONGRATS!!!</p>
            <span className={styles.breakRewardApple} aria-hidden>🍎</span>
            <p className={styles.breakRewardMessage}>You received a treat!</p>
            <p className={styles.breakRewardHint}>Feed to Hunchie to recover HP.</p>
            <Button variant="yellow" onClick={() => setShowBreakReward(false)}>
              OK
            </Button>
          </div>
        </div>
      )}

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
                <Button variant="yellow" onClick={() => handleLogHit('light', 'slouch')}>Light</Button>
                <Button variant="lavender" onClick={() => handleLogHit('medium', 'slouch')}>Medium</Button>
                <Button variant="pink" onClick={() => handleLogHit('heavy', 'slouch')}>Heavy</Button>
              </div>
            </div>
            <div className={styles.demoGroup}>
              <span className={styles.demoGroupLabel}>Hit</span>
              <div className={styles.demoButtons}>
                <Button variant="yellow" onClick={() => handleLogHit('light', 'hit')}>Light</Button>
                <Button variant="lavender" onClick={() => handleLogHit('medium', 'hit')}>Medium</Button>
                <Button variant="pink" onClick={() => handleLogHit('heavy', 'hit')}>Heavy</Button>
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
