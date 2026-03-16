import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styles from './CoachMarks.module.css'

interface CoachStep {
  title: string
  body: string
  boldText?: string
  navigateTo?: string
  isReward?: boolean
  targetSelector: string
  tooltipPosition: 'top' | 'bottom'
  fallbackX: number
  fallbackY: number
}

const STEPS: CoachStep[] = [
  {
    title: 'Meet Hunchie!',
    body: 'Hunchie is your posture buddy! This little hedgehog sits on your desk and reacts when you slouch. Keep sitting tall to keep Hunchie happy!',
    boldText: 'reacts when you slouch',
    targetSelector: '[data-coach="hunchie-session"]',
    tooltipPosition: 'top',
    fallbackX: 50, fallbackY: 50,
  },
  {
    title: 'Start a Focus Session',
    body: 'Tap Start to begin your 25-minute focus timer. Hunchie watches your posture — mild slouches cause a tremble, big ones leave bandaids stacking up!',
    boldText: 'Start',
    targetSelector: '[data-coach="start-timer-btn"]',
    tooltipPosition: 'top',
    fallbackX: 50, fallbackY: 70,
  },
  {
    title: 'Breaks & Treats',
    body: 'Skip to a break to earn mystery treats! Tap the treat guide to learn about rarities — from common blueberries to the legendary Golden Mushroom!',
    boldText: 'Golden Mushroom',
    targetSelector: '[data-coach="skip-to-break"]',
    tooltipPosition: 'bottom',
    fallbackX: 50, fallbackY: 15,
  },
  {
    title: 'Feed to Heal',
    body: 'Feed treats to Hunchie to restore HP! Each treat heals different amounts. Save your rare ones for big hits — Hunchie will catch and munch them with a happy wiggle!',
    boldText: 'restore HP',
    targetSelector: '[data-coach="feed-btn"]',
    tooltipPosition: 'bottom',
    fallbackX: 70, fallbackY: 25,
  },
  {
    title: 'Don\'t Let HP Hit Zero!',
    body: 'If Hunchie\'s health drops to zero, Hunchie waddles away into the forest! Complete real-life recovery missions to bring Hunchie hopping back with flowers blooming!',
    boldText: 'recovery missions',
    targetSelector: '[data-coach="hunchie-session"]',
    tooltipPosition: 'top',
    fallbackX: 50, fallbackY: 50,
  },
  {
    title: 'Track Your Journey',
    body: 'Check your posture trends over time — see your best sessions, track improvements, and celebrate your streaks!',
    boldText: 'posture trends',
    targetSelector: '[data-coach="trend-analysis-btn"]',
    tooltipPosition: 'bottom',
    fallbackX: 50, fallbackY: 15,
  },
  {
    title: 'Make It Yours',
    body: 'Choose your difficulty (Gentle, Standard, or Strict), swap backgrounds, and replay this tutorial anytime from Settings!',
    boldText: 'difficulty',
    targetSelector: '[data-coach="trend-analysis-btn"]',
    tooltipPosition: 'bottom',
    fallbackX: 50, fallbackY: 15,
  },
  {
    title: 'You\'re Ready!',
    body: 'Here\'s a welcome treat for Hunchie! Start your first session and keep that posture strong. Hunchie believes in you!',
    boldText: 'welcome treat',
    isReward: true,
    targetSelector: '[data-coach="hunchie-session"]',
    tooltipPosition: 'top',
    fallbackX: 50, fallbackY: 50,
  },
]

const STORAGE_KEY = 'hunchie-coach-seen'

interface Props {
  force?: boolean
  onDismiss?: () => void
  onComplete?: () => void
}

interface TargetPos { x: number; y: number; w: number; h: number }

