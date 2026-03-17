import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Cute cartoon hedgehog inspired by classic porcupine illustration style */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="quillGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#D4A050" />
          <stop offset="40%" stopColor="#B8893E" />
          <stop offset="70%" stopColor="#9A7030" />
          <stop offset="100%" stopColor="#856028" />
        </linearGradient>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#FFF5E0" />
          <stop offset="70%" stopColor="#FDDCAA" />
          <stop offset="100%" stopColor="#F0C890" />
        </radialGradient>
      </defs>

      {/* ── QUILLS: hood/cape shape from top of head down the back ── */}
      {/* Like a spiky cape/hood — rounded overall shape with soft spiky edges */}
      <path d="
        M100 108
        Q88 105 76 98
        Q65 92 56 88
        Q48 84 42 78
        Q36 70 32 62
        Q28 52 35 42
        Q40 32 50 28
        Q60 22 72 20
        Q84 16 100 14
        Q116 16 128 20
        Q140 22 150 28
        Q160 32 165 42
        Q172 52 168 62
        Q164 70 158 78
        Q152 84 144 88
        Q135 92 124 98
        Q112 105 100 108
      " fill="url(#quillGrad)" stroke="none" />

      {/* Spiky edge bumps — soft pointed, not sharp */}
      {/* Top */}
      <path d="M50 28 Q45 14 52 20 Q48 10 58 18" fill="#9A7030" />
      <path d="M65 22 Q60 6 68 14 Q64 2 74 14" fill="#856028" />
      <path d="M82 18 Q80 2 88 10 Q84 -2 92 10" fill="#9A7030" />
      <path d="M100 14 Q100 -2 104 8 Q100 -4 108 8" fill="#856028" />
      <path d="M118 18 Q120 2 112 10 Q116 -2 108 10" fill="#9A7030" />
      <path d="M135 22 Q140 6 132 14 Q136 2 126 14" fill="#856028" />
      <path d="M150 28 Q155 14 148 20 Q152 10 142 18" fill="#9A7030" />

      {/* Left side */}
      <path d="M36 42 Q22 34 32 38 Q18 30 30 36" fill="#9A7030" />
      <path d="M32 55 Q16 48 28 50 Q12 44 26 48" fill="#856028" />
      <path d="M32 68 Q14 62 28 64 Q10 58 26 62" fill="#9A7030" />
      <path d="M38 80 Q20 76 34 78 Q16 74 32 76" fill="#856028" />
      <path d="M48 90 Q32 88 44 88 Q28 86 42 86" fill="#9A7030" />

      {/* Right side */}
      <path d="M164 42 Q178 34 168 38 Q182 30 170 36" fill="#9A7030" />
      <path d="M168 55 Q184 48 172 50 Q188 44 174 48" fill="#856028" />
      <path d="M168 68 Q186 62 172 64 Q190 58 174 62" fill="#9A7030" />
      <path d="M162 80 Q180 76 166 78 Q184 74 168 76" fill="#856028" />
      <path d="M152 90 Q168 88 156 88 Q172 86 158 86" fill="#9A7030" />

      {/* ── BODY: round, cute, front-facing ── */}
      <ellipse cx="100" cy="130" rx="56" ry="52" fill="#FDDCAA" />

      {/* Belly — big light oval */}
      <ellipse cx="100" cy="138" rx="40" ry="38" fill="#FFF2DA" />

      {/* Face area — light tan snout tapering down */}
      <path d="M62 100 Q58 120 66 138 Q78 156 100 162 Q122 156 134 138 Q142 120 138 100 Q128 94 100 92 Q72 94 62 100 Z" fill="url(#faceGrad)" />

      {/* Ears — poking out from quill edge */}
      <ellipse cx="52" cy="82" rx="11" ry="13" fill="#FDDCAA" stroke="#E8C088" strokeWidth="1" />
      <ellipse cx="52" cy="82" rx="6" ry="8" fill="#F0B0A0" />
      <ellipse cx="148" cy="82" rx="11" ry="13" fill="#FDDCAA" stroke="#E8C088" strokeWidth="1" />
      <ellipse cx="148" cy="82" rx="6" ry="8" fill="#F0B0A0" />

      {/* Stubby arms */}
      <ellipse cx="52" cy="145" rx="10" ry="7" fill="#F0C888" transform="rotate(-20 52 145)" />
      <ellipse cx="148" cy="145" rx="10" ry="7" fill="#F0C888" transform="rotate(20 148 145)" />

      {/* Round feet */}
      <ellipse cx="78" cy="178" rx="12" ry="8" fill="#E8C088" />
      <ellipse cx="122" cy="178" rx="12" ry="8" fill="#E8C088" />

      {/* ── FACE ── */}
      <MoodFace mood={mood} />

      {/* Nose — small round */}
      <ellipse cx="100" cy="134" rx="4.5" ry="4" fill="#6B4030" />
      <ellipse cx="99" cy="133" rx="2" ry="1.2" fill="#8B6048" />

      {/* Blush cheeks */}
      <ellipse cx="74" cy="136" rx="10" ry="6" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.4" />
      <ellipse cx="126" cy="136" rx="10" ry="6" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.4" />

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
          <circle cx="82" cy="118" r="11" fill="#2A1F14" />
          <circle cx="118" cy="118" r="11" fill="#2A1F14" />
          <circle cx="86" cy="114" r="4.5" fill="#fff" />
          <circle cx="122" cy="114" r="4.5" fill="#fff" />
          <circle cx="79" cy="120" r="2" fill="#fff" />
          <circle cx="115" cy="120" r="2" fill="#fff" />
          <path d="M90 144 Q100 155 110 144" fill="none" stroke="#6B4030" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          <circle cx="82" cy="118" r="9" fill="#2A1F14" />
          <circle cx="118" cy="118" r="9" fill="#2A1F14" />
          <circle cx="85" cy="115" r="3.5" fill="#fff" />
          <circle cx="121" cy="115" r="3.5" fill="#fff" />
          <path d="M93 143 Q100 149 107 143" fill="none" stroke="#6B4030" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          <circle cx="82" cy="120" r="10" fill="#2A1F14" />
          <circle cx="118" cy="120" r="10" fill="#2A1F14" />
          <circle cx="85" cy="117" r="4" fill="#fff" />
          <circle cx="121" cy="117" r="4" fill="#fff" />
          <circle cx="80" cy="122" r="1.8" fill="#fff" opacity="0.5" />
          <circle cx="116" cy="122" r="1.8" fill="#fff" opacity="0.5" />
          <path d="M72 110 Q78 107 88 111" fill="none" stroke="#8B7060" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M128 110 Q122 107 112 111" fill="none" stroke="#8B7060" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M93 148 Q100 143 107 148" fill="none" stroke="#6B4030" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          <circle cx="82" cy="118" r="9" fill="#2A1F14" />
          <circle cx="118" cy="118" r="9" fill="#2A1F14" />
          <circle cx="85" cy="116" r="3.5" fill="#fff" />
          <circle cx="121" cy="116" r="3.5" fill="#fff" />
          <path d="M72 109 L88 113" fill="none" stroke="#8B7060" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M128 109 L112 113" fill="none" stroke="#8B7060" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M95 146 Q100 143 105 146" fill="none" stroke="#6B4030" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="128" cy="134" rx="11" ry="7" fill="#F8B0B0" opacity="0.3" />
        </>
      )
    case 'sleepy':
      return (
        <>
          <path d="M72 118 Q82 125 92 118" fill="none" stroke="#2A1F14" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M108 118 Q118 125 128 118" fill="none" stroke="#2A1F14" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="100" cy="145" rx="3.5" ry="3" fill="none" stroke="#6B4030" strokeWidth="1.5" />
        </>
      )
  }
}

