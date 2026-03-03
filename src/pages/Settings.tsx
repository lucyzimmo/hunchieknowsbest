import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { GoalLevel, NudgeFrequency, InsightsLevel } from '../types'
import styles from './Settings.module.css'

type SettingsTab = 'device' | 'goals' | 'nudges' | 'insights'

export function Settings() {
  const navigate = useNavigate()
  const { deviceName, settings, updateSettings } = useApp()
  const [tab, setTab] = useState<SettingsTab>('device')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <nav className={styles.tabs}>
        {(['device', 'goals', 'nudges', 'insights'] as const).map((t) => (
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
          </section>
        )}

        {tab === 'goals' && (
          <section className={styles.section}>
            <p className={styles.sectionIntro}>How strict should Hunchie be?</p>
            {(['Gentle', 'Standard', 'Strict'] as GoalLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                className={settings.goal === level ? styles.optionActive : styles.option}
                onClick={() => updateSettings({ goal: level })}
              >
                <span className={styles.optionLabel}>{level}</span>
                {settings.goal === level && <span className={styles.optionCheck}>✓</span>}
              </button>
            ))}
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
      </div>
    </div>
  )
}
