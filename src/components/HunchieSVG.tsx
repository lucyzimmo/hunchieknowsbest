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
          <span className={styles.sparkle} style={{ top: '2%', left: '12%' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '6%', right: '10%', animationDelay: '0.4s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '0%', left: '42%', animationDelay: '0.8s' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '12%', left: '4%', animationDelay: '1.2s', fontSize: 10 }}>✦</span>
          <span className={styles.sparkle} style={{ top: '10%', right: '2%', animationDelay: '1.6s', fontSize: 10 }}>✦</span>
          <span className={styles.heart} style={{ top: '20%', left: '8%', animationDelay: '0.3s' }}>💕</span>
          <span className={styles.heart} style={{ top: '18%', right: '6%', animationDelay: '1s' }}>💕</span>
          <div className={styles.happyGlow} />
        </div>
      )}

      {mood === 'sad' && (
        <div className={styles.effects}>
          <span className={styles.tear} style={{ left: '33%', top: '50%' }}>💧</span>
          <span className={styles.tear} style={{ left: '58%', top: '52%', animationDelay: '0.5s' }}>💧</span>
          <span className={styles.tear} style={{ left: '40%', top: '48%', animationDelay: '1s', fontSize: 10 }}>💧</span>
          {/* Rain drops */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.rainDrop}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
          <div className={styles.sadTint} />
        </div>
      )}

      {mood === 'annoyed' && (
        <div className={styles.effects}>
          <span className={styles.huff} style={{ top: '10%', right: '5%' }}>💢</span>
          <span className={styles.angerMark} style={{ top: '5%', right: '18%', animationDelay: '0.5s' }}>💢</span>
          <span className={styles.huff} style={{ top: '18%', right: '0%', fontSize: 12, animationDelay: '0.3s' }}>💨</span>
          <div className={styles.annoyedTint} />
        </div>
      )}

      {mood === 'sleepy' && (
        <div className={styles.effects}>
          <span className={styles.zzz} style={{ top: '8%', right: '8%' }}>Z</span>
          <span className={styles.zzz} style={{ top: '0%', right: '2%', fontSize: 14, animationDelay: '0.5s' }}>z</span>
          <span className={styles.zzz} style={{ top: '-5%', right: '-2%', fontSize: 10, animationDelay: '1s' }}>z</span>
          {/* Sleep bubbles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={styles.sleepBubble}
              style={{
                right: `${5 + i * 6}%`,
                top: `${15 + i * 4}%`,
                animationDelay: `${i * 0.5}s`,
                width: 6 + i * 2,
                height: 6 + i * 2,
              }}
            />
          ))}
          <div className={styles.sleepyTint} />
        </div>
      )}
    </div>
  )
}