function HappyExtras() {
  return (
    <>
      <text x="44" y="50" fontSize="10" fill="#FFD700" opacity="0.7">✦</text>
      <text x="150" y="55" fontSize="8" fill="#FFD700" opacity="0.6">✦</text>
      <text x="98" y="10" fontSize="7" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadExtras() {
  return (
    <>
      <ellipse cx="78" cy="130" rx="1.5" ry="3" fill="#90CAF9" opacity="0.6" />
      <ellipse cx="122" cy="131" rx="1.5" ry="3" fill="#90CAF9" opacity="0.5" />
    </>
  )
}

function AnnoyedExtras() {
  return (
    <g transform="translate(148, 82)" opacity="0.5">
      <circle cx="0" cy="0" r="3.5" fill="#E8C0C0" />
      <circle cx="5" cy="-3" r="2.5" fill="#E8C0C0" />
      <circle cx="9" cy="-6" r="1.5" fill="#E8C0C0" />
    </g>
  )
}

function SleepyExtras() {
  return (
    <>
      <text x="148" y="72" fontSize="13" fill="#9575CD" fontWeight="700" opacity="0.7">Z</text>
      <text x="156" y="58" fontSize="9" fill="#9575CD" fontWeight="700" opacity="0.5">z</text>
      <text x="162" y="48" fontSize="6" fill="#9575CD" fontWeight="700" opacity="0.35">z</text>
    </>
  )
}
