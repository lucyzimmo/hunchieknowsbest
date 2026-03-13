import { useState, useEffect } from 'react'
import styles from './CoachMarks.module.css'

const STEPS = [
  {
    title: 'Welcome to your session!',
    body: 'Hunchie sits on your desk and detects when you slouch. Let\'s learn the basics.',
  },
  {
    title: 'Health Bar',
    body: 'This shows Hunchie\'s HP. Every time you slouch, Hunchie loses health. Keep it high!',
  },
  {
    title: 'Posture Hits',
    body: 'Hits are logged automatically when Hunchie detects slouching. In demo mode, you can tap the buttons below to simulate hits.',
  },
  {
    title: 'Treats & Feeding',
    body: 'Complete Pomodoro breaks to earn treats. Feed them to Hunchie to restore health!',
  },
  {
    title: 'Breaks',
    body: 'Every 25 minutes, Hunchie suggests a break activity. Complete it to earn a treat reward!',
  },
  {
    title: 'Keep Hunchie Happy!',
    body: 'If Hunchie\'s health drops to zero, Hunchie runs away! Complete a quick posture task to bring Hunchie back.',
  },
]

const STORAGE_KEY = 'hunchie-coach-seen'

interface Props {
  force?: boolean
  onDismiss?: () => void
}

export function CoachMarks({ force, onDismiss }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (force) {
      setStep(0)
      setVisible(true)
      return
    }
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setVisible(true)
    }
  }, [force])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    onDismiss?.()
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <span key={i} className={i <= step ? styles.dotActive : styles.dot} />
          ))}
        </div>
        <h3 className={styles.title}>{current.title}</h3>
        <p className={styles.body}>{current.body}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.skipBtn} onClick={handleDismiss}>
            Skip
          </button>
          <button type="button" className={styles.nextBtn} onClick={handleNext}>
            {step < STEPS.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
        <span className={styles.stepCount}>{step + 1} / {STEPS.length}</span>
      </div>
    </div>
  )
}
