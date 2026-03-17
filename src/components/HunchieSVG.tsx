import type { HunchieMood } from '../types'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Custom cute chibi Hunchie hedgehog SVG with mood-based face */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Fluffy quills growing from forehead down the back ── */}
      {/* Base quill mass — continuous with body */}
      <path d="M60 110 Q40 100 35 80 Q32 60 50 50 Q55 30 75 28 Q85 15 100 12 Q115 15 125 28 Q145 30 150 50 Q168 60 165 80 Q160 100 140 110" fill="#C49A4A" />
      {/* Fluffy bumps on top */}
      <circle cx="52" cy="72" r="15" fill="#B8893E" />
      <circle cx="66" cy="48" r="16" fill="#C9A050" />
      <circle cx="85" cy="32" r="17" fill="#B8893E" />
      <circle cx="100" cy="26" r="18" fill="#C49A4A" />
      <circle cx="115" cy="32" r="17" fill="#B8893E" />
      <circle cx="134" cy="48" r="16" fill="#C9A050" />
      <circle cx="148" cy="72" r="15" fill="#B8893E" />
      {/* Inner fluff fill for seamlessness */}
      <circle cx="75" cy="42" r="12" fill="#C49A4A" />
      <circle cx="125" cy="42" r="12" fill="#C49A4A" />
      <circle cx="58" cy="62" r="11" fill="#C49A4A" />
      <circle cx="142" cy="62" r="11" fill="#C49A4A" />
      <circle cx="100" cy="22" r="10" fill="#C49A4A" />
      {/* Soft highlights */}
      <circle cx="82" cy="30" r="6" fill="#D8B060" opacity="0.4" />
      <circle cx="118" cy="30" r="6" fill="#D8B060" opacity="0.4" />
      <circle cx="100" cy="20" r="5" fill="#D8B060" opacity="0.3" />

      {/* ── Body (pear/teardrop shape with pointy snout) ── */}
      <path d="M38 110 Q35 135 45 160 Q55 180 78 185 Q90 188 100 188 Q110 188 122 185 Q145 180 155 160 Q165 135 162 110 Q158 90 140 82 Q120 75 100 75 Q80 75 60 82 Q42 90 38 110 Z" fill="#FDDCAA" />

      {/* Belly */}
      <ellipse cx="100" cy="145" rx="40" ry="36" fill="#FFF2DA" />

      {/* ── Pointy mouse-like snout ── */}
      <path d="M88 130 Q100 155 112 130 Q108 142 100 148 Q92 142 88 130 Z" fill="#FDDCAA" />

      {/* Left ear */}
      <ellipse cx="60" cy="85" rx="11" ry="13" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="60" cy="85" rx="6" ry="8" fill="#F8B8A8" />

      {/* Right ear */}
      <ellipse cx="140" cy="85" rx="11" ry="13" fill="#FDDCAA" stroke="#F0C888" strokeWidth="1" />
      <ellipse cx="140" cy="85" rx="6" ry="8" fill="#F8B8A8" />

      {/* Left arm (stubby) */}
      <ellipse cx="48" cy="145" rx="11" ry="7" fill="#FDDCAA" transform="rotate(-15 48 145)" />

      {/* Right arm */}
      <ellipse cx="152" cy="145" rx="11" ry="7" fill="#FDDCAA" transform="rotate(15 152 145)" />

      {/* Left foot */}
      <ellipse cx="80" cy="186" rx="13" ry="8" fill="#F0C888" />

      {/* Right foot */}
      <ellipse cx="120" cy="186" rx="13" ry="8" fill="#F0C888" />

      {/* ── MOOD-BASED FACE ── */}
      <MoodFace mood={mood} />

      {/* Tiny nose at tip of snout */}
      <ellipse cx="100" cy="143" rx="3.5" ry="3" fill="#A07050" />
      <ellipse cx="99" cy="142" rx="1.5" ry="1" fill="#B88868" />

      {/* Blush cheeks */}
      <ellipse cx="74" cy="132" rx="10" ry="6" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />
      <ellipse cx="126" cy="132" rx="10" ry="6" fill={mood === 'annoyed' ? '#F8B0B0' : '#FBCCC4'} opacity="0.35" />

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
          <circle cx="80" cy="118" r="11" fill="#3E2723" />
          <circle cx="120" cy="118" r="11" fill="#3E2723" />
          <circle cx="84" cy="114" r="4.5" fill="#fff" />
          <circle cx="124" cy="114" r="4.5" fill="#fff" />
          <circle cx="77" cy="121" r="2" fill="#fff" />
          <circle cx="117" cy="121" r="2" fill="#fff" />
          {/* Wide smile */}
          <path d="M93 150 Q100 157 107 150" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'calm':
      return (
        <>
          {/* Relaxed eyes */}
          <circle cx="80" cy="118" r="9" fill="#3E2723" />
          <circle cx="120" cy="118" r="9" fill="#3E2723" />
          <circle cx="83" cy="115" r="3.5" fill="#fff" />
          <circle cx="123" cy="115" r="3.5" fill="#fff" />
          {/* Gentle smile */}
          <path d="M95 149 Q100 153 105 149" fill="none" stroke="#7B5B40" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'sad':
      return (
        <>
          {/* Big watery eyes */}
          <circle cx="80" cy="120" r="10" fill="#3E2723" />
          <circle cx="120" cy="120" r="10" fill="#3E2723" />
          <circle cx="83" cy="117" r="4" fill="#fff" />
          <circle cx="123" cy="117" r="4" fill="#fff" />
          <circle cx="78" cy="122" r="1.8" fill="#fff" opacity="0.5" />
          <circle cx="118" cy="122" r="1.8" fill="#fff" opacity="0.5" />
          {/* Thin worried brows */}
          <path d="M70 108 Q76 106 88 110" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M130 108 Q124 106 112 110" fill="none" stroke="#9E8070" strokeWidth="1.2" strokeLinecap="round" />
          {/* Small frown */}
          <path d="M95 152 Q100 148 105 152" fill="none" stroke="#7B5B40" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'annoyed':
      return (
        <>
          {/* Pouty eyes — still big and round but with cute pout brows */}
          <circle cx="80" cy="118" r="10" fill="#3E2723" />
          <circle cx="120" cy="118" r="10" fill="#3E2723" />
          <circle cx="83" cy="115" r="4" fill="#fff" />
          <circle cx="123" cy="115" r="4" fill="#fff" />
          {/* Pouty thin brows — gentle inward tilt, not aggressive */}
          <path d="M70 108 L86 112" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M130 108 L114 112" fill="none" stroke="#9E8070" strokeWidth="1.3" strokeLinecap="round" />
          {/* Tiny pout — like a little "hmph" */}
          <path d="M96 151 Q100 148 104 151" fill="none" stroke="#7B5B40" strokeWidth="1.8" strokeLinecap="round" />
          {/* Puffed cheek (one side, cute) */}
          <ellipse cx="130" cy="132" rx="12" ry="8" fill="#F8B0B0" opacity="0.3" />
        </>
      )
    case 'sleepy':
      return (
        <>
          {/* Closed curved eyes */}
          <path d="M70 118 Q80 125 90 118" fill="none" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M110 118 Q120 125 130 118" fill="none" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round" />
          {/* Tiny O mouth */}
          <ellipse cx="100" cy="150" rx="3" ry="2.5" fill="none" stroke="#7B5B40" strokeWidth="1.3" />
        </>
      )
  }
}