export function CoachMarks({ force, onDismiss, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [target, setTarget] = useState<TargetPos | null>(null)
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const retryTimer = useRef<ReturnType<typeof setTimeout>>()
  const navigate = useNavigate()

  useEffect(() => {
    if (force) { setStep(0); setVisible(true) }
  }, [force])

  useEffect(() => {
    if (!force && !localStorage.getItem(STORAGE_KEY)) { setStep(0); setVisible(true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fn = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const findTarget = useCallback((retriesLeft: number) => {
    const s = STEPS[step]
    if (!s) return
    const el = document.querySelector(s.targetSelector)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height })
        return
      }
    }
    // fallback
    setTarget({ x: (s.fallbackX / 100) * window.innerWidth, y: (s.fallbackY / 100) * window.innerHeight, w: 60, h: 40 })
    if (retriesLeft > 0) retryTimer.current = setTimeout(() => findTarget(retriesLeft - 1), 400)
  }, [step])

  useEffect(() => {
    if (!visible) return
    setTarget(null)
    const t = setTimeout(() => findTarget(12), 80)
    return () => { clearTimeout(t); clearTimeout(retryTimer.current) }
  }, [visible, step, findTarget])

  const handleGotIt = () => {
    const s = STEPS[step]
    if (s.navigateTo) { finishTutorial(); navigate(s.navigateTo); return }
    if (step < STEPS.length - 1) setStep(step + 1)
    else finishTutorial()
  }
  const finishTutorial = () => {
    setVisible(false); localStorage.setItem(STORAGE_KEY, 'true')
    if (!force) onComplete?.(); onDismiss?.()
  }
  const handleSkip = () => {
    setVisible(false); localStorage.setItem(STORAGE_KEY, 'true'); onDismiss?.()
  }

  if (!visible) return null

  const current = STEPS[step]
  const { w, h } = winSize

  const renderBody = () => {
    if (!current.boldText) return current.body
    const i = current.body.indexOf(current.boldText)
    if (i === -1) return current.body
    return (<>{current.body.slice(0, i)}<strong>{current.boldText}</strong>{current.body.slice(i + current.boldText.length)}</>)
  }

  const tx = target?.x ?? (current.fallbackX / 100) * w
  const ty = target?.y ?? (current.fallbackY / 100) * h
  const ringSize = Math.max(target?.w ?? 60, target?.h ?? 60) + 36

  const atTop = current.tooltipPosition === 'top'

  // Arrow from tooltip to target
  let ax: number, ay: number
  if (atTop) { ax = w * 0.6; ay = Math.min(h * 0.35, ty - 40) }
  else { ax = w * 0.6; ay = Math.max(h * 0.65, ty + 40) }

  const dx = tx - ax, dy = ty - ay
  const c1x = ax + dx * 0.15, c1y = ay + dy * 0.55
  const c2x = tx - dx * 0.15, c2y = ty - dy * 0.2
  const arrowD = `M ${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`

  return createPortal(<>
    {/* Overlay */}
    <div style={{ position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:99990,background:'rgba(0,0,0,0.6)' }} />

    {/* Glow ring */}
    {target && <>
      <div style={{
        position:'fixed',left:tx,top:ty,width:ringSize,height:ringSize,
        transform:'translate(-50%,-50%)',zIndex:99991,pointerEvents:'none',
        borderRadius:'50%',border:'3px solid rgba(76,255,160,0.6)',
        boxShadow:'0 0 25px rgba(76,255,160,0.5),0 0 50px rgba(76,255,160,0.3),0 0 75px rgba(76,255,160,0.15),inset 0 0 25px rgba(76,255,160,0.1)',
        animation:'coachRingPulse 2s ease-in-out infinite',
      }} />
      <div style={{
        position:'fixed',left:tx,top:ty,width:ringSize-14,height:ringSize-14,
        transform:'translate(-50%,-50%)',zIndex:99991,pointerEvents:'none',
        borderRadius:'50%',border:'2px solid rgba(76,255,160,0.8)',
        boxShadow:'0 0 15px rgba(76,255,160,0.6)',
      }} />
    </>}

    {/* Arrow */}
    {target && <svg width={w} height={h} style={{ position:'fixed',top:0,left:0,zIndex:99992,pointerEvents:'none' }}>
      <defs>
        <filter id="cGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="cTip" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto"><path d="M0 0L14 5L0 10L3 5Z" fill="#FFF8C4"/></marker>
      </defs>
      <path d={arrowD} fill="none" stroke="#FFF176" strokeWidth="8" strokeDasharray="16 12" filter="url(#cGlow)" opacity="0.5" style={{animation:'coachGlowPulse 2s ease-in-out infinite'}}/>
      <path d={arrowD} fill="none" stroke="#FFF8C4" strokeWidth="3.5" strokeDasharray="16 12" strokeLinecap="round" markerEnd="url(#cTip)" style={{animation:'coachArrowDash 1.5s linear infinite'}}/>
    </svg>}

    {/* Cursor */}
    {target && <div style={{
      position:'fixed',left:tx+18,top:ty+12,zIndex:99993,pointerEvents:'none',
      fontSize:36,animation:'coachCursorBounce 1.5s ease-in-out infinite',
      filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
    }}>👆</div>}

    {/* Tooltip */}
    <div style={{
      position:'fixed',
      ...(atTop ? { top:'5%' } : { bottom:'8%' }),
      left:'50%',transform:'translateX(-50%)',
      maxWidth:420,width:'calc(100% - 48px)',zIndex:99994,
      animation:'coachSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div className={styles.tooltipInner}>
        <div className={styles.progress}>
          {STEPS.map((_,i) => <span key={i} className={i===step ? styles.dotActive : styles.dot}/>)}
        </div>
        <h3 className={styles.title}>{current.title}</h3>
        <div className={styles.tooltipContent}>
          <div className={styles.mascotWrap}>
            {current.isReward
              ? <span className={styles.treatReward}>🍎</span>
              : <img src="/hunchie-character.png" alt="Hunchie" className={styles.mascotImg}/>
            }
          </div>
          <p className={styles.body}>{renderBody()}</p>
        </div>
        <div className={styles.actions}>
          {step < STEPS.length-1 && <button type="button" className={styles.skipBtn} onClick={handleSkip}>Skip</button>}
          <button type="button" className={styles.gotItBtn} onClick={handleGotIt}>
            {current.isReward ? 'Claim Treat!' : 'Got it!'}
          </button>
        </div>
        <span className={styles.stepCount}>{step+1} / {STEPS.length}</span>
      </div>
    </div>
  </>, document.body)
}
