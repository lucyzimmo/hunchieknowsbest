import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import styles from './Onboarding.module.css'

type Step = 1 | 2 | 3
type PairState = 'idle' | 'waiting' | 'pairing' | 'success' | 'error'

export function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding, startSession } = useApp()
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [deviceName, setDeviceName] = useState('Hunchie')
  const [pairState, setPairState] = useState<PairState>('waiting')
  const [pairProgress, setPairProgress] = useState(0)

  // After "Start pairing" → wait 2s → start progress bar
  useEffect(() => {
    if (pairState !== 'waiting') return
    const t = setTimeout(() => {
      setPairState('pairing')
      setPairProgress(0)
    }, 5000)
    return () => clearTimeout(t)
  }, [pairState])

  // Progress bar over 5s → success or error
  useEffect(() => {
    if (pairState !== 'pairing') return
    const duration = 5000
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setPairProgress((elapsed / duration) * 100)
      if (elapsed >= duration) {
        clearInterval(interval)
        if (Math.random() < 0.2) {
          setPairState('error')
        } else {
          setPairState('success')
          setDeviceName('Hunchie')
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [pairState])

  const handleRetry = () => {
    setPairState('idle')
    setPairProgress(0)
  }

  const handleBackToHome = () => {
    completeOnboarding(name.trim() || 'User', deviceName)
    navigate('/dashboard', { replace: true })
  }

  const handleStartSession = () => {
    completeOnboarding(name.trim() || 'User', deviceName)
    startSession()
    navigate('/dashboard', { replace: true })
  }

  const secsLeft = Math.max(0, 5 - Math.ceil((pairProgress / 100) * 5))

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.headerTitle}>ONBOARDING</h1>

        {/* Step tracker */}
        <ul className={styles.stepList}>
          <li className={step >= 1 ? styles.stepDone : styles.stepUpcoming}>
            {step > 1 ? '✓' : 'O'} STEP 1: Place Hunchie
          </li>
          <li className={step >= 2 ? styles.stepDone : styles.stepUpcoming}>
            {step > 2 ? '✓' : 'O'} STEP 2: Pair Hunchie
          </li>
          <li className={step >= 3 ? styles.stepDone : styles.stepUpcoming}>
            {step >= 3 ? '✓' : 'O'} STEP 3: Start First Session
          </li>
        </ul>

        {/* ── Step 1: Place Hunchie ── */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <img src="/onboarding1.png" alt="Place Hunchie on the edge of your desk" className={styles.stepImage} />
            <p className={styles.placeText}>
              place your Hunchie on the edge of your desk so you will hit it if you start to hunch forward
            </p>
            <label className={styles.nameLabel} htmlFor="onboarding-name">
              Your name (optional)
            </label>
            <input
              id="onboarding-name"
              type="text"
              className={styles.nameInput}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
            />
            <Button variant="teal" onClick={() => setStep(2)} className={styles.nextBtn}>
              NEXT →
            </Button>
          </div>
        )}

        {/* ── Step 2: Pair Hunchie ── */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <img src="/onboarding2.png" alt="Hold Hunchie for 3 seconds to pair" className={styles.stepImage} />
            <p className={styles.holdText}>Hold This Button For 3 Seconds To Pair Hunchie</p>

            {pairState === 'waiting' && (
              <p className={styles.waitingText}>Waiting...</p>
            )}

            {pairState === 'pairing' && (
              <>
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar} style={{ width: `${pairProgress}%` }} />
                </div>
                <p className={styles.pairingText}>Pairing... {secsLeft}sec left</p>
              </>
            )}

            {pairState === 'error' && (
              <>
                <div className={styles.progressWrap}>
                  <div className={styles.progressBarError} style={{ width: '100%' }} />
                </div>
                <p className={styles.errorText}>error: please try again</p>
                <Button variant="pink" onClick={handleRetry}>
                  Try again
                </Button>
              </>
            )}

            {pairState === 'success' && (
              <>
                <p className={styles.successText}>Paired!</p>
                <Button variant="teal" onClick={() => setStep(3)}>
                  NEXT →
                </Button>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: Set-up complete ── */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <img src="/onboarding3.png" alt="Set-up complete" className={styles.stepImage} />
            <Button variant="pink" onClick={handleStartSession} className={styles.startSessionBtn}>
              START FIRST SESSION
            </Button>
            <button type="button" className={styles.backToHome} onClick={handleBackToHome}>
              ← BACK TO HOME
            </button>
          </div>
        )}
      </div>
    </div>
  )
}