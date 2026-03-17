import { useEffect, useState, useCallback } from 'react'
import type { HunchieMood } from '../types'
import styles from './HunchieAvatar.module.css'

type IdleAnim = 'idle' | 'blink' | 'jump' | 'curl' | 'roll' | 'wiggle'

const IDLE_ANIMS: IdleAnim[] = ['blink', 'jump', 'curl', 'roll', 'wiggle']

interface HunchieAvatarProps {
  mood: HunchieMood
  size?: 'small' | 'medium' | 'large' | 'hero'
  className?: string
  animated?: boolean
}

// Mood face overlays positioned relative to hedgehog face area
const MOOD_FACES: Record<HunchieMood, { eyes: string; mouth: string; tint?: string }> = {
  happy:   { eyes: '◠ ◠', mouth: '◡', tint: undefined },
  calm:    { eyes: '– –', mouth: '—', tint: undefined },
  sad:     { eyes: '╥ ╥', mouth: '︵', tint: 'rgba(100, 140, 200, 0.12)' },
  annoyed: { eyes: '≖ ≖', mouth: '︵', tint: 'rgba(200, 80, 80, 0.12)' },
  sleepy:  { eyes: '– –', mouth: '○', tint: 'rgba(150, 130, 200, 0.1)' },
}

/** Hunchie hedgehog from design asset with mood-based face overlay. */
export function HunchieAvatar({ mood, size = 'medium', className = '', animated = false }: HunchieAvatarProps) {
  const [anim, setAnim] = useState<IdleAnim>('idle')

  const pickRandomAnim = useCallback(() => {
    const next = IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)]
    setAnim(next)
    const duration = next === 'roll' ? 1200 : next === 'curl' ? 2000 : 600
    setTimeout(() => setAnim('idle'), duration)
  }, [])

  useEffect(() => {
    if (!animated) return
    const schedule = () => {
      const delay = 2500 + Math.random() * 2500
      return setTimeout(() => {
        pickRandomAnim()
        timerId = schedule()
      }, delay)
    }
    let timerId = setTimeout(() => {
      pickRandomAnim()
      timerId = schedule()
    }, 1200)
    return () => clearTimeout(timerId)
  }, [animated, pickRandomAnim])

  const animClass = animated ? `${styles.breathing} ${styles[`anim_${anim}`]}` : ''
  const face = MOOD_FACES[mood]

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${animClass} ${className}`}
      role="img"
      aria-label={`Hunchie is ${mood}`}
    >
      <img
        src="/hedgehog.svg"
        alt=""
        className={styles.hedgehog}
      />
      {/* Mood tint overlay */}
      {face.tint && (
        <div className={styles.moodTint} style={{ background: face.tint }} />
      )}
      {/* Mood face overlay */}
      <div className={`${styles.moodFace} ${styles[`mood_${mood}`]}`}>
        <span className={styles.moodEyes}>{face.eyes}</span>
        <span className={styles.moodMouth}>{face.mouth}</span>
      </div>
      {/* Happy sparkles */}
      {mood === 'happy' && (
        <div className={styles.happySparkles}>
          <span className={styles.sparkle} style={{ top: '10%', left: '5%' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '15%', right: '8%' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '5%', left: '40%' }}>✦</span>
        </div>
      )}
      {/* Sad tears */}
      {mood === 'sad' && (
        <div className={styles.sadTears}>
          <span className={styles.tear} style={{ left: '32%' }}>💧</span>
          <span className={styles.tear} style={{ left: '58%', animationDelay: '0.5s' }}>💧</span>
        </div>
      )}
      {/* Annoyed steam */}
      {mood === 'annoyed' && (
        <div className={styles.annoyedSteam}>
          <span className={styles.steam}>💢</span>
        </div>
      )}
      {/* Sleepy Zzz */}
      {mood === 'sleepy' && (
        <div className={styles.sleepyZzz}>
          <span className={styles.zzz}>💤</span>
        </div>
      )}
      {animated && <div className={styles.shadow} />}
    </div>
  )
}
