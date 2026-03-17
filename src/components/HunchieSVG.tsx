import type { HunchieMood } from '../types'
import styles from './HunchieSVG.module.css'

interface Props {
  mood: HunchieMood
  size?: number
}

/** Hunchie hedgehog using reference image with mood effect overlays */
export function HunchieSVG({ mood, size = 120 }: Props) {
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <img src="/hunchie-base.png" alt="Hunchie" className={styles.baseImg} />

      {mood === 'happy' && (
        <div className={styles.effects}>
          <span className={styles.sparkle} style={{ top: '15%', left: '20%', fontSize: 14 }}>✦</span>
          <span className={styles.sparkle} style={{ top: '12%', right: '18%', fontSize: 12, animationDelay: '0.4s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '8%', left: '42%', fontSize: 10, animationDelay: '0.9s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '22%', left: '12%', fontSize: 8, animationDelay: '1.3s' }}>✦</span>
          <span className={styles.heart} style={{ top: '28%', left: '18%', fontSize: 10, animationDelay: '0.3s' }}>💕</span>
          <span className={styles.heart} style={{ top: '25%', right: '16%', fontSize: 10, animationDelay: '1s' }}>💕</span>
          <div className={styles.happyGlow} />
        </div>
      )}

      {mood === 'sad' && (
        <div className={styles.effects}>
          <span className={styles.tear} style={{ left: '36%', top: '55%', fontSize: 12 }}>💧</span>
          <span className={styles.tear} style={{ left: '56%', top: '56%', fontSize: 12, animationDelay: '0.5s' }}>💧</span>
          <span className={styles.tear} style={{ left: '44%', top: '53%', fontSize: 9, animationDelay: '1s' }}>💧</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={styles.rainDrop}
              style={{
                left: `${25 + Math.random() * 50}%`,
                top: `${15 + Math.random() * 25}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
          <div className={styles.sadTint} />
        </div>
      )}

      {mood === 'annoyed' && (
        <div className={styles.effects}>
          <span className={styles.huff} style={{ top: '18%', right: '15%', fontSize: 18 }}>💢</span>
          <span className={styles.angerMark} style={{ top: '12%', right: '25%', fontSize: 12, animationDelay: '0.5s' }}>💢</span>
          <span className={styles.huff} style={{ top: '28%', right: '12%', fontSize: 10, animationDelay: '0.3s' }}>💨</span>
          <div className={styles.annoyedTint} />
        </div>
      )}

      {mood === 'sleepy' && (
        <div className={styles.effects}>
          <span className={styles.zzz} style={{ top: '18%', right: '16%', fontSize: 18 }}>Z</span>
          <span className={styles.zzz} style={{ top: '10%', right: '10%', fontSize: 13, animationDelay: '0.5s' }}>z</span>
          <span className={styles.zzz} style={{ top: '5%', right: '6%', fontSize: 9, animationDelay: '1s' }}>z</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={styles.sleepBubble}
              style={{
                right: `${12 + i * 5}%`,
                top: `${22 + i * 5}%`,
                animationDelay: `${i * 0.6}s`,
                width: 5 + i * 2,
                height: 5 + i * 2,
              }}
            />
          ))}
          <div className={styles.sleepyTint} />
        </div>
      )}
    </div>
  )
}
