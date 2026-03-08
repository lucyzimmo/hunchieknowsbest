import { useEffect, useState, useRef, useMemo } from 'react'
import { TREAT_TIERS, type TreatType } from './TreatIllustration'
import styles from './EatingAnimation.module.css'

// Per-treat crumb/particle colors
const TREAT_COLORS: Record<TreatType, string[]> = {
  blueberries: ['#3949AB', '#5C6BC0', '#283593'],
  apple: ['#C62828', '#FFF8E1', '#E53935'],
  strawberry: ['#E53935', '#F8BBD0', '#C62828'],
  acorn: ['#B8863C', '#E8D5B0', '#8D6E48'],
  grapes: ['#7B1FA2', '#CE93D8', '#6A1B9A'],
  mushroom: ['#FFD700', '#FFE082', '#FFF8E1'],
}

const HEART_COLORS = ['#FF6B9D', '#FF4757', '#FF8A9E', '#FF6B9D', '#FF4757', '#FF8A9E', '#FF6B9D']

type Phase = 'fly' | 'eat' | 'happy' | 'recover' | 'done'

interface Props {
  treat: TreatType
  onComplete: () => void
}

interface Crumb {
  id: number
  x: number
  y: number
  color: string
  size: number
  dx: number
  dy: number
}

interface Heart {
  id: number
  x: number
  color: string
  size: number
  delay: number
  drift: number
}

interface BiteCircle {
  cx: number
  cy: number
  r: number
}

// Per-treat bite positions (SVG viewBox 0-100 coords)
// Bites come from the right side (toward Hunchie's mouth)
const TREAT_BITES: Record<TreatType, BiteCircle[]> = {
  apple: [
    { cx: 78, cy: 52, r: 13 },
    { cx: 75, cy: 40, r: 15 },
    { cx: 64, cy: 58, r: 19 },
    { cx: 50, cy: 48, r: 22 },
  ],
  strawberry: [
    { cx: 68, cy: 48, r: 12 },
    { cx: 66, cy: 62, r: 14 },
    { cx: 56, cy: 50, r: 18 },
    { cx: 46, cy: 58, r: 21 },
  ],
  acorn: [
    { cx: 70, cy: 55, r: 12 },
    { cx: 68, cy: 42, r: 14 },
    { cx: 58, cy: 60, r: 17 },
    { cx: 48, cy: 50, r: 20 },
  ],
  grapes: [
    { cx: 70, cy: 48, r: 12 },
    { cx: 66, cy: 60, r: 14 },
    { cx: 56, cy: 50, r: 17 },
    { cx: 46, cy: 56, r: 20 },
  ],
  blueberries: [
    { cx: 78, cy: 58, r: 14 },
    { cx: 72, cy: 48, r: 15 },
    { cx: 62, cy: 62, r: 18 },
    { cx: 50, cy: 55, r: 21 },
  ],
  mushroom: [
    { cx: 80, cy: 42, r: 13 },
    { cx: 76, cy: 30, r: 15 },
    { cx: 66, cy: 48, r: 19 },
    { cx: 54, cy: 38, r: 22 },
  ],
}

// Interior colors visible through bite holes
const TREAT_INTERIOR: Record<TreatType, string> = {
  apple: '#FFF8E1',
  strawberry: '#F8BBD0',
  acorn: '#E8D5B0',
  grapes: '#CE93D8',
  blueberries: '#7986CB',
  mushroom: '#FFE082',
}

