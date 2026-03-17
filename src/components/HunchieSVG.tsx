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
        <linearGradient id="quillMain" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#F0D0A0" />
          <stop offset="25%" stopColor="#D8B468" />
          <stop offset="50%" stopColor="#C49A4A" />
          <stop offset="80%" stopColor="#B08538" />
          <stop offset="100%" stopColor="#A07830" />
        </linearGradient>
        <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF5E0" />
          <stop offset="60%" stopColor="#FDDCAA" />
          <stop offset="100%" stopColor="#F5D098" />
        </radialGradient>
      </defs>

      {/* ── LAYER 1: Back quills (behind body) — soft wavy edges ── */}
      <path d="
        M55 90
        Q42 85 32 95
        Q18 108 14 130
        Q12 155 22 172
        Q35 190 60 192
        Q80 195 100 193
        Q120 195 140 192
        Q165 190 178 172
        Q188 155 186 130
        Q182 108 168 95
        Q158 85 145 90
        Z
      " fill="url(#quillMain)" />
      {/* Soft wavy bumps along back edges */}
      <ellipse cx="22" cy="110" rx="12" ry="10" fill="#B8893E" />
      <ellipse cx="18" cy="135" rx="11" ry="10" fill="#B08538" />
      <ellipse cx="22" cy="158" rx="10" ry="9" fill="#A07830" />
      <ellipse cx="38" cy="178" rx="10" ry="8" fill="#A07830" />
      <ellipse cx="65" cy="190" rx="9" ry="7" fill="#A07830" />
      <ellipse cx="100" cy="194" rx="10" ry="7" fill="#A07830" />
      <ellipse cx="135" cy="190" rx="9" ry="7" fill="#A07830" />
      <ellipse cx="162" cy="178" rx="10" ry="8" fill="#A07830" />
      <ellipse cx="178" cy="158" rx="10" ry="9" fill="#A07830" />
      <ellipse cx="182" cy="135" rx="11" ry="10" fill="#B08538" />
      <ellipse cx="178" cy="110" rx="12" ry="10" fill="#B8893E" />
      <ellipse cx="38" cy="92" rx="10" ry="9" fill="#C49A4A" />
      <ellipse cx="162" cy="92" rx="10" ry="9" fill="#C49A4A" />

      {/* ── LAYER 2: Body ── */}
      <ellipse cx="100" cy="128" rx="58" ry="50" fill="#FDDCAA" />

      {/* Belly */}
      <ellipse cx="100" cy="136" rx="42" ry="36" fill="#FFF2DA" />

      {/* Face/snout — only lower face, NOT covering forehead */}
      <path d="M68 108 Q65 125 72 140 Q82 155 100 160 Q118 155 128 140 Q135 125 132 108 Q125 103 100 100 Q75 103 68 108 Z" fill="url(#faceGrad)" />

      {/* Ears */}
      <ellipse cx="55" cy="90" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="55" cy="90" rx="7" ry="9" fill="#F8B8A8" />
      <ellipse cx="145" cy="90" rx="12" ry="14" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="145" cy="90" rx="7" ry="9" fill="#F8B8A8" />

      {/* Arms */}
      <ellipse cx="50" cy="142" rx="12" ry="8" fill="#FDDCAA" transform="rotate(-15 50 142)" />
      <ellipse cx="150" cy="142" rx="12" ry="8" fill="#FDDCAA" transform="rotate(15 150 142)" />

      {/* Feet */}
      <ellipse cx="78" cy="175" rx="14" ry="9" fill="#F0C888" />
      <ellipse cx="122" cy="175" rx="14" ry="9" fill="#F0C888" />

      {/* ── LAYER 3: Forehead quills (ON TOP of body) ── */}
      {/* Reverse triangle from ears down to nose bridge, with soft wavy edges */}
      <path d="
        M55 90
        Q52 78 58 65
        Q65 50 78 42
        Q88 34 100 30
        Q112 34 122 42
        Q135 50 142 65
        Q148 78 145 90
        Q138 95 130 100
        Q120 106 110 110
        Q105 115 100 118
        Q95 115 90 110
        Q80 106 70 100
        Q62 95 55 90
        Z
      " fill="url(#quillMain)" />
      {/* Softer wavy bumps on top edge */}
      <ellipse cx="70" cy="48" rx="12" ry="10" fill="#C49A4A" />
      <ellipse cx="88" cy="36" rx="11" ry="9" fill="#B8893E" />
      <ellipse cx="100" cy="32" rx="12" ry="10" fill="#C49A4A" />
      <ellipse cx="112" cy="36" rx="11" ry="9" fill="#B8893E" />
      <ellipse cx="130" cy="48" rx="12" ry="10" fill="#C49A4A" />
      <ellipse cx="60" cy="62" rx="10" ry="9" fill="#C49A4A" />
      <ellipse cx="140" cy="62" rx="10" ry="9" fill="#C49A4A" />

      {/* ── LAYER 4: Face features (on top of everything) ── */}
      <MoodFace mood={mood} />

      {/* Nose */}
      <ellipse cx="100" cy="138" rx="4" ry="3.5" fill="#A07050" />
      <ellipse cx="99" cy="137" rx="1.8" ry="1.2" fill="#B88868" />

      {/* Blush */}
      <ellipse cx="74" cy="138" rx="11" ry="7" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />
      <ellipse cx="126" cy="138" rx="11" ry="7" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />

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
          <circle cx="80" cy="120" r="12" fill="#3E2723" />
          <circle cx="120" cy="120" r="12" fill="#3E2723" />
          <circle cx="84" cy="116" r="5" fill="#fff" />
          <circle cx="124" cy="116" r="5" fill="#fff" />
          <circle cx="77" cy="123" r="2.5" fill="#fff" />
          <circle cx="117" cy="123" r="2.5" fill="#fff" />
          <path d="M92 146 Q100 156 108 146" fill="none" stroke="#7B5B40" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          <circle cx="80" cy="120" r="10" fill="#3E2723" />
          <circle cx="120" cy="120" r="10" fill="#3E2723" />
          <circle cx="83" cy="117" r="4" fill="#fff" />
          <circle cx="123" cy="117" r="4" fill="#fff" />
          <path d="M94 145 Q100 151 106 145" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          <circle cx="80" cy="122" r="11" fill="#3E2723" />
          <circle cx="120" cy="122" r="11" fill="#3E2723" />
          <circle cx="83" cy="119" r="4.5" fill="#fff" />
          <circle cx="123" cy="119" r="4.5" fill="#fff" />
          <circle cx="78" cy="124" r="2" fill="#fff" opacity="0.6" />
          <circle cx="118" cy="124" r="2" fill="#fff" opacity="0.6" />
          <path d="M70 112 Q76 109 88 113" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M130 112 Q124 109 112 113" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M94 149 Q100 144 106 149" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          <circle cx="80" cy="120" r="10" fill="#3E2723" />
          <circle cx="120" cy="120" r="10" fill="#3E2723" />
          <circle cx="83" cy="117" r="4" fill="#fff" />
          <circle cx="123" cy="117" r="4" fill="#fff" />
          <path d="M70 112 L88 115" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M130 112 L112 115" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M96 148 Q100 145 104 148" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="130" cy="136" rx="12" ry="8" fill="#F8B0B0" opacity="0.3" />
        </>
      )
    case 'sleepy':
      return (
        <>
          <path d="M70 120 Q80 127 90 120" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M110 120 Q120 127 130 120" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="100" cy="147" rx="3.5" ry="3" fill="none" stroke="#7B5B40" strokeWidth="1.5" />
        </>
      )
  }
}

