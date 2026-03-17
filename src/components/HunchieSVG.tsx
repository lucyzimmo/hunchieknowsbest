import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Custom cute chibi Hunchie hedgehog SVG with mood-based face */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fluffy quills (soft rounded bumps, behind body) */}
      <ellipse cx="100" cy="72" rx="70" ry="52" fill="#C49A4A" />
      {/* Fluffy bumps along the top */}
      <circle cx="42" cy="78" r="16" fill="#B8893E" />
      <circle cx="58" cy="55" r="18" fill="#C49A4A" />
      <circle cx="78" cy="38" r="19" fill="#B8893E" />
      <circle cx="100" cy="32" r="20" fill="#C49A4A" />
      <circle cx="122" cy="38" r="19" fill="#B8893E" />
      <circle cx="142" cy="55" r="18" fill="#C49A4A" />
      <circle cx="158" cy="78" r="16" fill="#B8893E" />
      {/* Extra fluff fill */}
      <circle cx="68" cy="45" r="14" fill="#C49A4A" />
      <circle cx="132" cy="45" r="14" fill="#C49A4A" />
      <circle cx="50" cy="68" r="13" fill="#C49A4A" />
      <circle cx="150" cy="68" r="13" fill="#C49A4A" />
      {/* Highlight fluff */}
      <circle cx="80" cy="36" r="8" fill="#D4A858" opacity="0.5" />
      <circle cx="120" cy="36" r="8" fill="#D4A858" opacity="0.5" />
      <circle cx="100" cy="30" r="7" fill="#D4A858" opacity="0.4" />

      {/* Body (warm beige/tan, big and round for chibi) */}
      <ellipse cx="100" cy="120" rx="62" ry="55" fill="#FDDCAA" />

      {/* Belly (lighter, big chibi belly) */}
      <ellipse cx="100" cy="130" rx="44" ry="40" fill="#FFF2DA" />

      {/* Left ear */}
      <ellipse cx="58" cy="78" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="58" cy="78" rx="7" ry="9" fill="#F8B8A8" />

      {/* Right ear */}
      <ellipse cx="142" cy="78" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="142" cy="78" rx="7" ry="9" fill="#F8B8A8" />

      {/* Left arm (stubby chibi arm) */}
      <ellipse cx="48" cy="135" rx="12" ry="8" fill="#FDDCAA" transform="rotate(-15 48 135)" />

      {/* Right arm */}
      <ellipse cx="152" cy="135" rx="12" ry="8" fill="#FDDCAA" transform="rotate(15 152 135)" />

      {/* Left foot (round chibi foot) */}
      <ellipse cx="78" cy="172" rx="14" ry="9" fill="#F0C888" />

      {/* Right foot */}
      <ellipse cx="122" cy="172" rx="14" ry="9" fill="#F0C888" />

      {/* ── MOOD-BASED FACE ── */}
      <MoodFace mood={mood} />

      {/* Tiny nose (centered, small, cute) */}
      <ellipse cx="100" cy="132" rx="4" ry="3.5" fill="#A07050" />
      <ellipse cx="99" cy="131" rx="1.8" ry="1.2" fill="#B88868" />

      {/* Blush cheeks */}
      <ellipse cx="72" cy="133" rx="11" ry="7" fill={mood === 'annoyed' ? '#F0A0A0' : '#FBCCC4'} opacity={mood === 'annoyed' ? 0.45 : 0.35} />
      <ellipse cx="128" cy="133" rx="11" ry="7" fill={mood === 'annoyed' ? '#F0A0A0' : '#FBCCC4'} opacity={mood === 'annoyed' ? 0.45 : 0.35} />

      {/* Mood extras */}
      {mood === 'happy' && <HappyExtras />}
      {mood === 'sad' && <SadExtras />}
      {mood === 'annoyed' && <AnnoyedExtras />}
      {mood === 'sleepy' && <SleepyExtras />}
    </svg>
  )
}

