import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import styles from './Trends.module.css'

export function Trends() {
  const navigate = useNavigate()
  const { sessions } = useApp()

  const endedSessions = useMemo(() => {
    return sessions
      .filter((s) => s.endedAt)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
  }, [sessions])

  const stats = useMemo(() => {
    const totalHits = endedSessions.reduce((acc, s) => acc + s.hits.length, 0)
    const totalMins = endedSessions.reduce((acc, s) => {
      if (!s.endedAt) return acc
      const ms = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
      return acc + ms / 60000
    }, 0)
    return {
      sessionCount: endedSessions.length,
      totalHits,
      avgPerSession: endedSessions.length ? (totalHits / endedSessions.length).toFixed(1) : '0',
      totalMins: Math.round(totalMins),
    }
  }, [endedSessions])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1 className={styles.title}>Trends</h1>
      </header>

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
            <span className={styles.statLabel}>Avg per session</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.totalMins}m</span>
            <span className={styles.statLabel}>Total time</span>
          </div>
        </div>
      </section>

      <section className={styles.list}>
        <h2 className={styles.sectionTitle}>Past sessions</h2>
        {endedSessions.length === 0 ? (
          <p className={styles.empty}>No sessions yet. Start one from the dashboard.</p>
        ) : (
          <ul className={styles.sessionList}>
            {endedSessions.slice(0, 20).map((s, i) => {
              const start = new Date(s.startedAt)
              const end = s.endedAt ? new Date(s.endedAt) : null
              const mins = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0
              return (
                <li key={s.id} className={styles.sessionItem}>
                  <span className={styles.sessionNum}>#{endedSessions.length - i}</span>
                  <span className={styles.sessionDate}>{start.toLocaleDateString()}</span>
                  <span className={styles.sessionMeta}>{mins} min · {s.hits.length} events</span>
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