function HappyExtras() {
  return (
    <>
      <text x="42" y="55" fontSize="12" fill="#FFD700" opacity="0.7">✦</text>
      <text x="152" y="60" fontSize="10" fill="#FFD700" opacity="0.6">✦</text>
      <text x="98" y="28" fontSize="9" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadExtras() {
  return (
    <>
      <ellipse cx="76" cy="133" rx="2" ry="3.5" fill="#90CAF9" opacity="0.6" />
      <ellipse cx="124" cy="134" rx="2" ry="3.5" fill="#90CAF9" opacity="0.5" />
    </>
  )
}

function AnnoyedExtras() {
  return (
    <g transform="translate(145, 88)" opacity="0.5">
      <circle cx="0" cy="0" r="4" fill="#E8C0C0" />
      <circle cx="6" cy="-4" r="3" fill="#E8C0C0" />
      <circle cx="10" cy="-7" r="2" fill="#E8C0C0" />
    </g>
  )
}

function SleepyExtras() {
  return (
    <>
      <text x="145" y="78" fontSize="14" fill="#9575CD" fontWeight="700" opacity="0.7">Z</text>
      <text x="154" y="62" fontSize="10" fill="#9575CD" fontWeight="700" opacity="0.5">z</text>
      <text x="160" y="50" fontSize="7" fill="#9575CD" fontWeight="700" opacity="0.35">z</text>
    </>
  )
}
