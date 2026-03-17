import type { HunchieMood } from '../types'
import styles from './HunchieSVG.module.css'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Hunchie hedgehog using the reference image with mood effect overlays */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <img src="/hunchie-base.png" alt="Hunchie" className={styles.baseImg} />

      {/* Mood overlay effects */}
      {mood === 'happy' && (
        <div className={styles.effects}>
          <span className={styles.sparkle} style={{ top: '5%', left: '15%' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '8%', right: '12%', animationDelay: '0.5s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '2%', left: '45%', animationDelay: '1s' }}>✦</span>
        </div>
      )}

      {mood === 'sad' && (
        <div className={styles.effects}>
          <span className={styles.tear} style={{ left: '35%', top: '55%' }}>💧</span>
          <span className={styles.tear} style={{ left: '58%', top: '56%', animationDelay: '0.6s' }}>💧</span>
          <div className={styles.sadTint} />
        </div>
      )}

      {mood === 'annoyed' && (
        <div className={styles.effects}>
          <span className={styles.huff} style={{ top: '15%', right: '8%' }}>💢</span>
          <div className={styles.annoyedTint} />
        </div>
      )}

      {mood === 'sleepy' && (
        <div className={styles.effects}>
          <span className={styles.zzz} style={{ top: '10%', right: '10%' }}>Z</span>
          <span className={styles.zzz} style={{ top: '2%', right: '4%', fontSize: '60%', animationDelay: '0.4s' }}>z</span>
          <span className={styles.zzz} style={{ top: '-3%', right: '0%', fontSize: '40%', animationDelay: '0.8s' }}>z</span>
          <div className={styles.sleepyTint} />
        </div>
      )}
    </div>
  )
}
