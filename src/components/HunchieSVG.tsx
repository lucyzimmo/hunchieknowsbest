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

      {/* ── ALL QUILLS: one single connected shape, soft spiky edges ── */}
      {/* Rounded spikes using Q curves instead of sharp L points */}
      <path d="
        M100 118
        Q95 115 90 110
        Q80 106 70 100
        Q62 95 55 90
        Q48 86 42 80
        Q35 72 30 82
        Q22 75 18 88
        Q10 82 10 100
        Q4 98 8 118
        Q2 116 5 135
        Q0 134 5 152
        Q2 155 10 168
        Q8 172 18 178
        Q15 184 28 186
        Q28 192 42 190
        Q45 196 58 192
        Q62 198 75 194
        Q80 200 90 196
        Q95 200 100 196
        Q105 200 110 196
        Q120 200 125 194
        Q138 198 142 192
        Q155 196 158 190
        Q172 192 172 186
        Q182 184 182 178
        Q192 172 190 168
        Q198 155 195 152
        Q200 134 195 135
        Q198 116 192 118
        Q196 98 190 100
        Q190 82 182 88
        Q178 75 170 82
        Q165 72 158 80
        Q152 86 145 90
        Q138 95 130 100
        Q120 106 110 110
        Q105 115 100 118
        Z
      " fill="url(#quillMain)" />

      {/* ── Body ── */}
      <ellipse cx="100" cy="128" rx="58" ry="50" fill="#FDDCAA" />

      {/* Belly */}
      <ellipse cx="100" cy="136" rx="42" ry="36" fill="#FFF2DA" />

      {/* Face/snout — reverse triangle down to nose */}
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

      {/* ── Forehead quills (ON TOP of body) — flat top, V down to nose ── */}
      <path d="
        M38 82
        L38 75 L162 75 L162 82
        Q158 88 150 94
        Q138 102 125 108
        Q115 116 108 122
        Q104 128 100 132
        Q96 128 92 122
        Q85 116 75 108
        Q62 102 50 94
        Q42 88 38 82
        Z
      " fill="url(#quillMain)" />

      {/* ── Face features ── */}
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
      <text x="98" y="18" fontSize="9" fill="#FFD700" opacity="0.5">✦</text>
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