function MoodFace({ mood }: { mood: HunchieMood }) {
  switch (mood) {
    case 'happy':
      return (
        <>
          {/* Big sparkly eyes */}
          <circle cx="78" cy="115" r="12" fill="#3E2723" />
          <circle cx="122" cy="115" r="12" fill="#3E2723" />
          {/* Big highlights */}
          <circle cx="82" cy="111" r="5" fill="#fff" />
          <circle cx="126" cy="111" r="5" fill="#fff" />
          <circle cx="75" cy="118" r="2.5" fill="#fff" />
          <circle cx="119" cy="118" r="2.5" fill="#fff" />
          {/* Smile */}
          <path d="M92 140 Q100 150 108 140" fill="none" stroke="#7B5B40" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          {/* Relaxed eyes */}
          <circle cx="78" cy="115" r="10" fill="#3E2723" />
          <circle cx="122" cy="115" r="10" fill="#3E2723" />
          <circle cx="81" cy="112" r="4" fill="#fff" />
          <circle cx="125" cy="112" r="4" fill="#fff" />
          {/* Gentle smile */}
          <path d="M94 139 Q100 145 106 139" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          {/* Big watery eyes */}
          <circle cx="78" cy="118" r="11" fill="#3E2723" />
          <circle cx="122" cy="118" r="11" fill="#3E2723" />
          <circle cx="81" cy="115" r="4.5" fill="#fff" />
          <circle cx="125" cy="115" r="4.5" fill="#fff" />
          <circle cx="76" cy="120" r="2" fill="#fff" opacity="0.6" />
          <circle cx="120" cy="120" r="2" fill="#fff" opacity="0.6" />
          {/* Thin worried brows */}
          <path d="M68 105 Q74 102 86 107" fill="none" stroke="#7B5B40" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M132 105 Q126 102 114 107" fill="none" stroke="#7B5B40" strokeWidth="1.5" strokeLinecap="round" />
          {/* Small frown */}
          <path d="M94 143 Q100 138 106 143" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          {/* Narrow squinting eyes */}
          <ellipse cx="78" cy="116" rx="11" ry="7" fill="#3E2723" />
          <ellipse cx="122" cy="116" rx="11" ry="7" fill="#3E2723" />
          <circle cx="80" cy="115" r="3" fill="#fff" />
          <circle cx="124" cy="115" r="3" fill="#fff" />
          {/* Thin angry brows — V shape */}
          <path d="M66 104 L88 110" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M134 104 L112 110" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
          {/* Tight frown */}
          <path d="M92 143 Q100 137 108 143" fill="none" stroke="#7B5B40" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'sleepy':
      return (
        <>
          {/* Closed curved eyes */}
          <path d="M68 116 Q78 123 88 116" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M112 116 Q122 123 132 116" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tiny O mouth */}
          <ellipse cx="100" cy="141" rx="3.5" ry="3" fill="none" stroke="#7B5B40" strokeWidth="1.5" />
        </>
      )
  }
}

function HappyExtras() {
  return (
    <>
      <text x="40" y="50" fontSize="12" fill="#FFD700" opacity="0.7">✦</text>
      <text x="155" y="55" fontSize="10" fill="#FFD700" opacity="0.6">✦</text>
      <text x="98" y="22" fontSize="9" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadExtras() {
  return (
    <>
      <ellipse cx="74" cy="128" rx="2" ry="3.5" fill="#90CAF9" opacity="0.6" />
      <ellipse cx="126" cy="129" rx="2" ry="3.5" fill="#90CAF9" opacity="0.5" />
    </>
  )
}

function AnnoyedExtras() {
  return (
    <g transform="translate(148, 60)">
      <path d="M0 3 L6 0 M3 0 L0 6 M6 3 L0 6 M3 6 L6 0" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </g>
  )
}

function SleepyExtras() {
  return (
    <>
      <text x="148" y="70" fontSize="14" fill="#9575CD" fontWeight="700" opacity="0.7">Z</text>
      <text x="157" y="55" fontSize="10" fill="#9575CD" fontWeight="700" opacity="0.5">z</text>
      <text x="163" y="44" fontSize="7" fill="#9575CD" fontWeight="700" opacity="0.35">z</text>
    </>
  )
}
