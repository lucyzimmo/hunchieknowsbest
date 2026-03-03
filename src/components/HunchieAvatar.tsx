import type { HunchieMood } from '../types'
import styles from './HunchieAvatar.module.css'

interface HunchieAvatarProps {
  mood: HunchieMood
  size?: 'small' | 'medium' | 'large'
  className?: string
}

/** Placeholder avatars for Hunchie’s four reactions (happy, sad, annoyed, calm). */
export function HunchieAvatar({ mood, size = 'medium', className = '' }: HunchieAvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${styles[mood]} ${styles[size]} ${className}`}
      role="img"
      aria-label={`Hunchie is ${mood}`}
    >
      <div className={styles.face}>
        {/* Eyes */}
        <span className={styles.eye} />
        <span className={styles.eye} />
        {/* Mouth by mood */}
        <span className={styles.mouth} />
      </div>
    </div>
  )
}
