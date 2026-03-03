import styles from './DemoBanner.module.css'

interface DemoBannerProps {
  deviceName: string | null
}

export function DemoBanner({ deviceName }: DemoBannerProps) {
  const isConnected = deviceName !== null && !deviceName.toLowerCase().includes('demo')

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <span className={styles.badge}>Demo</span>
        <span className={styles.status}>
          <span className={`${styles.dot} ${isConnected ? styles.connected : styles.disconnected}`} />
          {isConnected ? `Connected to ${deviceName}` : 'No Hunchie device linked'}
        </span>
      </div>
    </div>
  )
}
