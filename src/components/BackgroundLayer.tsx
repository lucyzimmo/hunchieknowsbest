import { useApp } from '../context/AppContext'
import type { BackgroundChoice } from '../types'
import styles from './BackgroundLayer.module.css'

const BG_IMAGES: Record<BackgroundChoice, string> = {
  clouds: '/bg-clouds.jpg',
  sky: '/bg-sky.jpg',
  stars: '/bg-stars.jpg',
  pastel: '/bg-pastel.jpg',
}

const BG_KEYS: BackgroundChoice[] = ['clouds', 'sky', 'stars', 'pastel']

export function BackgroundLayer() {
  const { settings } = useApp()
  const active = settings.background ?? 'clouds'

  return (
    <>
      {BG_KEYS.map(bg => (
        <div
          key={bg}
          className={`${styles.layer} ${active === bg ? styles.visible : ''}`}
          style={{ backgroundImage: `url(${BG_IMAGES[bg]})` }}
          aria-hidden
        />
      ))}
    </>
  )
}