export function EatingAnimation({ treat, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('fly')
  const [biteStep, setBiteStep] = useState(0)
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  const [hearts, setHearts] = useState<Heart[]>([])
  const [showHpFloat, setShowHpFloat] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const crumbId = useRef(0)

  const meta = TREAT_TIERS[treat]
  const isRareOrLegendary = meta.tier === 'rare' || meta.tier === 'legendary'
  const treatColors = TREAT_COLORS[treat]

  // Unique ID prefix for SVG masks
  const svgId = useMemo(() => `eat-${Math.random().toString(36).slice(2, 8)}`, [])

  // Current accumulated bite circles
  const currentBites = useMemo(() => {
    const allBites = TREAT_BITES[treat]
    return allBites.slice(0, Math.min(biteStep, 4))
  }, [treat, biteStep])

  const spawnCrumbs = (count: number, biteIndex: number) => {
    const bite = TREAT_BITES[treat][Math.min(biteIndex - 1, 3)]
    const newCrumbs: Crumb[] = []
    for (let i = 0; i < count; i++) {
      newCrumbs.push({
        id: crumbId.current++,
        // Origin from the bite location (SVG coords mapped to pixels: 90px treat, viewBox 100)
        x: ((bite?.cx ?? 80) - 50) * 0.9 + (Math.random() - 0.5) * 12,
        y: ((bite?.cy ?? 50) - 50) * 0.9 + (Math.random() - 0.5) * 8,
        color: treatColors[Math.floor(Math.random() * treatColors.length)],
        size: 3 + Math.random() * 4,
        dx: 10 + Math.random() * 25,
        dy: (Math.random() - 0.5) * 40 + 15,
      })
    }
    setCrumbs(prev => [...prev, ...newCrumbs])
    const t = setTimeout(() => {
      setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)))
    }, 800)
    timers.current.push(t)
  }

  useEffect(() => {
    // Phase 1: Fly (0.8s)
    timers.current.push(setTimeout(() => setPhase('eat'), 800))

    // Phase 2: Eating — 5 bites with 0.6s gaps
    const biteStart = 800
    for (let i = 1; i <= 5; i++) {
      timers.current.push(setTimeout(() => {
        setBiteStep(i)
        if (i < 5) {
          spawnCrumbs(i === 3 ? 3 : 2, i)
        } else {
          spawnCrumbs(5, i)
        }
      }, biteStart + i * 600))
    }

    // Phase 3: Happy (at 3.8s)
    timers.current.push(setTimeout(() => {
      setPhase('happy')
      const heartCount = isRareOrLegendary ? 11 : 6
      const newHearts: Heart[] = []
      for (let i = 0; i < heartCount; i++) {
        newHearts.push({
          id: i,
          x: (Math.random() - 0.5) * 120,
          color: HEART_COLORS[i % HEART_COLORS.length],
          size: isRareOrLegendary ? 18 + Math.random() * 14 : 14 + Math.random() * 10,
          delay: i * 0.3,
          drift: (Math.random() - 0.5) * 40,
        })
      }
      setHearts(newHearts)
    }, 3800))

    // Phase 4: Recovery (at 6.0s)
    timers.current.push(setTimeout(() => {
      setPhase('recover')
      setShowHpFloat(true)
    }, 6000))

    // Done (at 7.0s)
    timers.current.push(setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 7000))

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'done') return null

  const treatGone = biteStep >= 5

  return (
    <div className={styles.overlay}>
      {/* Treat with bite mask system */}
      <div className={`${styles.treatWrap} ${phase === 'fly' ? styles.flying : ''} ${phase === 'eat' ? styles.eating : ''} ${phase === 'happy' || phase === 'recover' ? styles.hidden : ''}`}>
        {!treatGone && (
          <svg viewBox="0 0 100 100" width={90} height={90} overflow="visible">
            <defs>
              {/* Main mask: white = visible, black circles = bitten away */}
              <mask id={`${svgId}-mask`}>
                <rect x="-10" y="-10" width="120" height="120" fill="white" />
                {currentBites.map((b, i) => (
                  <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="black" />
                ))}
              </mask>
              {/* Interior mask: only visible inside bite areas */}
              <mask id={`${svgId}-int`}>
                <rect x="-10" y="-10" width="120" height="120" fill="black" />
                {currentBites.map((b, i) => (
                  <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="white" />
                ))}
              </mask>
              <TreatGradients treat={treat} prefix={svgId} />
            </defs>

            {/* Interior layer — only visible through bite holes */}
            {currentBites.length > 0 && (
              <g mask={`url(#${svgId}-int)`}>
                <TreatInterior treat={treat} />
              </g>
            )}

            {/* Main treat with bites masked out */}
            <g mask={`url(#${svgId}-mask)`}>
              <TreatSVG treat={treat} prefix={svgId} />
            </g>
          </svg>
        )}
        {treatGone && <div className={styles.poof}>✨</div>}
      </div>

      {/* Crumb particles */}
      {crumbs.map(c => (
        <div
          key={c.id}
          className={styles.crumb}
          style={{
            '--crumb-dx': `${c.dx}px`,
            '--crumb-dy': `${c.dy}px`,
            left: `calc(40% + ${c.x}px)`,
            top: `calc(40% + ${c.y}px)`,
            width: c.size,
            height: c.size,
            background: c.color,
          } as React.CSSProperties}
        />
      ))}

      {/* Nom nom during eat */}
      {phase === 'eat' && (
        <div className={styles.munchIndicator}>
          <span className={styles.munchText}>nom nom nom</span>
        </div>
      )}

      {/* Hearts during happy phase */}
      {phase === 'happy' && hearts.map(h => (
        <div
          key={h.id}
          className={styles.heart}
          style={{
            '--heart-drift': `${h.drift}px`,
            left: `calc(40% + ${h.x}px)`,
            bottom: '40%',
            animationDelay: `${h.delay}s`,
            fontSize: h.size,
            color: h.color,
          } as React.CSSProperties}
        >
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* HP float */}
      {showHpFloat && (
        <div className={styles.hpFloat}>
          +{Math.min(meta.healAmount, 100)} HP
        </div>
      )}
    </div>
  )
}

// ── SVG gradient defs per treat (unique IDs to avoid conflicts) ──

function TreatGradients({ treat, prefix }: { treat: TreatType; prefix: string }) {
  switch (treat) {
    case 'apple':
      return (
        <radialGradient id={`${prefix}-ag`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      )
    case 'strawberry':
      return (
        <radialGradient id={`${prefix}-sg`} cx="40%" cy="30%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      )
    case 'acorn':
      return (
        <radialGradient id={`${prefix}-ng`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#E0B06A" />
          <stop offset="100%" stopColor="#B8863C" />
        </radialGradient>
      )
    case 'blueberries':
      return (
        <radialGradient id={`${prefix}-bg`} cx="38%" cy="35%">
          <stop offset="0%" stopColor="#5C6BC0" />
          <stop offset="100%" stopColor="#283593" />
        </radialGradient>
      )
    case 'mushroom':
      return (
        <>
          <radialGradient id={`${prefix}-mc`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#F9A825" />
          </radialGradient>
          <radialGradient id={`${prefix}-ms`} cx="50%" cy="20%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="100%" stopColor="#FFF3C4" />
          </radialGradient>
        </>
      )
    case 'grapes':
    default:
      return null
  }
}

// ── Interior layers visible through bite holes ──

function TreatInterior({ treat }: { treat: TreatType }) {
  switch (treat) {
    case 'apple':
      return (
        <g>
          <ellipse cx="50" cy="58" rx="30" ry="32" fill={TREAT_INTERIOR.apple} />
          {/* Seeds on cross-section */}
          <ellipse cx="55" cy="52" rx="1.5" ry="3" fill="#8D6E48" transform="rotate(20 55 52)" />
          <ellipse cx="58" cy="58" rx="1.5" ry="3" fill="#8D6E48" transform="rotate(-15 58 58)" />
          <ellipse cx="54" cy="64" rx="1.5" ry="3" fill="#8D6E48" transform="rotate(10 54 64)" />
          {/* Thin red skin edge */}
          <ellipse cx="50" cy="58" rx="30" ry="32" fill="none" stroke="#C62828" strokeWidth="2" />
        </g>
      )
    case 'strawberry':
      return (
        <g>
          <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill={TREAT_INTERIOR.strawberry} />
          {/* Seed dots on cross-section */}
          {[[55, 45], [60, 52], [58, 60], [55, 68], [52, 55]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.2" fill="#FDD835" opacity="0.8" />
          ))}
          <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill="none" stroke="#E53935" strokeWidth="2" />
        </g>
      )
    case 'acorn':
      return (
        <g>
          <ellipse cx="50" cy="38" rx="26" ry="16" fill="#C4A06A" />
          <ellipse cx="50" cy="62" rx="22" ry="26" fill={TREAT_INTERIOR.acorn} />
          {/* Crack lines */}
          <path d="M65 45 L70 55 L68 65" fill="none" stroke="#8D6E48" strokeWidth="1" opacity="0.6" />
          <path d="M62 40 L66 48" fill="none" stroke="#8D6E48" strokeWidth="0.8" opacity="0.5" />
        </g>
      )
    case 'grapes':
      return (
        <g>
          {[[42, 42], [58, 42], [50, 42], [38, 54], [50, 54], [62, 54], [44, 66], [56, 66], [50, 76]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="10" fill={TREAT_INTERIOR.grapes} />
          ))}
        </g>
      )
    case 'blueberries':
      return (
        <g>
          <circle cx="32" cy="60" r="16" fill={TREAT_INTERIOR.blueberries} />
          <circle cx="68" cy="60" r="16" fill={TREAT_INTERIOR.blueberries} />
          <circle cx="50" cy="65" r="20" fill={TREAT_INTERIOR.blueberries} />
        </g>
      )
    case 'mushroom':
      return (
        <g>
          <ellipse cx="50" cy="42" rx="34" ry="28" fill={TREAT_INTERIOR.mushroom} />
          <rect x="38" y="48" width="24" height="30" rx="10" fill="#FFF8E1" />
          {/* Sparkle dots inside */}
          <circle cx="60" cy="38" r="2" fill="#FFF" opacity="0.9" />
          <circle cx="65" cy="45" r="1.5" fill="#FFF" opacity="0.7" />
          <circle cx="55" cy="32" r="1.8" fill="#FFF" opacity="0.8" />
        </g>
      )
  }
}

// ── Full treat SVG content (matching TreatIllustration, with prefixed gradient IDs) ──

function TreatSVG({ treat, prefix }: { treat: TreatType; prefix: string }) {
  switch (treat) {
    case 'apple':
      return (
        <g>
          <ellipse cx="50" cy="58" rx="30" ry="32" fill="#E53935" />
          <ellipse cx="50" cy="58" rx="30" ry="32" fill={`url(#${prefix}-ag)`} />
          <ellipse cx="38" cy="48" rx="8" ry="12" fill="rgba(255,255,255,0.35)" transform="rotate(-15 38 48)" />
          <path d="M50 28 Q52 22 50 16" fill="none" stroke="#6D4C28" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="57" cy="22" rx="10" ry="5" fill="#66BB6A" transform="rotate(25 57 22)" />
          <path d="M52 22 Q57 20 62 22" fill="none" stroke="#43A047" strokeWidth="0.8" />
        </g>
      )
    case 'strawberry':
      return (
        <g>
          <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill="#E53935" />
          <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill={`url(#${prefix}-sg)`} />
          {[[42, 40], [54, 38], [48, 50], [58, 48], [38, 52], [44, 62], [56, 60], [50, 72], [38, 65], [60, 55]].map(([cx, cy], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx="1.8" ry="2.5" fill="#FDD835" transform={`rotate(${(i * 20) % 40 - 20} ${cx} ${cy})`} />
          ))}
          <ellipse cx="40" cy="38" rx="5" ry="10" fill="rgba(255,255,255,0.3)" transform="rotate(-15 40 38)" />
          <g transform="translate(50, 24)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <ellipse key={deg} cx="0" cy="-8" rx="4" ry="9" fill="#43A047" transform={`rotate(${deg})`} />
            ))}
          </g>
        </g>
      )
    case 'acorn':
      return (
        <g>
          <ellipse cx="50" cy="38" rx="26" ry="16" fill="#8D6E48" />
          {[30, 40, 50, 60, 70].map(x => (
            <circle key={x} cx={x} cy={34} r="3" fill="#7B5E3B" opacity="0.5" />
          ))}
          {[35, 45, 55, 65].map(x => (
            <circle key={x} cx={x} cy={40} r="3" fill="#7B5E3B" opacity="0.4" />
          ))}
          <rect x="48" y="20" width="4" height="8" rx="2" fill="#6D4C28" />
          <ellipse cx="50" cy="62" rx="22" ry="26" fill="#D4A052" />
          <ellipse cx="50" cy="62" rx="22" ry="26" fill={`url(#${prefix}-ng)`} />
          <ellipse cx="42" cy="54" rx="5" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-10 42 54)" />
        </g>
      )
    case 'grapes':
      return (
        <g>
          {[[42, 42], [58, 42], [50, 42], [38, 54], [50, 54], [62, 54], [44, 66], [56, 66], [50, 76]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="10" fill="#7B1FA2" />
              <circle cx={cx} cy={cy} r="10" fill={`rgba(${155 + i * 8}, 50, ${180 + i * 5}, 0.3)`} />
              <ellipse cx={cx! - 3} cy={cy! - 3} rx="3" ry="4" fill="rgba(255,255,255,0.3)" />
            </g>
          ))}
          <path d="M50 32 Q48 22 52 16" fill="none" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 18 Q58 14 54 10 Q50 6 56 4" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="42" cy="26" rx="9" ry="5" fill="#66BB6A" transform="rotate(-30 42 26)" />
        </g>
      )
    case 'blueberries':
      return (
        <g>
          <circle cx="32" cy="60" r="16" fill="#3F51B5" />
          <ellipse cx="28" cy="55" rx="4" ry="6" fill="rgba(255,255,255,0.25)" />
          <circle cx="32" cy="52" r="3" fill="#303F9F" />
          <circle cx="68" cy="60" r="16" fill="#3F51B5" />
          <ellipse cx="64" cy="55" rx="4" ry="6" fill="rgba(255,255,255,0.25)" />
          <circle cx="68" cy="52" r="3" fill="#303F9F" />
          <circle cx="50" cy="65" r="20" fill="#3949AB" />
          <circle cx="50" cy="65" r="20" fill={`url(#${prefix}-bg)`} />
          <ellipse cx="44" cy="58" rx="5" ry="7" fill="rgba(255,255,255,0.3)" />
          <circle cx="50" cy="57" r="3.5" fill="#283593" />
          <ellipse cx="50" cy="40" rx="12" ry="5" fill="#66BB6A" transform="rotate(-10 50 40)" />
          <path d="M44 40 Q50 38 56 40" fill="none" stroke="#43A047" strokeWidth="0.8" />
          <path d="M50 45 Q50 38 48 34" fill="none" stroke="#6D4C28" strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'mushroom':
      return (
        <g>
          <ellipse cx="50" cy="42" rx="34" ry="28" fill="#FFD700" />
          <ellipse cx="50" cy="42" rx="34" ry="28" fill={`url(#${prefix}-mc)`} />
          <circle cx="36" cy="32" r="6" fill="#FFF8E1" opacity="0.85" />
          <circle cx="58" cy="28" r="7" fill="#FFF8E1" opacity="0.85" />
          <circle cx="48" cy="42" r="4" fill="#FFF8E1" opacity="0.7" />
          <circle cx="68" cy="40" r="5" fill="#FFF8E1" opacity="0.75" />
          <circle cx="32" cy="46" r="3.5" fill="#FFF8E1" opacity="0.6" />
          <ellipse cx="38" cy="28" rx="5" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-20 38 28)" />
          <ellipse cx="60" cy="36" rx="3" ry="5" fill="rgba(255,255,255,0.3)" transform="rotate(15 60 36)" />
          <path d="M20 48 Q50 56 80 48" fill="#F5E6B8" stroke="#E8D48C" strokeWidth="1" />
          <rect x="38" y="48" width="24" height="30" rx="10" fill="#FFF8E1" />
          <rect x="38" y="48" width="24" height="30" rx="10" fill={`url(#${prefix}-ms)`} />
        </g>
      )
  }
}
