import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Cute hedgehog matching reference illustration — round body, dense spiky quills */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="100" cy="188" rx="55" ry="8" fill="#D4A870" opacity="0.3" />

      {/* ── QUILL DOME: dense spiky mass covering back half ── */}
      {/* Base dome shape */}
      <ellipse cx="95" cy="100" rx="85" ry="80" fill="#C4A060" />
      {/* Darker inner layer */}
      <ellipse cx="90" cy="98" rx="78" ry="74" fill="#A88040" />

      {/* Dense spike lines radiating outward — like the reference */}
      {/* Top spikes */}
      {[
        'M70 28 L74 42', 'M80 22 L82 38', 'M90 18 L91 35', 'M100 16 L100 34',
        'M110 18 L109 35', 'M120 22 L118 38', 'M130 28 L126 42',
        'M62 36 L67 48', 'M138 36 L133 48',
      ].map((d, i) => <path key={`t${i}`} d={d} stroke="#5A4028" strokeWidth="2" strokeLinecap="round" />)}

      {/* Left side spikes */}
      {[
        'M50 48 L58 58', 'M38 60 L48 68', 'M28 74 L40 80', 'M22 90 L36 92',
        'M20 106 L34 105', 'M22 122 L36 118', 'M28 136 L40 130',
        'M38 148 L48 140', 'M50 158 L58 148',
      ].map((d, i) => <path key={`l${i}`} d={d} stroke="#5A4028" strokeWidth="2" strokeLinecap="round" />)}

      {/* Right side spikes */}
      {[
        'M150 48 L142 58', 'M162 60 L152 68', 'M170 76 L158 82',
        'M174 92 L160 92', 'M172 108 L158 106', 'M168 124 L156 118',
        'M160 138 L150 130', 'M152 150 L144 142',
      ].map((d, i) => <path key={`r${i}`} d={d} stroke="#5A4028" strokeWidth="2" strokeLinecap="round" />)}

      {/* Bottom spikes */}
      {[
        'M60 166 L66 156', 'M75 172 L78 160', 'M90 174 L90 162',
        'M105 174 L104 162', 'M118 172 L116 160', 'M132 166 L128 156',
      ].map((d, i) => <path key={`b${i}`} d={d} stroke="#5A4028" strokeWidth="2" strokeLinecap="round" />)}

      {/* Lighter quill streaks for depth */}
      {[
        'M75 30 L78 46', 'M95 22 L95 40', 'M115 24 L113 42', 'M135 34 L130 48',
        'M44 56 L54 64', 'M30 80 L44 84', 'M26 100 L40 98', 'M30 130 L44 124',
        'M155 56 L146 64', 'M166 82 L154 84', 'M168 100 L154 98',
        'M65 170 L70 158', 'M100 176 L100 164', 'M128 168 L124 158',
      ].map((d, i) => <path key={`h${i}`} d={d} stroke="#E8D4B0" strokeWidth="1.5" strokeLinecap="round" />)}

      {/* ── FACE: cream/white front area ── */}
      <path d="
        M58 82
        Q55 100 58 120
        Q62 145 72 158
        Q82 172 100 175
        Q118 172 128 158
        Q138 145 142 120
        Q145 100 142 82
        Q135 70 120 64
        Q108 58 100 58
        Q92 58 80 64
        Q65 70 58 82
        Z
      " fill="#FFF5E8" />

      {/* Slightly darker snout/lower face */}
      <ellipse cx="100" cy="140" rx="24" ry="18" fill="#F0D8C0" opacity="0.5" />

      {/* ── EARS: round, poking out from quills ── */}
      <ellipse cx="62" cy="72" rx="12" ry="14" fill="#E8D0B8" stroke="#C8A888" strokeWidth="1" />
      <ellipse cx="62" cy="72" rx="7" ry="9" fill="#E8A898" />
      <ellipse cx="138" cy="72" rx="12" ry="14" fill="#E8D0B8" stroke="#C8A888" strokeWidth="1" />
      <ellipse cx="138" cy="72" rx="7" ry="9" fill="#E8A898" />

      {/* ── FEET: small brown paws ── */}
      <ellipse cx="76" cy="178" rx="10" ry="6" fill="#7B5B40" />
      <ellipse cx="124" cy="178" rx="10" ry="6" fill="#7B5B40" />

      {/* ── FACE FEATURES ── */}
      <MoodFace mood={mood} />

      {/* Nose */}
      <ellipse cx="100" cy="136" rx="5" ry="4.5" fill="#4A3020" />
      <ellipse cx="99" cy="135" rx="2" ry="1.2" fill="#6B4838" />

      {/* Blush cheeks */}
      <ellipse cx="78" cy="132" rx="12" ry="8" fill="#E8A898" opacity="0.4" />
      <ellipse cx="122" cy="132" rx="12" ry="8" fill="#E8A898" opacity="0.4" />

      {/* Mood effects */}
      {mood === 'happy' && <HappyEffects />}
      {mood === 'sad' && <SadEffects />}
      {mood === 'annoyed' && <AnnoyedEffects />}
      {mood === 'sleepy' && <SleepyEffects />}
    </svg>
  )
}

