import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import styles from './Trends.module.css'

export function Trends() {
  const navigate = useNavigate()
  const { sessions, userName } = useApp()

  const endedSessions = useMemo(() => {
    return sessions
      .filter((s) => s.endedAt)
      .sort((a, b) => new Date(a.endedAt!).getTime() - new Date(b.endedAt!).getTime())
  }, [sessions])

  const stats = useMemo(() => {
    const totalHits = endedSessions.reduce((acc, s) => acc + s.hits.length, 0)
    const totalMins = endedSessions.reduce((acc, s) => {
      if (!s.endedAt) return acc
      const ms = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
      return acc + ms / 60000
    }, 0)
    const avgPerSession = endedSessions.length ? totalHits / endedSessions.length : 0

    // Find best session (fewest events)
    let bestSession: { num: number; events: number } | null = null
    let worstSession: { num: number; events: number } | null = null
    endedSessions.forEach((s, i) => {
      const count = s.hits.length
      if (!bestSession || count < bestSession.events) {
        bestSession = { num: i + 1, events: count }
      }
      if (!worstSession || count > worstSession.events) {
        worstSession = { num: i + 1, events: count }
      }
    })

    // Trend: compare first half average to second half average
    let trend: 'improving' | 'steady' | 'declining' | null = null
    if (endedSessions.length >= 4) {
      const mid = Math.floor(endedSessions.length / 2)
      const firstHalf = endedSessions.slice(0, mid)
      const secondHalf = endedSessions.slice(mid)
      const firstAvg = firstHalf.reduce((a, s) => a + s.hits.length, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, s) => a + s.hits.length, 0) / secondHalf.length
      if (secondAvg < firstAvg * 0.8) trend = 'improving'
      else if (secondAvg > firstAvg * 1.2) trend = 'declining'
      else trend = 'steady'
    }

    return {
      sessionCount: endedSessions.length,
      totalHits,
      avgPerSession: avgPerSession.toFixed(1),
      totalMins: Math.round(totalMins),
      bestSession,
      worstSession,
      trend,
    }
  }, [endedSessions])

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  // Sorted newest-first for display
  const displaySessions = useMemo(
    () => [...endedSessions].reverse(),
    [endedSessions]
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>
          &larr; Dashboard
        </button>
        <h1 className={styles.title}>
          {userName ? `${userName}'s Trends` : 'Trends'}
        </h1>
      </header>

      {stats.trend && (
        <section className={styles.trendBanner}>
          <HunchieAvatar
            mood={stats.trend === 'improving' ? 'happy' : stats.trend === 'declining' ? 'sad' : 'calm'}
            size="small"
          />
          <p className={styles.trendText}>
            {stats.trend === 'improving' && 'Your posture is improving! Fewer events in recent sessions.'}
            {stats.trend === 'steady' && 'Staying consistent — keep up the good work.'}
            {stats.trend === 'declining' && 'More events recently — try adjusting your setup.'}
          </p>
        </section>
      )}

      <section className={styles.overview}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.sessionCount}</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.totalHits}</span>
            <span className={styles.statLabel}>Total events</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.avgPerSession}</span>
            <span className={styles.statLabel}>Avg / session</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatDuration(stats.totalMins)}</span>
            <span className={styles.statLabel}>Total time</span>
          </div>
        </div>
        {stats.bestSession && stats.worstSession && stats.bestSession.num !== stats.worstSession.num && (
          <div className={styles.highlights}>
            <span className={styles.highlight}>
              Best: #{stats.bestSession.num} ({stats.bestSession.events} event{stats.bestSession.events !== 1 ? 's' : ''})
            </span>
            <span className={styles.highlightDivider}>&middot;</span>
            <span className={styles.highlight}>
              Toughest: #{stats.worstSession.num} ({stats.worstSession.events} events)
            </span>
          </div>
        )}
      </section>

      <section className={styles.list}>
        <h2 className={styles.sectionTitle}>Past sessions</h2>
        {displaySessions.length === 0 ? (
          <p className={styles.empty}>No sessions yet. Start one from the dashboard!</p>
        ) : (
          <ul className={styles.sessionList}>
            {displaySessions.slice(0, 20).map((s, i) => {
              const num = endedSessions.length - i
              const start = new Date(s.startedAt)
              const end = s.endedAt ? new Date(s.endedAt) : null
              const mins = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0
              const hitCount = s.hits.filter(h => h.type === 'hit').length
              const slouchCount = s.hits.filter(h => h.type === 'slouch').length

              return (
                <li key={s.id} className={styles.sessionItem}>
                  <span className={styles.sessionNum}>#{num}</span>
                  <div className={styles.sessionInfo}>
                    <span className={styles.sessionDate}>{start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className={styles.sessionMeta}>
                      {mins} min &middot; {s.hits.length} event{s.hits.length !== 1 ? 's' : ''}
                      {s.hits.length > 0 && ` (${hitCount} hit${hitCount !== 1 ? 's' : ''}, ${slouchCount} slouch${slouchCount !== 1 ? 'es' : ''})`}
                    </span>
                  </div>
                  {s.environmentComfort && (
                    <span className={styles.sessionEnv}>{s.environmentComfort}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Button variant="teal" onClick={() => navigate('/dashboard')} className={styles.cta}>
        Back to dashboard
      </Button>
    </div>
  )
}
