import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { GoalLevel, DailyStatKey, TaskCategory } from '../types'
import styles from './Settings.module.css'

type PairState = 'idle' | 'waiting' | 'pairing' | 'success' | 'error'

const GOAL_CARDS: { key: GoalLevel; emoji: string; tagline: string; bestFor: string }[] = [
  {
    key: 'Gentle',
    emoji: '🌸',
    tagline: 'Hunchie is forgiving',
    bestFor: 'Users who want a gentle companion without stress',
  },
  {
    key: 'Standard',
    emoji: '🦔',
    tagline: 'Hunchie keeps you honest',
    bestFor: 'Users who want balanced accountability',
  },
  {
    key: 'Strict',
    emoji: '🔥',
    tagline: 'Hunchie means business',
    bestFor: 'Users who want real consequences and maximum focus pressure',
  },
]

const STAT_OPTIONS: { key: DailyStatKey; label: string; description: string }[] = [
  { key: 'minutes', label: 'Minutes', description: 'Total session time today' },
  { key: 'hunches', label: 'Hunches', description: 'Number of posture corrections' },
  { key: 'mood', label: 'Hunchie Mood', description: 'How Hunchie feels about your day' },
  { key: 'weekList', label: 'Weekly Sessions', description: 'Session history for the week' },
]

