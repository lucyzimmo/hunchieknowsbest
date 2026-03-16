import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styles from './CoachMarks.module.css'

interface CoachStep {
  title: string
  body: string
  boldText?: string
  navigateTo?: string
  isReward?: boolean
  // Arrow target as viewport percentage (where the glow ring + arrow points)
  targetX: number // % from left
  targetY: number // % from top
  ringSize: number // px diameter of glow ring
}

const STEPS: CoachStep[] = [
  {
    title: 'Meet Hunchie!',
    body: 'Hunchie is your posture buddy! This little hedgehog sits on your desk and reacts when you slouch. Keep sitting tall to keep Hunchie happy!',
    boldText: 'reacts when you slouch',
    targetX: 50, targetY: 25, ringSize: 80,
  },
  {
    title: 'Start a Focus Session',
    body: 'Tap here to begin a 25-minute focus session. Hunchie will watch your posture — mild slouches cause a tremble, big ones leave bandaids stacking up!',
    boldText: 'Start Session',
    targetX: 50, targetY: 62, ringSize: 70,
  },
  {
    title: 'Breaks & Treats',
    body: 'Every 25 minutes, Hunchie suggests a fun screen-free break. Complete it to earn a mystery treat — from common blueberries to the legendary Golden Mushroom!',
    boldText: 'Golden Mushroom',
    targetX: 50, targetY: 62, ringSize: 70,
  },
  {
    title: 'Feed to Heal',
    body: 'Feed treats to Hunchie to restore HP! Each treat heals different amounts. Save your rare ones for big hits — Hunchie will catch and munch them with a happy wiggle!',
    boldText: 'restore HP',
    targetX: 50, targetY: 62, ringSize: 70,
  },
  {
    title: 'Don\'t Let HP Hit Zero!',
    body: 'If Hunchie\'s health drops to zero, Hunchie waddles away into the forest! Complete real-life recovery missions to bring Hunchie hopping back with flowers blooming!',
    boldText: 'recovery missions',
    targetX: 30, targetY: 78, ringSize: 60,
  },
  {
    title: 'Track Your Journey',
    body: 'Check your posture trends over time — see your best sessions, track improvements, and celebrate your streaks!',
    boldText: 'posture trends',
    navigateTo: '/trends',
    targetX: 30, targetY: 78, ringSize: 60,
  },
  {
    title: 'Make It Yours',
    body: 'Choose your difficulty (Gentle, Standard, or Strict), swap backgrounds, and replay this tutorial anytime!',
    boldText: 'difficulty',
    navigateTo: '/settings',
    targetX: 55, targetY: 78, ringSize: 60,
  },
  {
    title: 'You\'re Ready!',
    body: 'Here\'s a welcome treat for Hunchie! Start your first session and keep that posture strong. Hunchie believes in you!',
    boldText: 'welcome treat',
    isReward: true,
    targetX: 50, targetY: 62, ringSize: 70,
  },
]

const STORAGE_KEY = 'hunchie-coach-seen'

interface Props {
  force?: boolean
  onDismiss?: () => void
  onComplete?: () => void
}

export function CoachMarks({ force, onDismiss, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  // Show on force (help button click)
  useEffect(() => {
    if (force) {
      setStep(0)
      setVisible(true)
    }
  }, [force])

  // Auto-show on first visit
  useEffect(() => {
    if (!force) {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        setStep(0)
        setVisible(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGotIt = () => {
    const current = STEPS[step]
    if (current.navigateTo) {
      finishTutorial()
      navigate(current.navigateTo)
      return
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      finishTutorial()
    }
  }

  const finishTutorial = () => {
    const isFirstTime = !force
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    if (isFirstTime) onComplete?.()
    onDismiss?.()
  }

  const handleSkip = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    onDismiss?.()
  }

  if (!visible) return null

  const current = STEPS[step]

  // Bold text rendering
  const renderBody = () => {
    if (!current.boldText) return current.body
    const idx = current.body.indexOf(current.boldText)
    if (idx === -1) return current.body
    return (
      <>
        {current.body.slice(0, idx)}
        <strong>{current.boldText}</strong>
        {current.body.slice(idx + current.boldText.length)}
      </>
    )
  }

  // Arrow path: S-curve from tooltip area to target
  // Tooltip is at bottom ~85%, arrow curves up to target
  const tx = current.targetX
  const ty = current.targetY
  const startX = 65 // % — right side of tooltip
  const startY = 72 // % — top of tooltip area
  // Control points for a nice S-curve (in %)
  const cp1x = startX + 5
  const cp1y = startY - (startY - ty) * 0.3
  const cp2x = tx + 10
  const cp2y = ty + (startY - ty) * 0.2

  const svgPath = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`

  const content = (
    <div
      className={styles.overlay}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* SVG Arrow — uses viewBox 0 0 100 100 so we work in percentages */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10001,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="coachGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="coachArrowHead" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
            <path d="M 0 0 L 3 1 L 0 2 L 0.6 1 Z" fill="#FFF8C4" />
          </marker>
        </defs>
        {/* Glow layer */}
        <path
          d={svgPath}
          fill="none"
          stroke="#FFF176"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          filter="url(#coachGlow)"
          opacity="0.6"
          className={styles.arrowGlow}
        />
        {/* Main dashed arrow */}
        <path
          d={svgPath}
          fill="none"
          stroke="#FFF8C4"
          strokeWidth="0.5"
          strokeDasharray="2 1.5"
          strokeLinecap="round"
          markerEnd="url(#coachArrowHead)"
          className={styles.arrowMain}
        />
      </svg>

      {/* Glowing ring at target */}
      <div
        className={styles.targetHighlight}
        style={{
          position: 'fixed',
          left: `${current.targetX}%`,
          top: `${current.targetY}%`,
          width: current.ringSize,
          height: current.ringSize,
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      >
        <div className={styles.targetRingOuter} />
        <div className={styles.targetRingInner} />
      </div>

      {/* Cursor hint */}
      <div
        style={{
          position: 'fixed',
          left: `calc(${current.targetX}% + 16px)`,
          top: `calc(${current.targetY}% + 10px)`,
          zIndex: 10002,
          pointerEvents: 'none',
          fontSize: 32,
        }}
        className={styles.cursorHint}
      >
        👆
      </div>

      {/* Tooltip card */}
      <div
        className={styles.tooltipCard}
        style={{
          position: 'fixed',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 420,
          width: 'calc(100% - 48px)',
          zIndex: 10003,
        }}
      >
        <div className={styles.tooltipInner}>
          <div className={styles.progress}>
            {STEPS.map((_, i) => (
              <span key={i} className={i === step ? styles.dotActive : styles.dot} />
            ))}
          </div>

          <h3 className={styles.title}>{current.title}</h3>

          <div className={styles.tooltipContent}>
            <div className={styles.mascotWrap}>
              {current.isReward ? (
                <span className={styles.treatReward}>🍎</span>
              ) : (
                <img src="/hunchie-character.png" alt="Hunchie" className={styles.mascotImg} />
              )}
            </div>
            <p className={styles.body}>{renderBody()}</p>
          </div>

          <div className={styles.actions}>
            {step < STEPS.length - 1 && (
              <button type="button" className={styles.skipBtn} onClick={handleSkip}>
                Skip
              </button>
            )}
            <button type="button" className={styles.gotItBtn} onClick={handleGotIt}>
              {current.isReward ? 'Claim Treat!' : 'Got it!'}
            </button>
          </div>

          <span className={styles.stepCount}>{step + 1} / {STEPS.length}</span>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
