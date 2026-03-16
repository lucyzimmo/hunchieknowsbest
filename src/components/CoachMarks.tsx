import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CoachMarks.module.css'

interface CoachStep {
  title: string
  body: string
  targetSelector: string // CSS selector for the element to highlight
  navigateTo?: string // optional route to navigate on "Got it!"
  boldText?: string // text to bold in body
  isReward?: boolean // show treat reward on this step
}

const STEPS: CoachStep[] = [
  {
    title: 'Quick Start: Feature Spotlight!',
    body: 'Welcome! This is where you track your posture. Let\'s start by tapping Start Session — Hunchie will watch your back!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'Start Session',
  },
  {
    title: 'Today at a Glance',
    body: 'Your daily stats live here — session time, slouch count, and Hunchie\'s mood. Keep Hunchie happy by sitting tall!',
    targetSelector: '[data-coach="today"]',
    boldText: 'daily stats',
  },
  {
    title: 'See Your Trends!',
    body: 'Track your posture journey over time. Tap Trends to see weekly patterns and celebrate your streaks!',
    targetSelector: '[data-coach="trends"]',
    navigateTo: '/trends',
    boldText: 'Trends',
  },
  {
    title: 'Make It Yours!',
    body: 'Adjust goals, difficulty, and more in Settings. You can also replay this tutorial anytime from there!',
    targetSelector: '[data-coach="settings"]',
    navigateTo: '/settings',
    boldText: 'Settings',
  },
  {
    title: 'You\'re All Set!',
    body: 'Great job completing the tutorial! Here\'s a treat for Hunchie as a welcome gift. Feed it during a session to restore HP!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'treat',
    isReward: true,
  },
]

const STORAGE_KEY = 'hunchie-coach-seen'

interface Props {
  force?: boolean
  onDismiss?: () => void
  onComplete?: () => void // called when tutorial finishes (to award treat)
}

export function CoachMarks({ force, onDismiss, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [arrowPath, setArrowPath] = useState('')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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

  const computeLayout = useCallback(() => {
    const current = STEPS[step]
    if (!current) return

    const el = document.querySelector(current.targetSelector)
    if (!el) {
      setTargetRect(null)
      setArrowPath('')
      return
    }

    const rect = el.getBoundingClientRect()
    setTargetRect(rect)

    // Compute arrow path from tooltip area to target
    const tooltip = tooltipRef.current
    if (tooltip) {
      const tRect = tooltip.getBoundingClientRect()
      const startX = tRect.right - 40
      const startY = tRect.top + 30
      const endX = rect.left + rect.width / 2
      const endY = rect.top + rect.height / 2

      // Create a graceful curve
      const midX = (startX + endX) / 2 + (endX - startX) * 0.3
      const midY = Math.min(startY, endY) - 80
      const path = `M ${startX} ${startY} Q ${midX} ${midY}, ${endX} ${endY}`
      setArrowPath(path)
    }
  }, [step])

  useEffect(() => {
    if (!visible) return
    // Small delay to let DOM settle
    const timer = setTimeout(computeLayout, 100)
    window.addEventListener('resize', computeLayout)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', computeLayout)
    }
  }, [visible, step, computeLayout])

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

  // Render body with bold text
  const renderBody = () => {
    if (!current.boldText) return current.body
    const idx = current.body.indexOf(current.boldText)
    if (idx === -1) return current.body
    const before = current.body.slice(0, idx)
    const bold = current.body.slice(idx, idx + current.boldText.length)
    const after = current.body.slice(idx + current.boldText.length)
    return (
      <>
        {before}<strong>{bold}</strong>{after}
      </>
    )
  }

  return (
    <div className={styles.overlay}>
      {/* SVG arrow layer */}
      <svg className={styles.arrowSvg} width="100%" height="100%">
        <defs>
          <filter id="glowArrow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrowHead"
            markerWidth="14"
            markerHeight="10"
            refX="12"
            refY="5"
            orient="auto"
          >
            <path d="M 0 0 L 14 5 L 0 10 L 3 5 Z" fill="#FFF8C4" />
          </marker>
        </defs>
        {arrowPath && (
          <>
            {/* Glow layer */}
            <path
              d={arrowPath}
              fill="none"
              stroke="#FFF176"
              strokeWidth="6"
              strokeDasharray="12 8"
              filter="url(#glowArrow)"
              opacity="0.6"
              className={styles.arrowGlow}
            />
            {/* Main dashed arrow */}
            <path
              d={arrowPath}
              fill="none"
              stroke="#FFF8C4"
              strokeWidth="3"
              strokeDasharray="12 8"
              markerEnd="url(#arrowHead)"
              className={styles.arrowMain}
            />
          </>
        )}
      </svg>

      {/* Glowing highlight ring around target */}
      {targetRect && (
        <div
          className={styles.targetHighlight}
          style={{
            left: targetRect.left + targetRect.width / 2,
            top: targetRect.top + targetRect.height / 2,
            width: Math.max(targetRect.width, targetRect.height) + 32,
            height: Math.max(targetRect.width, targetRect.height) + 32,
          }}
        >
          <div className={styles.targetRingOuter} />
          <div className={styles.targetRingInner} />
        </div>
      )}

      {/* Cursor hint on target */}
      {targetRect && (
        <div
          className={styles.cursorHint}
          style={{
            left: targetRect.left + targetRect.width / 2 + 12,
            top: targetRect.top + targetRect.height / 2 + 8,
          }}
        >
          <span className={styles.cursorEmoji}>👆</span>
        </div>
      )}

      {/* Tooltip card */}
      <div className={styles.tooltipCard} ref={tooltipRef}>
        <div className={styles.tooltipInner}>
          {/* Progress dots */}
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
                <img
                  src="/hunchie-character.png"
                  alt="Hunchie"
                  className={styles.mascotImg}
                />
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
              Got it!
            </button>
          </div>

          <span className={styles.stepCount}>{step + 1} / {STEPS.length}</span>
        </div>
      </div>
    </div>
  )
}
