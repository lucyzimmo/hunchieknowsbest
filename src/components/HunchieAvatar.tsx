import type { HunchieMood } from '../types'
import styles from './HunchieAvatar.module.css'

interface HunchieAvatarProps {
  mood: HunchieMood
  size?: 'small' | 'medium' | 'large'
  className?: string
}

/** Hunchie hedgehog from design asset – no background. */
export function HunchieAvatar({ mood, size = 'medium', className = '' }: HunchieAvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      role="img"
      aria-label={`Hunchie is ${mood}`}
    >
      <img
        src="/hedgehog.svg"
        alt=""
        className={styles.hedgehog}
      />
    </div>
  )
}
