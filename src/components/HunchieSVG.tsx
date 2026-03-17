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

      {/* ── QUILLS: V-shape from forehead, wrapping around entire body ── */}
      {/* Main quill mass — wraps from forehead V down around sides and back */}
      <path d="
        M100 88
        Q90 82 78 78
        Q55 72 38 85
        Q18 100 15 125
        Q14 150 30 168
        Q45 182 70 182
        Q85 182 100 178
        Q115 182 130 182
        Q155 182 170 168
        Q186 150 185 125
        Q182 100 162 85
        Q145 72 122 78
        Q110 82 100 88
        Z
      " fill="url(#quillMain)" />

      {/* Fluffy bumps along the top V and sides */}
      {/* Top V */}
      <circle cx="78" cy="74" r="12" fill="url(#quillBlend)" />
      <circle cx="100" cy="82" r="10" fill="url(#quillBlend)" />
      <circle cx="122" cy="74" r="12" fill="url(#quillBlend)" />
      {/* Upper sides */}
      <circle cx="58" cy="76" r="13" fill="url(#quillBlend)" />
      <circle cx="142" cy="76" r="13" fill="url(#quillBlend)" />
      <circle cx="40" cy="90" r="14" fill="url(#quillBlend)" />
      <circle cx="160" cy="90" r="14" fill="url(#quillBlend)" />
      {/* Mid sides */}
      <circle cx="28" cy="110" r="14" fill="url(#quillBlend)" />
      <circle cx="172" cy="110" r="14" fill="url(#quillBlend)" />
      <circle cx="22" cy="130" r="13" fill="url(#quillBlend)" />
      <circle cx="178" cy="130" r="13" fill="url(#quillBlend)" />
      {/* Lower sides */}
      <circle cx="25" cy="150" r="12" fill="url(#quillBlend)" />
      <circle cx="175" cy="150" r="12" fill="url(#quillBlend)" />
      <circle cx="35" cy="168" r="11" fill="url(#quillBlend)" />
      <circle cx="165" cy="168" r="11" fill="url(#quillBlend)" />
      {/* Bottom */}
      <circle cx="55" cy="178" r="10" fill="url(#quillBlend)" />
      <circle cx="145" cy="178" r="10" fill="url(#quillBlend)" />
      <circle cx="80" cy="182" r="9" fill="url(#quillBlend)" />
      <circle cx="120" cy="182" r="9" fill="url(#quillBlend)" />
      <circle cx="100" cy="180" r="8" fill="url(#quillBlend)" />

      {/* Gap fillers */}
      <circle cx="88" cy="76" r="8" fill="#C49A4A" />
      <circle cx="112" cy="76" r="8" fill="#C49A4A" />
      <circle cx="48" cy="82" r="9" fill="#C49A4A" />
      <circle cx="152" cy="82" r="9" fill="#C49A4A" />

      {/* Subtle highlights */}
      <circle cx="78" cy="70" r="4" fill="#D8B060" opacity="0.3" />
      <circle cx="122" cy="70" r="4" fill="#D8B060" opacity="0.3" />
      <circle cx="100" cy="78" r="3" fill="#D8B060" opacity="0.25" />

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
