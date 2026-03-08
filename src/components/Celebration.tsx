import { useEffect, useState, useMemo } from 'react'
import styles from './Celebration.module.css'

const CONGRATS = 'CONGRATULATIONS!!!'

const RAINBOW = [
  '#FF6B6B', '#FF8E53', '#FFC844', '#51CF66',
  '#339AF0', '#845EF7', '#E64980', '#FF6B6B',
  '#FF8E53', '#FFC844', '#51CF66', '#339AF0',
  '#845EF7', '#E64980', '#FF6B6B', '#FF8E53',
  '#FFC844', '#51CF66',
]

const BALLOON_COLORS = [
  '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
  '#E8BAFF', '#FFD4BA', '#BAF2FF', '#FFBAE8',
  '#D4FFBA', '#BABDFF', '#FFE8BA', '#BAFFE8',
  '#FFC9BA', '#C9BAFF', '#BAFFD4',
]

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFC844', '#339AF0', '#51CF66',
  '#E8A0B0', '#FF8E53', '#845EF7',
]

const CANDY_COLORS = [
  '#FF6B6B', '#FFC844', '#339AF0', '#51CF66',
  '#E8A0B0', '#FF8E53', '#845EF7', '#FFB3BA',
]

interface BalloonData {
  x: number; color: string; speed: number; sway: number
  swaySpeed: number; delay: number; size: number
}

interface ConfettiPiece {
  x: number; color: string; size: number; rotation: number
  rotSpeed: number; speed: number; delay: number; shape: 'rect' | 'circle'
}

interface CandyPiece {
  x: number; color: string; size: number; speed: number
  delay: number; shape: 'rect' | 'circle'; drift: number
}

function createBalloons(): BalloonData[] {
  return Array.from({ length: 14 }, () => ({
    x: 5 + Math.random() * 90,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    speed: 2.5 + Math.random() * 2,
    sway: 8 + Math.random() * 15,
    swaySpeed: 1 + Math.random() * 2,
    delay: Math.random() * 0.8,
    size: 28 + Math.random() * 16,
  }))
}

function createConfetti(): ConfettiPiece[] {
  return Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotSpeed: 200 + Math.random() * 400,
    speed: 2 + Math.random() * 3,
    delay: Math.random() * 1.5,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }))
}

// Candy pieces falling from piñatas
function createPinataCandies(): CandyPiece[] {
  return Array.from({ length: 24 }, (_, i) => ({
    // Spread across 3 piñata positions (20%, 50%, 80%)
    x: [17, 50, 83][i % 3] + (Math.random() - 0.5) * 12,
    color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
    size: 3 + Math.random() * 4,
    speed: 2 + Math.random() * 2,
    delay: 0.5 + Math.random() * 3,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    drift: (Math.random() - 0.5) * 20,
  }))
}

interface Props {
  onComplete: () => void
}

