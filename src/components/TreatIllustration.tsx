import styles from './TreatIllustration.module.css'

export type TreatType = 'apple' | 'acorn' | 'grapes' | 'strawberry' | 'mushroom' | 'blueberries'
export type TreatTier = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface TreatMeta {
  tier: TreatTier
  healAmount: number
  dropRate: number
  tierColor: string
  tierLabel: string
  healDescription: string
  bandaidsRemoved: number | 'all'
}

export const TREAT_NAMES: Record<TreatType, string> = {
  apple: 'Apple',
  acorn: 'Acorn',
  grapes: 'Grapes',
  strawberry: 'Strawberry',
  mushroom: 'Golden Mushroom',
  blueberries: 'Blueberries',
}

export const TREAT_TIERS: Record<TreatType, TreatMeta> = {
  blueberries: { tier: 'common',    healAmount: 3,   dropRate: 0.35, tierColor: '#9E9E9E', tierLabel: 'Common',    healDescription: 'Recovers 1 mild hit worth of HP',   bandaidsRemoved: 1 },
  apple:       { tier: 'common',    healAmount: 3,   dropRate: 0.25, tierColor: '#9E9E9E', tierLabel: 'Common',    healDescription: 'Recovers 1 mild hit worth of HP',   bandaidsRemoved: 1 },
  strawberry:  { tier: 'uncommon',  healAmount: 6,   dropRate: 0.18, tierColor: '#66BB6A', tierLabel: 'Uncommon',  healDescription: 'Recovers 1 medium hit worth of HP',  bandaidsRemoved: 2 },
  acorn:       { tier: 'uncommon',  healAmount: 6,   dropRate: 0.12, tierColor: '#66BB6A', tierLabel: 'Uncommon',  healDescription: 'Recovers 1 medium hit worth of HP',  bandaidsRemoved: 2 },
  grapes:      { tier: 'rare',      healAmount: 12,  dropRate: 0.07, tierColor: '#AB47BC', tierLabel: 'Rare',      healDescription: 'Recovers 1 severe hit worth of HP',  bandaidsRemoved: 3 },
  mushroom:    { tier: 'legendary', healAmount: 100, dropRate: 0.03, tierColor: '#FFD700', tierLabel: 'Legendary', healDescription: 'Fully restores HP',                   bandaidsRemoved: 'all' },
}

export const ALL_TREATS: TreatType[] = ['blueberries', 'apple', 'strawberry', 'acorn', 'grapes', 'mushroom']
export const TIER_ORDER: TreatTier[] = ['legendary', 'rare', 'uncommon', 'common']

export const TIER_SECTION_COLORS: Record<TreatTier, string> = {
  common: 'rgba(158, 158, 158, 0.08)',
  uncommon: 'rgba(102, 187, 106, 0.08)',
  rare: 'rgba(171, 71, 188, 0.08)',
  legendary: 'rgba(255, 215, 0, 0.08)',
}

export const TREAT_EMOJI: Record<TreatType, string> = {
  blueberries: '\uD83E\uDED0',
  apple: '\uD83C\uDF4E',
  strawberry: '\uD83C\uDF53',
  acorn: '\uD83C\uDF30',
  grapes: '\uD83C\uDF47',
  mushroom: '\uD83C\uDF44',
}

export function pickRandomTreat(): TreatType {
  const roll = Math.random()
  let cumulative = 0
  for (const treat of ALL_TREATS) {
    cumulative += TREAT_TIERS[treat].dropRate
    if (roll < cumulative) return treat
  }
  return 'blueberries'
}

interface Props {
  treat: TreatType
  size?: number
  animated?: boolean
  showTier?: boolean
  className?: string
}