export function Settings() {
  const navigate = useNavigate()
  const {
    userName,
    deviceName,
    settings,
    updateSettings,
    updateUserName,
    updateDeviceName,
    replayOnboarding,
  } = useApp()

  const [editName, setEditName] = useState(userName || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [confirmGoal, setConfirmGoal] = useState<GoalLevel | null>(null)

  // Pairing state
  const [pairState, setPairState] = useState<PairState>('idle')
  const [pairProgress, setPairProgress] = useState(0)

  const handleSaveName = () => {
    const trimmed = editName.trim()
    if (!trimmed) return
    updateUserName(trimmed)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  // Pairing flow (matches onboarding)
  useEffect(() => {
    if (pairState !== 'waiting') return
    const t = setTimeout(() => {
      setPairState('pairing')
      setPairProgress(0)
    }, 2000)
    return () => clearTimeout(t)
  }, [pairState])

  useEffect(() => {
    if (pairState !== 'pairing') return
    const duration = 4000
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setPairProgress((elapsed / duration) * 100)
      if (elapsed >= duration) {
        clearInterval(interval)
        if (Math.random() < 0.15) {
          setPairState('error')
        } else {
          setPairState('success')
          updateDeviceName('Hunchie')
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [pairState, updateDeviceName])

  const handleStartPairing = () => {
    setPairState('waiting')
    setPairProgress(0)
  }

  const handleRetryPair = () => {
    setPairState('idle')
    setPairProgress(0)
  }

  const handleDismissPairSuccess = () => {
    setPairState('idle')
  }

  // Daily stats toggles
  const dailyStats = settings.dailyStats ?? ['minutes', 'hunches', 'mood', 'weekList']

  const toggleStat = (key: DailyStatKey) => {
    const current = [...dailyStats]
    const idx = current.indexOf(key)
    if (idx >= 0) {
      if (current.length <= 1) return // keep at least one
      current.splice(idx, 1)
    } else {
      current.push(key)
    }
    updateSettings({ dailyStats: current })
  }

  // Goals
  const handleGoalClick = (level: GoalLevel) => {
    if (level === settings.goal) return
    setConfirmGoal(level)
  }

  const handleConfirmGoal = () => {
    if (!confirmGoal) return
    updateSettings({ goal: confirmGoal })
    setConfirmGoal(null)
  }

  const isDemo = deviceName?.toLowerCase().includes('demo')
  const secsLeft = Math.max(0, 4 - Math.ceil((pairProgress / 100) * 4))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <div className={styles.content}>
        {/* ── Profile ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Profile</h2>
          <label className={styles.fieldLabel} htmlFor="settings-name">Your name</label>
          <div className={styles.nameRow}>
            <input
              id="settings-name"
              type="text"
              className={styles.nameInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="Enter your name"
            />
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveName}
              disabled={!editName.trim() || editName.trim() === userName}
            >
              {nameSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </section>

        {/* ── Device / Pair ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Your Hunchie</h2>
          <div className={styles.deviceInfo}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Device</span>
              <span className={styles.rowValue}>{deviceName || 'Not paired'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Status</span>
              <span className={`${styles.rowValue} ${isDemo ? styles.statusDemo : styles.statusConnected}`}>
                {isDemo ? 'Demo mode' : deviceName ? 'Connected' : 'Not connected'}
              </span>
            </div>
          </div>

          {pairState === 'idle' && (
            <button type="button" className={styles.pairBtn} onClick={handleStartPairing}>
              Pair New Hunchie
            </button>
          )}

          {pairState === 'waiting' && (
            <div className={styles.pairFlow}>
              <p className={styles.pairInstruction}>Hold the button on your Hunchie for 3 seconds...</p>
              <div className={styles.pairDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          {pairState === 'pairing' && (
            <div className={styles.pairFlow}>
              <div className={styles.progressWrap}>
                <div className={styles.progressBar} style={{ width: `${pairProgress}%` }} />
              </div>
              <p className={styles.pairStatus}>Pairing... {secsLeft}s</p>
            </div>
          )}

          {pairState === 'success' && (
            <div className={styles.pairFlow}>
              <p className={styles.pairSuccess}>Paired successfully!</p>
              <button type="button" className={styles.saveBtn} onClick={handleDismissPairSuccess}>
                Done
              </button>
            </div>
          )}

          {pairState === 'error' && (
            <div className={styles.pairFlow}>
              <p className={styles.pairError}>Couldn't connect. Make sure Hunchie is nearby.</p>
              <button type="button" className={styles.pairBtn} onClick={handleRetryPair}>
                Try Again
              </button>
            </div>
          )}
        </section>

        {/* ── Daily Stats ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Daily Stats</h2>
          <p className={styles.cardSub}>Choose what shows on your home screen.</p>
          <div className={styles.statsList}>
            {STAT_OPTIONS.map((stat) => {
              const active = dailyStats.includes(stat.key)
              return (
                <button
                  key={stat.key}
                  type="button"
                  className={active ? styles.statToggleActive : styles.statToggle}
                  onClick={() => toggleStat(stat.key)}
                >
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={styles.statDesc}>{stat.description}</span>
                  </div>
                  <span className={active ? styles.toggleOn : styles.toggleOff}>
                    {active ? 'ON' : 'OFF'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Goals ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Goals</h2>
          <p className={styles.cardSub}>How strict should Hunchie be?</p>
          <div className={styles.goalGrid}>
            {GOAL_CARDS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={`${styles.goalCard} ${settings.goal === g.key ? styles.goalCardActive : ''}`}
                onClick={() => handleGoalClick(g.key)}
              >
                <span className={styles.goalEmoji}>{g.emoji}</span>
                <span className={styles.goalName}>{g.key}</span>
                <span className={styles.goalTagline}>{g.tagline}</span>
                <span className={styles.goalBestFor}>Best for: {g.bestFor}</span>
                {settings.goal === g.key && <span className={styles.goalCheck}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Task Category ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Break & Recovery Tasks</h2>
          <p className={styles.cardSub}>Choose what type of activities Hunchie suggests during breaks and recovery missions.</p>
          <div className={styles.goalGrid}>
            {([
              { key: 'posture' as TaskCategory, emoji: '🧘', name: 'Posture', desc: 'Stretches and posture correction exercises' },
              { key: 'fitness' as TaskCategory, emoji: '💪', name: 'Fitness', desc: 'Active exercises like jumping jacks and squats' },
              { key: 'mindfulness' as TaskCategory, emoji: '🧠', name: 'Mindfulness', desc: 'Breathing, meditation, and body scans' },
              { key: 'creative' as TaskCategory, emoji: '🎨', name: 'Creative', desc: 'Drawing, writing, and imaginative activities' },
            ]).map((t) => (
              <button
                key={t.key}
                type="button"
                className={`${styles.goalCard} ${(settings.taskCategory ?? 'posture') === t.key ? styles.goalCardActive : ''}`}
                onClick={() => updateSettings({ taskCategory: t.key })}
              >
                <span className={styles.goalEmoji}>{t.emoji}</span>
                <span className={styles.goalName}>{t.name}</span>
                <span className={styles.goalBestFor}>{t.desc}</span>
                {(settings.taskCategory ?? 'posture') === t.key && <span className={styles.goalCheck}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tutorial & Demo ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Tutorial & Demo</h2>
          <p className={styles.cardSub}>
            Replay the feature tutorial or restart the full onboarding flow.
          </p>
          <button
            type="button"
            className={styles.resetOnboardingBtn}
            onClick={() => {
              localStorage.removeItem('hunchie-coach-seen')
              navigate('/dashboard', { replace: true, state: { showTutorial: true } })
            }}
          >
            Replay Tutorial
          </button>
          <button
            type="button"
            className={styles.resetOnboardingBtn}
            style={{ marginTop: 8 }}
            onClick={() => {
              replayOnboarding()
              navigate('/onboarding', { replace: true })
            }}
          >
            Restart Onboarding
          </button>
        </section>
      </div>

      {/* ── Goal confirmation overlay ── */}
      {confirmGoal && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmCard}>
            <p className={styles.confirmText}>
              Change to <strong>{confirmGoal}</strong>? This will adjust how Hunchie reacts going forward. Your current HP and inventory are kept.
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.confirmYes} onClick={handleConfirmGoal}>
                Switch
              </button>
              <button type="button" className={styles.confirmNo} onClick={() => setConfirmGoal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