export function Celebration({ onComplete }: Props) {
  const [visible, setVisible] = useState(true)
  const [balloons] = useState(createBalloons)
  const [confetti] = useState(createConfetti)
  const candies = useMemo(createPinataCandies, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 300)
    }, 4000)
    return () => clearTimeout(t)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className={styles.celebrationOverlay}>
      {/* Rainbow bubbly letters */}
      <div className={styles.lettersWrap}>
        {CONGRATS.split('').map((ch, i) => (
          <span
            key={i}
            className={styles.letter}
            style={{
              color: RAINBOW[i % RAINBOW.length],
              animationDelay: `${i * 0.06}s`,
              textShadow: `0 0 12px ${RAINBOW[i % RAINBOW.length]}60`,
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>

      {/* Balloons floating up */}
      {balloons.map((b, i) => (
        <div
          key={`b-${i}`}
          className={styles.balloon}
          style={{
            left: `${b.x}%`,
            '--balloon-color': b.color,
            '--balloon-speed': `${b.speed}s`,
            '--balloon-sway': `${b.sway}px`,
            '--balloon-sway-speed': `${b.swaySpeed}s`,
            '--balloon-delay': `${b.delay}s`,
            '--balloon-size': `${b.size}px`,
          } as React.CSSProperties}
        >
          <div className={styles.balloonBody2} />
          <div className={styles.balloonString} />
        </div>
      ))}

      {/* Confetti */}
      {confetti.map((c, i) => (
        <div
          key={`c-${i}`}
          className={`${styles.confettiPiece} ${c.shape === 'circle' ? styles.confettiCircle : ''}`}
          style={{
            left: `${c.x}%`,
            '--confetti-color': c.color,
            '--confetti-speed': `${c.speed}s`,
            '--confetti-delay': `${c.delay}s`,
            '--confetti-rot': `${c.rotation}deg`,
            '--confetti-rot-speed': `${c.rotSpeed}deg`,
            '--confetti-size': `${c.size}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Piñatas at the bottom */}
      <div className={styles.pinataRow}>
        {/* Donkey piñata */}
        <div className={`${styles.pinataWrap} ${styles.pinata1}`}>
          <div className={styles.pinataString} />
          <svg viewBox="0 0 80 90" className={styles.pinataSvg}>
            <DonkeyPinata />
          </svg>
        </div>
        {/* Star piñata */}
        <div className={`${styles.pinataWrap} ${styles.pinata2}`}>
          <div className={styles.pinataString} />
          <svg viewBox="0 0 80 80" className={styles.pinataSvg}>
            <StarPinata />
          </svg>
        </div>
        {/* Hunchie piñata */}
        <div className={`${styles.pinataWrap} ${styles.pinata3}`}>
          <div className={styles.pinataString} />
          <svg viewBox="0 0 80 85" className={styles.pinataSvg}>
            <HunchiePinata />
          </svg>
        </div>
      </div>

      {/* Candy falling from piñatas */}
      {candies.map((c, i) => (
        <div
          key={`candy-${i}`}
          className={`${styles.candy} ${c.shape === 'circle' ? styles.candyCircle : ''}`}
          style={{
            left: `${c.x}%`,
            '--candy-color': c.color,
            '--candy-size': `${c.size}px`,
            '--candy-speed': `${c.speed}s`,
            '--candy-delay': `${c.delay}s`,
            '--candy-drift': `${c.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ── Donkey Piñata SVG ── */
function DonkeyPinata() {
  return (
    <g>
      {/* Body — barrel shape */}
      <ellipse cx="40" cy="50" rx="26" ry="20" fill="#E8A0B0" />
      {/* Pink/yellow stripe fringe rows */}
      {[36, 42, 48, 54, 60].map((y, i) => (
        <g key={y}>
          <path
            d={`M${16 + i * 1} ${y} Q${24} ${y + 3} ${32} ${y} Q${40} ${y - 2} ${48} ${y} Q${56} ${y + 3} ${64 - i * 1} ${y}`}
            fill="none" stroke={i % 2 === 0 ? '#F9D98A' : '#FF8E9B'} strokeWidth="4"
            strokeLinecap="round" opacity="0.8"
          />
        </g>
      ))}
      {/* Scalloped fringe texture */}
      {[38, 44, 50, 56].map((y, i) => (
        <path key={`sc-${y}`}
          d={`M18 ${y} ${Array.from({ length: 9 }, (_, j) => `Q${20 + j * 5.5} ${y + (j % 2 === 0 ? -2 : 2)} ${22.5 + j * 5.5} ${y}`).join(' ')}`}
          fill="none" stroke={i % 2 === 0 ? '#E64980' : '#FFC844'} strokeWidth="1.2" opacity="0.5"
        />
      ))}
      {/* Head */}
      <ellipse cx="40" cy="28" rx="14" ry="12" fill="#FFD4BA" />
      {/* Ears */}
      <ellipse cx="30" cy="16" rx="5" ry="9" fill="#FFD4BA" transform="rotate(-15 30 16)" />
      <ellipse cx="50" cy="16" rx="5" ry="9" fill="#FFD4BA" transform="rotate(15 50 16)" />
      <ellipse cx="30" cy="16" rx="3" ry="6" fill="#FF8E9B" transform="rotate(-15 30 16)" opacity="0.5" />
      <ellipse cx="50" cy="16" rx="3" ry="6" fill="#FF8E9B" transform="rotate(15 50 16)" opacity="0.5" />
      {/* Legs */}
      <rect x="22" y="66" width="6" height="14" rx="3" fill="#E8A0B0" />
      <rect x="52" y="66" width="6" height="14" rx="3" fill="#E8A0B0" />
      {/* Leg fringe */}
      <path d="M22 72 Q25 74 28 72" fill="none" stroke="#F9D98A" strokeWidth="2" opacity="0.6" />
      <path d="M52 72 Q55 74 58 72" fill="none" stroke="#F9D98A" strokeWidth="2" opacity="0.6" />
      {/* Tail */}
      <path d="M66 50 Q72 48 70 42" fill="none" stroke="#E8A0B0" strokeWidth="3" strokeLinecap="round" />
      {/* Paper strips on tail */}
      <path d="M70 42 L72 38" stroke="#FFC844" strokeWidth="1.5" />
      <path d="M70 42 L68 37" stroke="#FF6B6B" strokeWidth="1.5" />
      <path d="M70 42 L71 36" stroke="#339AF0" strokeWidth="1.5" />
    </g>
  )
}

/* ── Star Piñata SVG ── */
function StarPinata() {
  // Five-pointed star path
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * 36 - 90) * Math.PI / 180
    const r = i % 2 === 0 ? 35 : 16
    return `${40 + Math.cos(angle) * r},${40 + Math.sin(angle) * r}`
  }).join(' ')

  return (
    <g>
      {/* Star body */}
      <polygon points={starPoints} fill="#2E8FA0" />
      {/* Inner glow */}
      <polygon points={starPoints} fill="url(#starPinataGrad)" opacity="0.6" />
      {/* Zigzag fringe strips */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const angle = (deg - 90) * Math.PI / 180
        const x1 = 40 + Math.cos(angle) * 18
        const y1 = 40 + Math.sin(angle) * 18
        const x2 = 40 + Math.cos(angle) * 30
        const y2 = 40 + Math.sin(angle) * 30
        const colors = ['#FF8E53', '#FFC844', '#FF6B6B', '#51CF66', '#E8BAFF']
        return (
          <g key={`zz-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={colors[i]} strokeWidth="3" opacity="0.7" strokeLinecap="round" />
            {/* Small zigzag lines perpendicular */}
            <line x1={x2 - 3} y1={y2 - 2} x2={x2 + 3} y2={y2 + 2}
              stroke={colors[(i + 1) % 5]} strokeWidth="2" opacity="0.5" />
          </g>
        )
      })}
      {/* Concentric fringe rings */}
      <circle cx="40" cy="40" r="22" fill="none" stroke="#FF8E53" strokeWidth="2.5"
        strokeDasharray="4 3" opacity="0.6" />
      <circle cx="40" cy="40" r="14" fill="none" stroke="#FFC844" strokeWidth="2"
        strokeDasharray="3 2" opacity="0.5" />
      {/* Orange highlights on tips */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const angle = (deg - 90) * Math.PI / 180
        const cx = 40 + Math.cos(angle) * 30
        const cy = 40 + Math.sin(angle) * 30
        return <circle key={`tip-${i}`} cx={cx} cy={cy} r="4" fill="#FF8E53" opacity="0.5" />
      })}
      <defs>
        <radialGradient id="starPinataGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#00838F" />
        </radialGradient>
      </defs>
    </g>
  )
}

/* ── Hunchie Piñata SVG ── */
function HunchiePinata() {
  return (
    <g>
      {/* Quill-like back — layered scalloped fringe in browns */}
      <ellipse cx="45" cy="40" rx="32" ry="28" fill="#5C4432" />
      {/* Fringe layers on quills */}
      {[28, 34, 40, 46, 52].map((y, i) => (
        <path key={`qf-${y}`}
          d={`M${16 + i} ${y} ${Array.from({ length: 8 }, (_, j) => `Q${18 + j * 7} ${y + (j % 2 === 0 ? -3 : 3)} ${21 + j * 7} ${y}`).join(' ')}`}
          fill="none" stroke={i % 2 === 0 ? '#8D6E48' : '#E8D4C0'} strokeWidth="2.5" opacity="0.7"
        />
      ))}
      {/* Body — round belly */}
      <ellipse cx="40" cy="50" rx="22" ry="20" fill="#F0D8C8" />
      {/* Paper fringe on belly */}
      {[42, 48, 54].map((y, i) => (
        <path key={`bf-${y}`}
          d={`M22 ${y} ${Array.from({ length: 6 }, (_, j) => `Q${24 + j * 6} ${y + (j % 2 === 0 ? -2 : 2)} ${27 + j * 6} ${y}`).join(' ')}`}
          fill="none" stroke={i % 2 === 0 ? '#F9D98A' : '#E8A0B0'} strokeWidth="2" opacity="0.5"
        />
      ))}
      {/* Head area */}
      <ellipse cx="38" cy="30" rx="16" ry="14" fill="#F8E8DC" />
      {/* Ears */}
      <ellipse cx="25" cy="20" rx="6" ry="8" fill="#D4B8A0" transform="rotate(-10 25 20)" />
      <ellipse cx="52" cy="20" rx="6" ry="8" fill="#D4B8A0" transform="rotate(10 52 20)" />
      <ellipse cx="25" cy="20" rx="3.5" ry="5" fill="#E8A0B0" transform="rotate(-10 25 20)" opacity="0.4" />
      <ellipse cx="52" cy="20" rx="3.5" ry="5" fill="#E8A0B0" transform="rotate(10 52 20)" opacity="0.4" />
      {/* Little feet */}
      <ellipse cx="28" cy="68" rx="7" ry="5" fill="#F0D8C8" />
      <ellipse cx="52" cy="68" rx="7" ry="5" fill="#F0D8C8" />
      {/* Zigzag decoration strips */}
      <path d="M22 58 L26 55 L30 58 L34 55 L38 58 L42 55 L46 58 L50 55 L54 58 L58 55"
        fill="none" stroke="#E8A0B0" strokeWidth="1.5" opacity="0.6" />
      <path d="M24 63 L28 60 L32 63 L36 60 L40 63 L44 60 L48 63 L52 60 L56 63"
        fill="none" stroke="#F9D98A" strokeWidth="1.5" opacity="0.6" />
    </g>
  )
}