export function TreatIllustration({ treat, size = 100, animated = false, showTier = false, className = '' }: Props) {
  const meta = TREAT_TIERS[treat]
  const tierClass = styles[meta.tier] || ''

  return (
    <div
      className={`${styles.wrap} ${animated ? styles.animated : ''} ${tierClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className={styles.svg}>
        {treat === 'apple' && <AppleSVG />}
        {treat === 'acorn' && <AcornSVG />}
        {treat === 'grapes' && <GrapesSVG />}
        {treat === 'strawberry' && <StrawberrySVG />}
        {treat === 'mushroom' && <GoldenMushroomSVG />}
        {treat === 'blueberries' && <BlueberriesSVG />}
      </svg>
      {animated && (
        <>
          <span className={styles.sparkle} style={{ top: '5%', right: '10%' }}>✦</span>
          <span className={styles.sparkle} style={{ bottom: '15%', left: '5%', animationDelay: '0.3s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '20%', left: '8%', animationDelay: '0.6s' }}>✧</span>
        </>
      )}
      {showTier && (
        <span className={styles.tierBadge} style={{ color: meta.tierColor }}>
          {meta.tierLabel}
        </span>
      )}
    </div>
  )
}

function AppleSVG() {
  return (
    <g>
      <ellipse cx="50" cy="58" rx="30" ry="32" fill="#E53935" />
      <ellipse cx="50" cy="58" rx="30" ry="32" fill="url(#appleGrad)" />
      <ellipse cx="38" cy="48" rx="8" ry="12" fill="rgba(255,255,255,0.35)" transform="rotate(-15 38 48)" />
      <path d="M50 28 Q52 22 50 16" fill="none" stroke="#6D4C28" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="57" cy="22" rx="10" ry="5" fill="#66BB6A" transform="rotate(25 57 22)" />
      <path d="M52 22 Q57 20 62 22" fill="none" stroke="#43A047" strokeWidth="0.8" />
      <defs>
        <radialGradient id="appleGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      </defs>
    </g>
  )
}

function AcornSVG() {
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
      <ellipse cx="50" cy="62" rx="22" ry="26" fill="url(#acornGrad)" />
      <ellipse cx="42" cy="54" rx="5" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-10 42 54)" />
      <defs>
        <radialGradient id="acornGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#E0B06A" />
          <stop offset="100%" stopColor="#B8863C" />
        </radialGradient>
      </defs>
    </g>
  )
}

function GrapesSVG() {
  return (
    <g>
      {[
        [42, 42], [58, 42], [50, 42],
        [38, 54], [50, 54], [62, 54],
        [44, 66], [56, 66],
        [50, 76],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="10" fill="#7B1FA2" />
          <circle cx={cx} cy={cy} r="10" fill={`rgba(${155 + i * 8}, 50, ${180 + i * 5}, 0.3)`} />
          <ellipse cx={cx! - 3} cy={cy! - 3} rx="3" ry="4" fill="rgba(255,255,255,0.3)" />
        </g>
      ))}
      <path d="M50 32 Q48 22 52 16" fill="none" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 18 Q58 14 54 10 Q50 6 56 4" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="42" cy="26" rx="9" ry="5" fill="#66BB6A" transform="rotate(-30 42 26)" />
      <circle cx="68" cy="38" r="2" fill="#FFD700" opacity="0.6" />
      <circle cx="72" cy="42" r="1.2" fill="#FFD700" opacity="0.4" />
    </g>
  )
}

function StrawberrySVG() {
  return (
    <g>
      <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill="#E53935" />
      <path d="M50 85 Q25 60 30 40 Q35 25 50 22 Q65 25 70 40 Q75 60 50 85Z" fill="url(#strawGrad)" />
      {[
        [42, 40], [54, 38], [48, 50], [58, 48], [38, 52],
        [44, 62], [56, 60], [50, 72], [38, 65], [60, 55],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="1.8" ry="2.5" fill="#FDD835" transform={`rotate(${(i * 20) % 40 - 20} ${cx} ${cy})`} />
      ))}
      <ellipse cx="40" cy="38" rx="5" ry="10" fill="rgba(255,255,255,0.3)" transform="rotate(-15 40 38)" />
      <g transform="translate(50, 24)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <ellipse key={deg} cx="0" cy="-8" rx="4" ry="9" fill="#43A047"
            transform={`rotate(${deg})`} />
        ))}
      </g>
      <defs>
        <radialGradient id="strawGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      </defs>
    </g>
  )
}

function GoldenMushroomSVG() {
  return (
    <g>
      {/* Golden cap */}
      <ellipse cx="50" cy="42" rx="34" ry="28" fill="#FFD700" />
      <ellipse cx="50" cy="42" rx="34" ry="28" fill="url(#goldCapGrad)" />
      {/* Sparkle spots */}
      <circle cx="36" cy="32" r="6" fill="#FFF8E1" opacity="0.85" />
      <circle cx="58" cy="28" r="7" fill="#FFF8E1" opacity="0.85" />
      <circle cx="48" cy="42" r="4" fill="#FFF8E1" opacity="0.7" />
      <circle cx="68" cy="40" r="5" fill="#FFF8E1" opacity="0.75" />
      <circle cx="32" cy="46" r="3.5" fill="#FFF8E1" opacity="0.6" />
      {/* Shimmer shine */}
      <ellipse cx="38" cy="28" rx="5" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-20 38 28)" />
      <ellipse cx="60" cy="36" rx="3" ry="5" fill="rgba(255,255,255,0.3)" transform="rotate(15 60 36)" />
      {/* Cap underside */}
      <path d="M20 48 Q50 56 80 48" fill="#F5E6B8" stroke="#E8D48C" strokeWidth="1" />
      {/* Stem */}
      <rect x="38" y="48" width="24" height="30" rx="10" fill="#FFF8E1" />
      <rect x="38" y="48" width="24" height="30" rx="10" fill="url(#goldStemGrad)" />
      {/* Star sparkles on the cap */}
      <g className={styles.mushroomStars}>
        <polygon points="30,24 31.5,27 35,27.5 32.5,30 33,33.5 30,32 27,33.5 27.5,30 25,27.5 28.5,27" fill="#FFF" opacity="0.9" />
        <polygon points="65,22 66,24 68,24.3 66.5,26 67,28 65,27 63,28 63.5,26 62,24.3 64,24" fill="#FFF" opacity="0.7" />
        <polygon points="72,44 73,46 75,46.2 73.5,47.5 74,49.5 72,48.5 70,49.5 70.5,47.5 69,46.2 71,46" fill="#FFF" opacity="0.6" />
      </g>
      <defs>
        <radialGradient id="goldCapGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#F9A825" />
        </radialGradient>
        <radialGradient id="goldStemGrad" cx="50%" cy="20%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="100%" stopColor="#FFF3C4" />
        </radialGradient>
      </defs>
    </g>
  )
}

function BlueberriesSVG() {
  return (
    <g>
      <circle cx="32" cy="60" r="16" fill="#3F51B5" />
      <ellipse cx="28" cy="55" rx="4" ry="6" fill="rgba(255,255,255,0.25)" />
      <circle cx="32" cy="52" r="3" fill="#303F9F" />
      <circle cx="68" cy="60" r="16" fill="#3F51B5" />
      <ellipse cx="64" cy="55" rx="4" ry="6" fill="rgba(255,255,255,0.25)" />
      <circle cx="68" cy="52" r="3" fill="#303F9F" />
      <circle cx="50" cy="65" r="20" fill="#3949AB" />
      <circle cx="50" cy="65" r="20" fill="url(#blueGrad)" />
      <ellipse cx="44" cy="58" rx="5" ry="7" fill="rgba(255,255,255,0.3)" />
      <circle cx="50" cy="57" r="3.5" fill="#283593" />
      <ellipse cx="50" cy="40" rx="12" ry="5" fill="#66BB6A" transform="rotate(-10 50 40)" />
      <path d="M44 40 Q50 38 56 40" fill="none" stroke="#43A047" strokeWidth="0.8" />
      <path d="M50 45 Q50 38 48 34" fill="none" stroke="#6D4C28" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <radialGradient id="blueGrad" cx="38%" cy="35%">
          <stop offset="0%" stopColor="#5C6BC0" />
          <stop offset="100%" stopColor="#283593" />
        </radialGradient>
      </defs>
    </g>
  )
}
