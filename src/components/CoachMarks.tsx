import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CoachMarks.module.css'

interface CoachStep {
  title: string
  body: string
  targetSelector: string
  navigateTo?: string
  boldText?: string
  isReward?: boolean
}

const STEPS: CoachStep[] = [
  {
    title: 'Meet Hunchie!',
    body: 'Hunchie is your posture buddy! This little hedgehog sits on your desk and reacts when you slouch. Keep sitting tall to keep Hunchie happy!',
    targetSelector: '[data-coach="today"]',
    boldText: 'reacts when you slouch',
  },
  {
    title: 'Start a Focus Session',
    body: 'Tap here to begin a 25-minute focus session. Hunchie will watch your posture — mild slouches cause a tremble, big ones leave bandaids stacking up on Hunchie!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'Start Session',
  },
  {
    title: 'Breaks & Treats',
    body: 'Every 25 minutes, Hunchie suggests a fun screen-free break. Complete it to earn a mystery treat — from common blueberries to the legendary Golden Mushroom!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'Golden Mushroom',
  },
  {
    title: 'Feed to Heal',
    body: 'Feed treats to Hunchie to restore HP! Each treat heals different amounts. Save your rare ones for big hits — Hunchie will catch and munch them with a happy wiggle!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'restore HP',
  },
  {
    title: 'Don\'t Let HP Hit Zero!',
    body: 'If Hunchie\'s health drops to zero, Hunchie waddles away into the forest! Complete real-life recovery missions to bring Hunchie hopping back with flowers blooming!',
    targetSelector: '[data-coach="trends"]',
    boldText: 'recovery missions',
  },
  {
    title: 'Track Your Journey',
    body: 'Check your posture trends over time — see your best sessions, track improvements, and celebrate your streaks!',
    targetSelector: '[data-coach="trends"]',
    navigateTo: '/trends',
    boldText: 'posture trends',
  },
  {
    title: 'Make It Yours',
    body: 'Choose your difficulty (Gentle, Standard, or Strict), swap backgrounds, and replay this tutorial anytime!',
    targetSelector: '[data-coach="settings"]',
    navigateTo: '/settings',
    boldText: 'difficulty',
  },
  {
    title: 'You\'re Ready!',
    body: 'Here\'s a welcome treat for Hunchie! Start your first session and keep that posture strong. Hunchie believes in you!',
    targetSelector: '[data-coach="start-session"]',
    boldText: 'welcome treat',
    isReward: true,
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [arrowPath, setArrowPath] = useState('')
  const [tooltipPos, setTooltipPos] = useState<'bottom' | 'top'>('bottom')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Show tutorial: either forced (help button) or first time
  useEffect(() => {
    if (force) {
      setStep(0)
      setVisible(true)
    }
  }, [force])

  // Auto-show on first visit (no localStorage key)
  useEffect(() => {
    if (!force) {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        setStep(0)
        setVisible(true)
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const computeLayout = useCallback(() => {
    const current = STEPS[step]
    if (!current) return

    const el = document.querySelector(current.targetSelector)
    if (!el) {
      // Target not found — still show tooltip, just no arrow/highlight
      setTargetRect(null)
      setArrowPath('')
      return
    }

    const rect = el.getBoundingClientRect()
    setTargetRect(rect)

    const targetCenterY = rect.top + rect.height / 2
    const viewH = window.innerHeight
    const pos = targetCenterY < viewH * 0.45 ? 'bottom' : 'top'
    setTooltipPos(pos)

    // Compute arrow after tooltip repositions
    requestAnimationFrame(() => {
      const tooltip = tooltipRef.current
      if (!tooltip) return

      const tRect = tooltip.getBoundingClientRect()
      const endX = rect.left + rect.width / 2
      const endY = rect.top + rect.height / 2

      let startX: number
      let startY: number

      if (pos === 'bottom') {
        startX = tRect.left + tRect.width * 0.7
        startY = tRect.top
      } else {
        startX = tRect.left + tRect.width * 0.7
        startY = tRect.bottom
      }

      const dx = endX - startX
      const dy = endY - startY
      const cp1x = startX + dx * 0.1
      const cp1y = startY + dy * 0.6
      const cp2x = startX + dx * 0.7
      const cp2y = startY + dy * 0.2

      setArrowPath(`M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`)
    })
  }, [step])

  useEffect(() => {
    if (!visible) return
    // Run layout computation with a small delay then on resize/scroll
    const timer = setTimeout(computeLayout, 200)
    window.addEventListener('resize', computeLayout)
    window.addEventListener('scroll', computeLayout, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', computeLayout)
      window.removeEventListener('scroll', computeLayout, true)
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

  const isLargeTarget = targetRect && (targetRect.width > 120 || targetRect.height > 80)

  return (
    <div
      className={styles.overlay}
      data-testid="coach-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* SVG arrow */}
      <svg className={styles.arrowSvg}>
        <defs>
          <filter id="glowArrow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrowHead" markerWidth="16" markerHeight="12" refX="13" refY="6" orient="auto">
            <path d="M 0 0 L 16 6 L 0 12 L 4 6 Z" fill="#FFF8C4" />
          </marker>
        </defs>
        {arrowPath && (
          <>
            <path
              d={arrowPath}
              fill="none"
              stroke="#FFF176"
              strokeWidth="8"
              strokeDasharray="14 10"
              filter="url(#glowArrow)"
              opacity="0.5"
              className={styles.arrowGlow}
            />
            <path
              d={arrowPath}
              fill="none"
              stroke="#FFF8C4"
              strokeWidth="3.5"
              strokeDasharray="14 10"
              strokeLinecap="round"
              markerEnd="url(#arrowHead)"
              className={styles.arrowMain}
            />
          </>
        )}
      </svg>

      {/* Circle highlight for small targets */}
      {targetRect && !isLargeTarget && (
        <div
          className={styles.targetHighlight}
          style={{
            left: targetRect.left + targetRect.width / 2,
            top: targetRect.top + targetRect.height / 2,
            width: Math.max(targetRect.width, targetRect.height) + 36,
            height: Math.max(targetRect.width, targetRect.height) + 36,
          }}
        >
          <div className={styles.targetRingOuter} />
          <div className={styles.targetRingInner} />
        </div>
      )}

      {/* Rounded rect highlight for large targets */}
      {targetRect && isLargeTarget && (
        <div
          className={styles.targetHighlightRect}
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Cursor hint */}
      {targetRect && (
        <div
          className={styles.cursorHint}
          style={{
            left: targetRect.left + targetRect.width / 2 + 14,
            top: targetRect.top + targetRect.height / 2 + 10,
          }}
        >
          <span className={styles.cursorEmoji}>👆</span>
        </div>
      )}

      {/* Tooltip */}
      <div
        className={`${styles.tooltipCard} ${tooltipPos === 'top' ? styles.tooltipTop : styles.tooltipBottom}`}
        ref={tooltipRef}
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
}
