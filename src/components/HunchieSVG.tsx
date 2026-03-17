import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Custom cute Hunchie hedgehog SVG with mood-based face */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Quills/spikes (brown, behind body) */}
      <ellipse cx="100" cy="70" rx="72" ry="55" fill="#8B6914" />
      {/* Individual quill points */}
      <path d="M40 70 L28 40 L50 60 Z" fill="#7B5B10" />
      <path d="M55 45 L48 15 L65 40 Z" fill="#7B5B10" />
      <path d="M75 30 L75 2 L85 28 Z" fill="#7B5B10" />
      <path d="M95 25 L100 0 L108 24 Z" fill="#7B5B10" />
      <path d="M118 28 L125 4 L130 30 Z" fill="#7B5B10" />
      <path d="M140 40 L152 14 L148 42 Z" fill="#7B5B10" />
      <path d="M155 58 L172 35 L160 60 Z" fill="#7B5B10" />
      <path d="M163 78 L182 62 L166 82 Z" fill="#7B5B10" />
      <path d="M35 85 L18 72 L38 82 Z" fill="#7B5B10" />
      <path d="M30 100 L12 95 L32 98 Z" fill="#7B5B10" />
      <path d="M168 95 L188 88 L170 98 Z" fill="#7B5B10" />

      {/* Body (warm beige/tan) */}
      <ellipse cx="100" cy="115" rx="65" ry="55" fill="#F5D5A0" />

      {/* Belly (lighter) */}
      <ellipse cx="100" cy="125" rx="42" ry="38" fill="#FFF0D4" />

      {/* Left ear */}
      <ellipse cx="62" cy="68" rx="14" ry="16" fill="#F5D5A0" stroke="#E8C088" strokeWidth="1.5" />
      <ellipse cx="62" cy="68" rx="8" ry="10" fill="#F0B8A8" />

      {/* Right ear */}
      <ellipse cx="138" cy="68" rx="14" ry="16" fill="#F5D5A0" stroke="#E8C088" strokeWidth="1.5" />
      <ellipse cx="138" cy="68" rx="8" ry="10" fill="#F0B8A8" />

      {/* Left arm */}
      <ellipse cx="48" cy="130" rx="14" ry="10" fill="#F5D5A0" transform="rotate(-20 48 130)" />

      {/* Right arm */}
      <ellipse cx="152" cy="130" rx="14" ry="10" fill="#F5D5A0" transform="rotate(20 152 130)" />

      {/* Left foot */}
      <ellipse cx="75" cy="168" rx="16" ry="10" fill="#E8C088" />

      {/* Right foot */}
      <ellipse cx="125" cy="168" rx="16" ry="10" fill="#E8C088" />

      {/* Nose */}
      <ellipse cx="100" cy="115" rx="6" ry="5" fill="#8B6048" />
      {/* Nose highlight */}
      <ellipse cx="98" cy="113" rx="2.5" ry="2" fill="#A07058" />

      {/* ── MOOD-BASED EYES & MOUTH ── */}
      <MoodFace mood={mood} />

      {/* Blush cheeks (always present, subtler when annoyed) */}
      <ellipse cx="72" cy="118" rx="10" ry="7" fill={mood === 'annoyed' ? '#F0A0A0' : '#F8C0B8'} opacity={mood === 'annoyed' ? 0.5 : 0.4} />
      <ellipse cx="128" cy="118" rx="10" ry="7" fill={mood === 'annoyed' ? '#F0A0A0' : '#F8C0B8'} opacity={mood === 'annoyed' ? 0.5 : 0.4} />

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
          {/* Happy eyes — big, round, sparkly */}
          <circle cx="82" cy="100" r="8" fill="#3E2723" />
          <circle cx="118" cy="100" r="8" fill="#3E2723" />
          <circle cx="85" cy="97" r="3" fill="#fff" />
          <circle cx="121" cy="97" r="3" fill="#fff" />
          <circle cx="80" cy="102" r="1.5" fill="#fff" />
          <circle cx="116" cy="102" r="1.5" fill="#fff" />
          {/* Happy mouth — big smile */}
          <path d="M88 125 Q100 140 112 125" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          {/* Calm eyes — relaxed, normal */}
          <circle cx="82" cy="100" r="6" fill="#3E2723" />
          <circle cx="118" cy="100" r="6" fill="#3E2723" />
          <circle cx="84" cy="98" r="2.5" fill="#fff" />
          <circle cx="120" cy="98" r="2.5" fill="#fff" />
          {/* Calm mouth — small smile */}
          <path d="M92 123 Q100 130 108 123" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          {/* Sad eyes — droopy, watery */}
          <circle cx="82" cy="102" r="7" fill="#3E2723" />
          <circle cx="118" cy="102" r="7" fill="#3E2723" />
          <circle cx="84" cy="100" r="2.5" fill="#fff" />
          <circle cx="120" cy="100" r="2.5" fill="#fff" />
          {/* Sad eyebrows — angled up in middle */}
          <path d="M72 90 Q78 86 90 92" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
          <path d="M128 90 Q122 86 110 92" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
          {/* Sad mouth — frown */}
          <path d="M90 130 Q100 122 110 130" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          {/* Annoyed eyes — narrow, angry */}
          <ellipse cx="82" cy="100" rx="8" ry="5" fill="#3E2723" />
          <ellipse cx="118" cy="100" rx="8" ry="5" fill="#3E2723" />
          <circle cx="84" cy="99" r="2" fill="#fff" />
          <circle cx="120" cy="99" r="2" fill="#fff" />
          {/* Angry eyebrows — V-shaped */}
          <path d="M70 88 L90 95" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M130 88 L110 95" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          {/* Annoyed mouth — tight frown */}
          <path d="M88 128 Q100 120 112 128" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'sleepy':
      return (
        <>
          {/* Sleepy eyes — closed, curved lines */}
          <path d="M74 100 Q82 106 90 100" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M110 100 Q118 106 126 100" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sleepy mouth — small O */}
          <ellipse cx="100" cy="126" rx="5" ry="4" fill="none" stroke="#5D4037" strokeWidth="2" />
        </>
      )
  }
}

function HappyExtras() {
  return (
    <>
      {/* Sparkles around head */}
      <text x="38" y="45" fontSize="14" fill="#FFD700" opacity="0.7">✦</text>
      <text x="158" y="50" fontSize="12" fill="#FFD700" opacity="0.6">✦</text>
      <text x="100" y="18" fontSize="10" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadExtras() {
  return (
    <>
      {/* Tear drops */}
      <ellipse cx="78" cy="112" rx="2" ry="3" fill="#90CAF9" opacity="0.7" />
      <ellipse cx="124" cy="114" rx="2" ry="3" fill="#90CAF9" opacity="0.6" />
    </>
  )
}

function AnnoyedExtras() {
  return (
    <>
      {/* Anger symbol */}
      <g transform="translate(148, 55)">
        <path d="M0 4 L8 0 M4 0 L0 8 M8 4 L0 8 M4 8 L8 0" stroke="#E53935" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </>
  )
}

function SleepyExtras() {
  return (
    <>
      {/* Zzz floating */}
      <text x="148" y="60" fontSize="16" fill="#9575CD" fontWeight="700" opacity="0.8">Z</text>
      <text x="158" y="45" fontSize="12" fill="#9575CD" fontWeight="700" opacity="0.6">z</text>
      <text x="165" y="35" fontSize="9" fill="#9575CD" fontWeight="700" opacity="0.4">z</text>
    </>
  )
}