function HappyExtras() {
  return (
    <>
      <text x="42" y="52" fontSize="11" fill="#FFD700" opacity="0.7">✦</text>
      <text x="152" y="58" fontSize="9" fill="#FFD700" opacity="0.6">✦</text>
      <text x="98" y="16" fontSize="8" fill="#FFD700" opacity="0.5">✦</text>
    </>
  )
}

function SadExtras() {
  return (
    <>
      <ellipse cx="76" cy="130" rx="1.5" ry="3" fill="#90CAF9" opacity="0.5" />
      <ellipse cx="124" cy="131" rx="1.5" ry="3" fill="#90CAF9" opacity="0.45" />
    </>
  )
}

function AnnoyedExtras() {
  return (
    <>
      {/* Small cute huff cloud instead of anger mark */}
      <g transform="translate(145, 90)" opacity="0.5">
        <circle cx="0" cy="0" r="4" fill="#E8C0C0" />
        <circle cx="6" cy="-4" r="3" fill="#E8C0C0" />
        <circle cx="10" cy="-7" r="2" fill="#E8C0C0" />
      </g>
    </>
  )
}

function SleepyExtras() {
  return (
    <>
      <text x="142" y="78" fontSize="13" fill="#9575CD" fontWeight="700" opacity="0.65">Z</text>
      <text x="151" y="62" fontSize="9" fill="#9575CD" fontWeight="700" opacity="0.45">z</text>
      <text x="157" y="50" fontSize="6" fill="#9575CD" fontWeight="700" opacity="0.3">z</text>
    </>
  )
}
