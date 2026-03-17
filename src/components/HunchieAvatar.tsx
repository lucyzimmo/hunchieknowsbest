import { useEffect, useState, useCallback } from 'react'
import type { HunchieMood } from '../types'
import { HunchieSVG } from './HunchieSVG'
import styles from './HunchieAvatar.module.css'

type IdleAnim = 'idle' | 'blink' | 'jump' | 'curl' | 'roll' | 'wiggle'

const IDLE_ANIMS: IdleAnim[] = ['blink', 'jump', 'curl', 'roll', 'wiggle']

const SIZE_PX: Record<string, number> = { small: 64, medium: 120, large: 160, hero: 240 }

interface HunchieAvatarProps {
  mood: HunchieMood
  size?: 'small' | 'medium' | 'large' | 'hero'
  className?: string
  animated?: boolean
}

/** Hunchie hedgehog with mood-based expressions */
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

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${animClass} ${className}`}
      role="img"
      aria-label={`Hunchie is ${mood}`}
    >
      <HunchieSVG mood={mood} size={SIZE_PX[size] ?? 120} />
      {animated && <div className={styles.shadow} />}
    </div>
  )
}
