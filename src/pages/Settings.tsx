import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { GoalLevel, NudgeFrequency, InsightsLevel, BackgroundChoice } from '../types'
import styles from './Settings.module.css'

type SettingsTab = 'device' | 'goals' | 'nudges' | 'insights' | 'background'

const BG_OPTIONS: { key: BackgroundChoice; label: string; src: string }[] = [
  { key: 'clouds', label: 'Clouds', src: '/bg-clouds.jpg' },
  { key: 'sky', label: 'Sky', src: '/bg-sky.jpg' },
  { key: 'stars', label: 'Stars', src: '/bg-stars.jpg' },
  { key: 'pastel', label: 'Pastel', src: '/bg-pastel.jpg' },
]

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

export function Settings() {
  const navigate = useNavigate()
  const { deviceName, settings, updateSettings, replayOnboarding } = useApp()
  const [tab, setTab] = useState<SettingsTab>('device')
  const [confirmGoal, setConfirmGoal] = useState<GoalLevel | null>(null)
  const [confirmReplay, setConfirmReplay] = useState(false)

  const handleGoalClick = (level: GoalLevel) => {
    if (level === settings.goal) return
    setConfirmGoal(level)
  }

  const handleConfirmGoal = () => {
    if (!confirmGoal) return
    updateSettings({ goal: confirmGoal })
    setConfirmGoal(null)
  }

  const handleConfirmReplay = () => {
    setConfirmReplay(false)
    replayOnboarding()
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <nav className={styles.tabs}>
        {(['device', 'goals', 'nudges', 'insights', 'background'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {tab === 'device' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>One clear decision: your device.</p>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Status</span>
              <span className={styles.rowValue}>{deviceName || 'Not set'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Connection</span>
              <span className={styles.rowValue}>
                {deviceName?.toLowerCase().includes('demo') ? 'Demo mode' : 'Connected'}
              </span>
            </div>

            <div className={styles.replaySection}>
              <button
                type="button"
                className={styles.replayBtn}
                onClick={() => setConfirmReplay(true)}
              >
                Replay Tutorial
              </button>
              <p className={styles.replayHint}>Walk through the onboarding tutorial again</p>
            </div>

            {confirmReplay && (
              <div className={styles.confirmOverlay}>
                <div className={styles.confirmCard}>
                  <p className={styles.confirmText}>
                    This will replay the full onboarding tutorial. Continue?
                  </p>
                  <div className={styles.confirmActions}>
                    <button type="button" className={styles.confirmYes} onClick={handleConfirmReplay}>
                      Yes, replay
                    </button>
                    <button type="button" className={styles.confirmNo} onClick={() => setConfirmReplay(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'goals' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>How strict should Hunchie be?</p>
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
          </section>
        )}

        {tab === 'nudges' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>When to get reminders.</p>
            {(['Daily', 'Daily + Weekly', 'Off'] as NudgeFrequency[]).map((freq) => (
              <button
                key={freq}
                type="button"
                className={settings.nudgeFrequency === freq ? styles.optionActive : styles.option}
                onClick={() => updateSettings({ nudgeFrequency: freq })}
              >
                <span className={styles.optionLabel}>{freq}</span>
                {settings.nudgeFrequency === freq && <span className={styles.optionCheck}>✓</span>}
              </button>
            ))}
          </section>
        )}

        {tab === 'insights' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>Trends and summaries.</p>
            {(['On', 'Off'] as InsightsLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                className={settings.insights === level ? styles.optionActive : styles.option}
                onClick={() => updateSettings({ insights: level })}
              >
                <span className={styles.optionLabel}>{level}</span>
                {settings.insights === level && <span className={styles.optionCheck}>✓</span>}
              </button>
            ))}
          </section>
        )}

        {tab === 'background' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>Choose Hunchie's world.</p>
            <div className={styles.bgGrid}>
              {BG_OPTIONS.map((bg) => (
                <button
                  key={bg.key}
                  type="button"
                  className={`${styles.bgThumb} ${(settings.background ?? 'clouds') === bg.key ? styles.bgThumbActive : ''}`}
                  onClick={() => updateSettings({ background: bg.key })}
                >
                  <img src={bg.src} alt={bg.label} className={styles.bgImg} />
                  <span className={styles.bgLabel}>{bg.label}</span>
                  {(settings.background ?? 'clouds') === bg.key && (
                    <span className={styles.bgCheck}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
