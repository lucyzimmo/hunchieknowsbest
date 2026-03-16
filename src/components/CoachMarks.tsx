import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styles from './CoachMarks.module.css'

interface CoachStep {
  title: string
  body: string
  boldText?: string
  navigateTo?: string
  isReward?: boolean
  // Where arrow points (viewport %)
  targetX: number
  targetY: number
  ringSize: number
}

const STEPS: CoachStep[] = [
  {
    title: 'Meet Hunchie!',
    body: 'Hunchie is your posture buddy! This little hedgehog sits on your desk and reacts when you slouch. Keep sitting tall to keep Hunchie happy!',
    boldText: 'reacts when you slouch',
    targetX: 50, targetY: 22, ringSize: 90,
  },
  {
    title: 'Start a Focus Session',
    body: 'Tap here to begin a 25-minute focus session. Hunchie will watch your posture — mild slouches cause a tremble, big ones leave bandaids stacking up!',
    boldText: 'Start Session',
    targetX: 50, targetY: 60, ringSize: 80,
  },
  {
    title: 'Breaks & Treats',
    body: 'Every 25 minutes, Hunchie suggests a fun screen-free break. Complete it to earn a mystery treat — from common blueberries to the legendary Golden Mushroom!',
    boldText: 'Golden Mushroom',
    targetX: 50, targetY: 60, ringSize: 80,
  },
  {
    title: 'Feed to Heal',
    body: 'Feed treats to Hunchie to restore HP! Each treat heals different amounts. Save your rare ones for big hits — Hunchie will catch and munch them with a happy wiggle!',
    boldText: 'restore HP',
    targetX: 50, targetY: 60, ringSize: 80,
  },
  {
    title: 'Don\'t Let HP Hit Zero!',
    body: 'If Hunchie\'s health drops to zero, Hunchie waddles away into the forest! Complete real-life recovery missions to bring Hunchie hopping back with flowers blooming!',
    boldText: 'recovery missions',
    targetX: 35, targetY: 75, ringSize: 70,
  },
  {
    title: 'Track Your Journey',
    body: 'Check your posture trends over time — see your best sessions, track improvements, and celebrate your streaks!',
    boldText: 'posture trends',
    navigateTo: '/trends',
    targetX: 35, targetY: 75, ringSize: 70,
  },
  {
    title: 'Make It Yours',
    body: 'Choose your difficulty (Gentle, Standard, or Strict), swap backgrounds, and replay this tutorial anytime!',
    boldText: 'difficulty',
    navigateTo: '/settings',
    targetX: 60, targetY: 75, ringSize: 70,
  },
  {
    title: 'You\'re Ready!',
    body: 'Here\'s a welcome treat for Hunchie! Start your first session and keep that posture strong. Hunchie believes in you!',
    boldText: 'welcome treat',
    isReward: true,
    targetX: 50, targetY: 60, ringSize: 80,
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
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const svgRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (force) { setStep(0); setVisible(true) }
  }, [force])

  useEffect(() => {
    if (!force) {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) { setStep(0); setVisible(true) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleGotIt = () => {
    const current = STEPS[step]
    if (current.navigateTo) { finishTutorial(); navigate(current.navigateTo); return }
    if (step < STEPS.length - 1) { setStep(step + 1) } else { finishTutorial() }
  }

  const finishTutorial = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    if (!force) onComplete?.()
    onDismiss?.()
  }

  const handleSkip = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    onDismiss?.()
  }

  if (!visible) return null

  const current = STEPS[step]
  const { w, h } = windowSize

  const renderBody = () => {
    if (!current.boldText) return current.body
    const idx = current.body.indexOf(current.boldText)
    if (idx === -1) return current.body
    return (<>{current.body.slice(0, idx)}<strong>{current.boldText}</strong>{current.body.slice(idx + current.boldText.length)}</>)
  }

  // Compute arrow in actual pixels
  const targetPxX = (current.targetX / 100) * w
  const targetPxY = (current.targetY / 100) * h
  const tooltipCenterX = w * 0.65
  const tooltipTopY = h * 0.72

  // S-curve control points
  const cp1x = tooltipCenterX + (targetPxX - tooltipCenterX) * 0.1
  const cp1y = tooltipTopY - (tooltipTopY - targetPxY) * 0.4
  const cp2x = targetPxX + (tooltipCenterX - targetPxX) * 0.2
  const cp2y = targetPxY + (tooltipTopY - targetPxY) * 0.15

  const arrowD = `M ${tooltipCenterX} ${tooltipTopY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetPxX} ${targetPxY}`

  const content = (
    <>
      {/* Layer 1: Dark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 99990, background: 'rgba(0,0,0,0.6)',
      }} />

      {/* Layer 2: Glowing ring */}
      <div style={{
        position: 'fixed',
        left: `${current.targetX}%`, top: `${current.targetY}%`,
        width: current.ringSize, height: current.ringSize,
        transform: 'translate(-50%, -50%)',
        zIndex: 99991, pointerEvents: 'none',
        borderRadius: '50%',
        border: '3px solid rgba(76, 255, 160, 0.6)',
        boxShadow: '0 0 25px rgba(76,255,160,0.5), 0 0 50px rgba(76,255,160,0.3), 0 0 75px rgba(76,255,160,0.15), inset 0 0 25px rgba(76,255,160,0.1)',
        animation: 'coachRingPulse 2s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        left: `${current.targetX}%`, top: `${current.targetY}%`,
        width: current.ringSize - 12, height: current.ringSize - 12,
        transform: 'translate(-50%, -50%)',
        zIndex: 99991, pointerEvents: 'none',
        borderRadius: '50%',
        border: '2px solid rgba(76, 255, 160, 0.8)',
        boxShadow: '0 0 15px rgba(76,255,160,0.6)',
      }} />

      {/* Layer 3: SVG arrow */}
      <svg
        ref={svgRef}
        width={w}
        height={h}
        style={{
          position: 'fixed', top: 0, left: 0,
          zIndex: 99992, pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="coachArrowGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="coachArrowTip" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto">
            <path d="M 0 0 L 14 5 L 0 10 L 3 5 Z" fill="#FFF8C4" />
          </marker>
        </defs>
        {/* Glow behind arrow */}
        <path d={arrowD} fill="none" stroke="#FFF176" strokeWidth="8"
          strokeDasharray="16 12" filter="url(#coachArrowGlow)" opacity="0.5"
          style={{ animation: 'coachGlowPulse 2s ease-in-out infinite' }} />
        {/* Main dashed arrow */}
        <path d={arrowD} fill="none" stroke="#FFF8C4" strokeWidth="3.5"
          strokeDasharray="16 12" strokeLinecap="round" markerEnd="url(#coachArrowTip)"
          style={{ animation: 'coachArrowDash 1.5s linear infinite' }} />
      </svg>

      {/* Layer 4: Cursor emoji */}
      <div style={{
        position: 'fixed',
        left: `calc(${current.targetX}% + 18px)`,
        top: `calc(${current.targetY}% + 12px)`,
        zIndex: 99993, pointerEvents: 'none',
        fontSize: 36,
        animation: 'coachCursorBounce 1.5s ease-in-out infinite',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      }}>👆</div>

      {/* Layer 5: Tooltip card */}
      <div style={{
        position: 'fixed', bottom: '8%', left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 420, width: 'calc(100% - 48px)',
        zIndex: 99994,
        animation: 'coachSlideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
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
              <button type="button" className={styles.skipBtn} onClick={handleSkip}>Skip</button>
            )}
            <button type="button" className={styles.gotItBtn} onClick={handleGotIt}>
              {current.isReward ? 'Claim Treat!' : 'Got it!'}
            </button>
          </div>
          <span className={styles.stepCount}>{step + 1} / {STEPS.length}</span>
        </div>
      </div>
    </>
  )

  return createPortal(content, document.body)
}
