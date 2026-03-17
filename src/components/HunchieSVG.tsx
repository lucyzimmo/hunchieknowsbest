import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Custom cute chibi Hunchie hedgehog SVG with mood-based face */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Main quill gradient: face color at forehead → dark brown at tips */}
        <linearGradient id="quillMain" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#F0D0A0" />
          <stop offset="25%" stopColor="#D8B468" />
          <stop offset="50%" stopColor="#C49A4A" />
          <stop offset="80%" stopColor="#B08538" />
          <stop offset="100%" stopColor="#A07830" />
        </linearGradient>
        {/* Side quill gradient: blends from face into quill color horizontally */}
        <radialGradient id="quillBlend" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#F5D8A8" />
          <stop offset="35%" stopColor="#DFBE78" />
          <stop offset="65%" stopColor="#C49A4A" />
          <stop offset="100%" stopColor="#B08538" />
        </radialGradient>
        {/* Light face/snout gradient */}
        <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF5E0" />
          <stop offset="60%" stopColor="#FDDCAA" />
          <stop offset="100%" stopColor="#F5D098" />
        </radialGradient>
        {/* Forehead blend — transitions face into quills */}
        <linearGradient id="foreheadBlend" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FDDCAA" />
          <stop offset="40%" stopColor="#E8C888" />
          <stop offset="70%" stopColor="#D4AE68" />
          <stop offset="100%" stopColor="#C49A4A" />
        </linearGradient>
      </defs>

      {/* ── QUILLS: soft spiky, from between eyes/ears, wrapping around back ── */}
      {/* Base mass behind body */}
      <path d="
        M100 92
        Q85 88 65 82
        Q40 78 25 100
        Q12 125 18 155
        Q28 180 60 185
        Q80 188 100 186
        Q120 188 140 185
        Q172 180 182 155
        Q188 125 175 100
        Q160 78 135 82
        Q115 88 100 92
        Z
      " fill="url(#quillMain)" />

      {/* Soft spiky tips — pointed but rounded, not menacing */}
      {/* Top center — V between eyes */}
      <path d="M92 88 L88 72 Q90 78 95 82 Z" fill="#C49A4A" />
      <path d="M100 90 L100 68 Q102 76 104 84 Z" fill="#B8893E" />
      <path d="M108 88 L112 72 Q110 78 105 82 Z" fill="#C49A4A" />

      {/* Between eyes and left ear */}
      <path d="M80 86 L72 68 Q76 76 82 82 Z" fill="#C49A4A" />
      <path d="M70 82 L58 62 Q64 72 72 80 Z" fill="#B8893E" />

      {/* Between eyes and right ear */}
      <path d="M120 86 L128 68 Q124 76 118 82 Z" fill="#C49A4A" />
      <path d="M130 82 L142 62 Q136 72 128 80 Z" fill="#B8893E" />

      {/* Left side spikes */}
      <path d="M55 80 L38 64 Q44 72 52 78 Z" fill="#B8893E" />
      <path d="M42 92 L22 78 Q30 86 40 90 Z" fill="#B08538" />
      <path d="M32 108 L12 96 Q20 102 30 106 Z" fill="#B08538" />
      <path d="M25 128 L8 118 Q14 124 24 126 Z" fill="#A07830" />
      <path d="M22 148 L6 142 Q12 146 22 148 Z" fill="#A07830" />
      <path d="M28 165 L14 162 Q20 164 28 164 Z" fill="#A07830" />

      {/* Right side spikes */}
      <path d="M145 80 L162 64 Q156 72 148 78 Z" fill="#B8893E" />
      <path d="M158 92 L178 78 Q170 86 160 90 Z" fill="#B08538" />
      <path d="M168 108 L188 96 Q180 102 170 106 Z" fill="#B08538" />
      <path d="M175 128 L192 118 Q186 124 176 126 Z" fill="#A07830" />
      <path d="M178 148 L194 142 Q188 146 178 148 Z" fill="#A07830" />
      <path d="M172 165 L186 162 Q180 164 172 164 Z" fill="#A07830" />

      {/* Bottom spikes */}
      <path d="M50 182 L40 192 Q44 186 50 184 Z" fill="#A07830" />
      <path d="M75 186 L70 196 Q72 190 76 186 Z" fill="#A07830" />
      <path d="M100 188 L100 198 Q102 192 104 188 Z" fill="#A07830" />
      <path d="M125 186 L130 196 Q128 190 124 186 Z" fill="#A07830" />
      <path d="M150 182 L160 192 Q156 186 150 184 Z" fill="#A07830" />

      {/* ── Body ── */}
      <ellipse cx="100" cy="120" rx="62" ry="55" fill="#FDDCAA" />

      {/* Belly */}
      <ellipse cx="100" cy="130" rx="44" ry="40" fill="#FFF2DA" />

      {/* ── Face/snout area — tapered, very light tan ── */}
      <path d="M65 100 Q62 118 70 135 Q80 152 100 158 Q120 152 130 135 Q138 118 135 100 Q125 92 100 90 Q75 92 65 100 Z" fill="url(#faceGrad)" />

      {/* Left ear (nestled where quills meet face) */}
      <ellipse cx="55" cy="82" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="55" cy="82" rx="7" ry="9" fill="#F8B8A8" />

      {/* Right ear */}
      <ellipse cx="145" cy="82" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="145" cy="82" rx="7" ry="9" fill="#F8B8A8" />

      {/* Left arm */}
      <ellipse cx="48" cy="135" rx="12" ry="8" fill="#FDDCAA" transform="rotate(-15 48 135)" />

      {/* Right arm */}
      <ellipse cx="152" cy="135" rx="12" ry="8" fill="#FDDCAA" transform="rotate(15 152 135)" />

      {/* Left foot */}
      <ellipse cx="78" cy="172" rx="14" ry="9" fill="#F0C888" />

      {/* Right foot */}
      <ellipse cx="122" cy="172" rx="14" ry="9" fill="#F0C888" />

      {/* ── MOOD-BASED FACE ── */}
      <MoodFace mood={mood} />

      {/* Tiny nose */}
      <ellipse cx="100" cy="132" rx="4" ry="3.5" fill="#A07050" />
      <ellipse cx="99" cy="131" rx="1.8" ry="1.2" fill="#B88868" />

      {/* Blush cheeks */}
      <ellipse cx="72" cy="133" rx="11" ry="7" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />
      <ellipse cx="128" cy="133" rx="11" ry="7" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />

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
          <circle cx="78" cy="115" r="12" fill="#3E2723" />
          <circle cx="122" cy="115" r="12" fill="#3E2723" />
          <circle cx="82" cy="111" r="5" fill="#fff" />
          <circle cx="126" cy="111" r="5" fill="#fff" />
          <circle cx="75" cy="118" r="2.5" fill="#fff" />
          <circle cx="119" cy="118" r="2.5" fill="#fff" />
          <path d="M92 140 Q100 150 108 140" fill="none" stroke="#7B5B40" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          <circle cx="78" cy="115" r="10" fill="#3E2723" />
          <circle cx="122" cy="115" r="10" fill="#3E2723" />
          <circle cx="81" cy="112" r="4" fill="#fff" />
          <circle cx="125" cy="112" r="4" fill="#fff" />
          <path d="M94 139 Q100 145 106 139" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          <circle cx="78" cy="118" r="11" fill="#3E2723" />
          <circle cx="122" cy="118" r="11" fill="#3E2723" />
          <circle cx="81" cy="115" r="4.5" fill="#fff" />
          <circle cx="125" cy="115" r="4.5" fill="#fff" />
          <circle cx="76" cy="120" r="2" fill="#fff" opacity="0.6" />
          <circle cx="120" cy="120" r="2" fill="#fff" opacity="0.6" />
          <path d="M68 105 Q74 102 86 107" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M132 105 Q126 102 114 107" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M94 143 Q100 138 106 143" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          <circle cx="78" cy="115" r="10" fill="#3E2723" />
          <circle cx="122" cy="115" r="10" fill="#3E2723" />
          <circle cx="81" cy="112" r="4" fill="#fff" />
          <circle cx="125" cy="112" r="4" fill="#fff" />
          <path d="M68 105 L86 109" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M132 105 L114 109" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M96 142 Q100 139 104 142" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="130" cy="130" rx="12" ry="8" fill="#F8B0B0" opacity="0.3" />
        </>
      )
    case 'sleepy':
      return (
        <>
          <path d="M68 116 Q78 123 88 116" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M112 116 Q122 123 132 116" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
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
      <text x="98" y="14" fontSize="9" fill="#FFD700" opacity="0.5">✦</text>
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
    <g transform="translate(145, 80)" opacity="0.5">
      <circle cx="0" cy="0" r="4" fill="#E8C0C0" />
      <circle cx="6" cy="-4" r="3" fill="#E8C0C0" />
      <circle cx="10" cy="-7" r="2" fill="#E8C0C0" />
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
