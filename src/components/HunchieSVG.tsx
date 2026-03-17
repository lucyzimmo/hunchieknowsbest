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

      {/* ── QUILLS: continuous shape from forehead around ears to back ── */}
      {/* Base quill shape wrapping from forehead around */}
      <path d="
        M55 95
        Q42 88 36 72
        Q30 55 42 42
        Q50 25 68 22
        Q82 12 100 10
        Q118 12 132 22
        Q150 25 158 42
        Q170 55 164 72
        Q158 88 145 95
        Q135 100 100 100
        Q65 100 55 95
        Z
      " fill="url(#quillMain)" />

      {/* Fluffy rounded bumps along the top — softened */}
      <circle cx="45" cy="68" r="14" fill="url(#quillBlend)" />
      <circle cx="58" cy="48" r="15" fill="url(#quillBlend)" />
      <circle cx="76" cy="32" r="16" fill="url(#quillBlend)" />
      <circle cx="100" cy="25" r="17" fill="url(#quillBlend)" />
      <circle cx="124" cy="32" r="16" fill="url(#quillBlend)" />
      <circle cx="142" cy="48" r="15" fill="url(#quillBlend)" />
      <circle cx="155" cy="68" r="14" fill="url(#quillBlend)" />

      {/* Fill gaps between bumps */}
      <circle cx="67" cy="38" r="11" fill="#C49A4A" />
      <circle cx="88" cy="27" r="11" fill="#C49A4A" />
      <circle cx="112" cy="27" r="11" fill="#C49A4A" />
      <circle cx="133" cy="38" r="11" fill="#C49A4A" />
      <circle cx="50" cy="58" r="10" fill="#C49A4A" />
      <circle cx="150" cy="58" r="10" fill="#C49A4A" />

      {/* Subtle highlights on quill tips */}
      <circle cx="76" cy="28" r="5" fill="#D8B060" opacity="0.35" />
      <circle cx="100" cy="22" r="5" fill="#D8B060" opacity="0.3" />
      <circle cx="124" cy="28" r="5" fill="#D8B060" opacity="0.35" />

      {/* ── Forehead blend zone — smooth transition from quills into face ── */}
      <ellipse cx="100" cy="95" rx="50" ry="14" fill="url(#foreheadBlend)" />

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