function MoodFace({ mood }: { mood: HunchieMood }) {
  switch (mood) {
    case 'happy':
      return (
        <>
          {/* Big shiny eyes */}
          <circle cx="84" cy="114" r="12" fill="#1A1210" />
          <circle cx="116" cy="114" r="12" fill="#1A1210" />
          <circle cx="88" cy="110" r="5" fill="#fff" />
          <circle cx="120" cy="110" r="5" fill="#fff" />
          <circle cx="82" cy="116" r="2.5" fill="#fff" opacity="0.6" />
          <circle cx="114" cy="116" r="2.5" fill="#fff" opacity="0.6" />
          {/* Smile */}
          <path d="M92 146 Q100 155 108 146" fill="none" stroke="#4A3020" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          <circle cx="84" cy="114" r="10" fill="#1A1210" />
          <circle cx="116" cy="114" r="10" fill="#1A1210" />
          <circle cx="87" cy="111" r="4" fill="#fff" />
          <circle cx="119" cy="111" r="4" fill="#fff" />
          <path d="M94 144 Q100 150 106 144" fill="none" stroke="#4A3020" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          <circle cx="84" cy="116" r="11" fill="#1A1210" />
          <circle cx="116" cy="116" r="11" fill="#1A1210" />
          <circle cx="87" cy="113" r="4.5" fill="#fff" />
          <circle cx="119" cy="113" r="4.5" fill="#fff" />
          {/* Worried brows */}
          <path d="M74 104 Q80 101 92 105" fill="none" stroke="#8B7060" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M126 104 Q120 101 108 105" fill="none" stroke="#8B7060" strokeWidth="1.2" strokeLinecap="round" />
          {/* Frown */}
          <path d="M94 148 Q100 143 106 148" fill="none" stroke="#4A3020" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          <circle cx="84" cy="114" r="10" fill="#1A1210" />
          <circle cx="116" cy="114" r="10" fill="#1A1210" />
          <circle cx="87" cy="112" r="3.5" fill="#fff" />
          <circle cx="119" cy="112" r="3.5" fill="#fff" />
          {/* Pouty brows */}
          <path d="M74 104 L90 108" fill="none" stroke="#8B7060" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M126 104 L110 108" fill="none" stroke="#8B7060" strokeWidth="1.3" strokeLinecap="round" />
          {/* Pout */}
          <path d="M96 147 Q100 144 104 147" fill="none" stroke="#4A3020" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'sleepy':
      return (
        <>
          {/* Closed eyes */}
          <path d="M74 114 Q84 121 94 114" fill="none" stroke="#1A1210" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M106 114 Q116 121 126 114" fill="none" stroke="#1A1210" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tiny mouth */}
          <ellipse cx="100" cy="146" rx="3.5" ry="3" fill="none" stroke="#4A3020" strokeWidth="1.5" />
        </>
      )
  }
}

function HappyEffects() {
  return (
    <>
      <text x="148" y="52" fontSize="10" fill="#FFD700" opacity="0.7">✦</text>
      <text x="42" y="48" fontSize="8" fill="#FFD700" opacity="0.6">✦</text>
      <text x="100" y="10" fontSize="7" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadEffects() {
  return (
    <>
      <ellipse cx="80" cy="126" rx="1.5" ry="3.5" fill="#90CAF9" opacity="0.6" />
      <ellipse cx="120" cy="127" rx="1.5" ry="3.5" fill="#90CAF9" opacity="0.5" />
    </>
  )
}

function AnnoyedEffects() {
  return (
    <g transform="translate(140, 78)" opacity="0.5">
      <circle cx="0" cy="0" r="3.5" fill="#E8C0C0" />
      <circle cx="5" cy="-3.5" r="2.5" fill="#E8C0C0" />
      <circle cx="9" cy="-6" r="1.5" fill="#E8C0C0" />
    </g>
  )
}

function SleepyEffects() {
  return (
    <>
      <text x="142" y="62" fontSize="13" fill="#9575CD" fontWeight="700" opacity="0.7">Z</text>
      <text x="150" y="48" fontSize="9" fill="#9575CD" fontWeight="700" opacity="0.5">z</text>
      <text x="156" y="38" fontSize="6" fill="#9575CD" fontWeight="700" opacity="0.35">z</text>
    </>
  )
}
