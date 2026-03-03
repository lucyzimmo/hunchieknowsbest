import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import styles from './Onboarding.module.css'

export function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [deviceName, setDeviceName] = useState('Hunchie')
  const [connecting, setConnecting] = useState(false)
  const [bluetoothError, setBluetoothError] = useState<string | null>(null)
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  const handleNameNext = () => {
    if (name.trim()) setStep(2)
  }

  const handleConnect = async () => {
    setBluetoothError(null)
    setConnecting(true)
    setConnectionAttempted(true)
    try {
      if (navigator.bluetooth) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: 'Hunchie' }],
          optionalServices: ['battery_service'],
        })
        setDeviceName(device.name || 'Hunchie')
      } else {
        setBluetoothError('Bluetooth is not available in this browser. You can still use demo mode.')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Connection failed'
      if (!msg.includes('canceled') && !msg.includes('Cancelled')) {
        setBluetoothError('Connection was cancelled or failed. You can still use the app in demo mode.')
      }
    } finally {
      setConnecting(false)
    }
  }

  const handleFinish = () => {
    completeOnboarding(name.trim(), deviceName)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <HunchieAvatar mood="calm" size="large" className={styles.avatar} />
        <h1 className={styles.title}>Welcome to Hunchie</h1>
        <p className={styles.subtitle}>
          Your gentle posture buddy. Let’s get you set up.
        </p>

        {step === 1 && (
          <>
            <label className={styles.label} htmlFor="name">
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
            />
            <Button variant="pink" onClick={handleNameNext} disabled={!name.trim()}>
              Next
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.stepTitle}>Connect your Hunchie</h2>
            <p className={styles.stepDesc}>
              Turn on your Hunchie device and keep it nearby. We’ll look for it via Bluetooth.
            </p>
            {bluetoothError && (
              <p className={styles.error}>{bluetoothError}</p>
            )}
            <Button
              variant="teal"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Searching…' : 'Find Hunchie'}
            </Button>
            {connectionAttempted && (
              <Button variant="lavender" onClick={handleFinish} className={styles.finishBtn}>
                Continue with setup
              </Button>
            )}
            <button
              type="button"
              className={styles.skip}
              onClick={handleFinish}
              disabled={connecting}
            >
              Skip for now (demo mode)
            </button>
          </>
        )}
      </div>
    </div>
  )
}
