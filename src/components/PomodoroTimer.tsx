import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from './Button'
import { Celebration } from './Celebration'
import { TreatIllustration, pickRandomTreat, TREAT_NAMES, TREAT_TIERS, TREAT_EMOJI, type TreatType } from './TreatIllustration'
import styles from './PomodoroTimer.module.css'

const FOCUS_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60

// 30+ break activities — each fills ~5 minutes, no screens
const BREAK_ACTIVITIES = [
  // Physical
  'Do 5 sets of 20 jumping jacks with 30-second rest between sets. Try to go faster each round!',
  'Hold a plank for 30 seconds, rest 30 seconds. Repeat 5 times. Can you hold longer each round?',
  'Do 10 star jumps as dramatically as possible. Rest 20 seconds. Repeat until time runs out — try to be MORE dramatic each time!',
  'Sprint to your kitchen and back 3 times. Then do 10 squats. Sprint again. Keep alternating until the timer ends!',
  'Do the worm across your room. Stand up, walk back. Repeat. If the worm is too hard, roll like a log. Keep going for 5 minutes!',
  'Do 20 squats while humming your favorite song. Switch songs each set of 20. See how many sets you can do!',
  'Wall-sit for 45 seconds, rest 30 seconds. Each round, pretend you\'re on a different throne — medieval, space captain, jungle king. Repeat until time!',
  'Do 15 lunges like you\'re walking on the moon. Then 15 more like you\'re in slow motion. Alternate styles until the timer ends!',

  // Creative
  'Draw a rabbit with a mermaid tail. Then draw it surfing. Then in a top hat. Then as a ninja. You have 5 minutes — go!',
  'Sketch your pet (or dream pet) as a superhero. Design their costume, logo, and origin story. Draw as many versions as you can!',
  'Write a haiku about your lunch. Then about your chair. Then about the weather. Keep writing haikus until time runs out — aim for 10!',
  'Draw Hunchie from memory with your non-dominant hand. Now draw it as a cowboy. Now as an astronaut. Now as a chef. Keep going until time is up!',
  'Sculpt something out of whatever is on your desk. Destroy it. Rebuild it better. Keep iterating until the timer ends!',
  'Invent a new animal by combining two real ones. Name it, draw it, give it a backstory. Then create its rival animal. Keep going!',
  'Write a 4-line poem about your chair. Then your desk. Then your wall. Then something you can see out the window. One poem per minute!',
  'Design a flag for your desk territory. Then a national anthem (hum it). Then a coat of arms. Build your desk nation for 5 minutes!',

  // Eye/body care
  'Spend 5 minutes doing the 20-20-20 eye exercise: every 20 seconds, look at something 20 feet away for 20 seconds. Repeat until the timer ends.',
  'Roll your neck 10 times each direction. Then shoulder rolls 10 each. Then wrist circles 10 each. Then ankle circles 10 each. Repeat the whole sequence!',
  'Stretch your wrists and fingers: spread, make a fist, repeat 10 times. Then wrist rotations. Then finger-to-thumb touches. Cycle through for 5 minutes!',
  'Close your eyes and take 10 deep breaths. Then 10 breaths focusing on your belly. Then 10 counting backwards from 10. Repeat the full cycle!',
  'Stand up and touch your toes 15 times. Then reach for the sky 15 times. Then twist side to side 15 times. Keep cycling through all three!',
  'Do shoulder shrugs: hold 5 seconds up, release. Repeat 10 times. Then ear-to-shoulder stretches 10 each side. Alternate sets until time is up!',
  'Massage your temples in slow circles for 30 seconds. Then your jaw. Then behind your ears. Then your forehead. Cycle through the full sequence!',
  'Stretch your arms overhead and lean side to side 10 times. Then forward fold. Then gentle backbend. Flow through all stretches for the full 5 minutes!',

  // Silly
  'Try to lick your elbow (you can\'t but try). Then try to touch your nose with your tongue. Then wiggle your ears. Keep attempting impossible body tricks!',
  'Talk to a houseplant and give it a compliment. Then give it life advice. Then interview it about its day. Give each plant a full 1-minute conversation!',
  'Do your best penguin impression walk to your kitchen. Get a glass of water. Penguin walk back. Repeat until time runs out!',
  'Stack as many random objects as you can into a tower. When it falls, rebuild. Keep going for 5 minutes — try to beat your record each time!',
  'Make up a secret handshake with yourself. Practice it 10 times. Then add a new move. Practice again. Keep adding moves until you have an epic 30-second handshake!',
  'Pretend you\'re a T-Rex trying to make a sandwich. Then a T-Rex writing a letter. Then a T-Rex doing karate. Act out a new T-Rex activity each minute!',
  'Narrate everything you see around you like a nature documentary for 5 minutes. Use your best David Attenborough voice. Don\'t break character!',
  'Try to balance a pen on your nose for 30 seconds. Then your finger. Then your foot. Cycle through balance challenges until the timer ends!',
  'Do your best royal wave to every object in the room. Give each object a knighthood and a silly title. Sir Lamp of the Bright Glow, etc!',
  'Spin around 5 times then try to walk in a straight line. Mark how far you got. Rest 30 seconds. Try to beat your distance each round!',
]

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export type TreatReward = { treat: TreatType }

interface Props {
  paused?: boolean
  userPaused?: boolean // true only when user explicitly paused (shows "Paused" label)
  onSkipBreak?: () => void
  onTreatEarned?: (treat: TreatType) => void
  onBreakCompleted?: () => void
  onBreakSkipped?: () => void
}

type RevealStage = 'box-idle' | 'box-shake' | 'box-open' | 'treat-fly' | 'legendary-dim' | 'legendary-reveal' | 'done'

export function PomodoroTimer({ paused: externalPaused, userPaused, onSkipBreak, onTreatEarned, onBreakCompleted, onBreakSkipped }: Props) {
  const [focusRemaining, setFocusRemaining] = useState(FOCUS_DURATION)
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, _setIsPaused] = useState(false)
  const [showBreakPopup, setShowBreakPopup] = useState(false)
  const [breakPhase, setBreakPhase] = useState<'activity' | 'countdown' | 'celebration' | 'reveal' | 'treat' | 'done'>('activity')
  const [breakRemaining, setBreakRemaining] = useState(BREAK_DURATION)
  const [activity, setActivity] = useState('')
  const [shuffling, setShuffling] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [earnedTreat, setEarnedTreat] = useState<TreatType | null>(null)
  const [revealStage, setRevealStage] = useState<RevealStage>('box-idle')
  const [breakWasCompleted, setBreakWasCompleted] = useState(false)

  const shownActivities = useRef<Set<number>>(new Set())

  const pickActivity = useCallback(() => {
    if (shownActivities.current.size >= BREAK_ACTIVITIES.length) {
      shownActivities.current.clear()
    }
    const available = BREAK_ACTIVITIES
      .map((a, i) => ({ a, i }))
      .filter(({ i }) => !shownActivities.current.has(i))
    const pick = available[Math.floor(Math.random() * available.length)]
    shownActivities.current.add(pick.i)
    return pick.a
  }, [])

  // Focus countdown
  useEffect(() => {
    if (!isRunning || showBreakPopup || isPaused || externalPaused) return
    if (focusRemaining <= 0) {
      setActivity(pickActivity())
      setBreakPhase('activity')
      setBreakRemaining(BREAK_DURATION)
      setShowBreakPopup(true)
      setEarnedTreat(null)
      setBreakWasCompleted(false)
      setTimeout(() => setPopupVisible(true), 20)
      return
    }
    const id = setInterval(() => setFocusRemaining(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [isRunning, focusRemaining, showBreakPopup, isPaused, externalPaused, pickActivity])

  // Break countdown -> celebration when done
  useEffect(() => {
    if (breakPhase !== 'countdown' || isPaused) return
    if (breakRemaining <= 0) {
      setBreakWasCompleted(true)
      setBreakPhase('celebration')
      return
    }
    const id = setInterval(() => setBreakRemaining(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [breakPhase, breakRemaining, isPaused])

  // Reveal timeline
  useEffect(() => {
    if (breakPhase !== 'reveal' || !earnedTreat) return
    const isLegendary = TREAT_TIERS[earnedTreat].tier === 'legendary'
    const timers: ReturnType<typeof setTimeout>[] = []

    setRevealStage('box-idle')
    timers.push(setTimeout(() => setRevealStage('box-shake'), 300))
    timers.push(setTimeout(() => setRevealStage('box-open'), 1300))
    timers.push(setTimeout(() => setRevealStage('treat-fly'), 1800))

    if (isLegendary) {
      timers.push(setTimeout(() => setRevealStage('legendary-dim'), 2600))
      timers.push(setTimeout(() => setRevealStage('legendary-reveal'), 3600))
      timers.push(setTimeout(() => {
        setRevealStage('done')
        onTreatEarned?.(earnedTreat)
        if (breakWasCompleted) onBreakCompleted?.()
        else onBreakSkipped?.()
        setBreakPhase('treat')
      }, 5100))
    } else {
      timers.push(setTimeout(() => {
        setRevealStage('done')
        onTreatEarned?.(earnedTreat)
        if (breakWasCompleted) onBreakCompleted?.()
        else onBreakSkipped?.()
        setBreakPhase('treat')
      }, 2800))
    }

    return () => timers.forEach(clearTimeout)
  }, [breakPhase, earnedTreat, onTreatEarned, breakWasCompleted, onBreakCompleted, onBreakSkipped])

  const handleSkipToBreak = () => {
    setFocusRemaining(0)
  }

  const restartFocus = () => {
    setPopupVisible(false)
    setTimeout(() => {
      setShowBreakPopup(false)
      setFocusRemaining(FOCUS_DURATION)
      setIsRunning(true)
    }, 300)
  }

  const handleDoIt = () => {
    setBreakPhase('countdown')
    setBreakRemaining(BREAK_DURATION)
  }

  const handleShuffle = () => {
    setShuffling(true)
    setTimeout(() => {
      setActivity(pickActivity())
      setShuffling(false)
    }, 250)
  }

  const handleSkipBreak = () => {
    onSkipBreak?.()
    restartFocus()
  }

  const handleSkipBreakTimer = () => {
    setBreakWasCompleted(false)
    setBreakPhase('celebration')
  }

  const handleCelebrationDone = useCallback(() => {
    const treat = pickRandomTreat()
    setEarnedTreat(treat)
    setBreakPhase('reveal')
  }, [])

  const handleBackToWork = () => {
    restartFocus()
  }

  const progress = ((FOCUS_DURATION - focusRemaining) / FOCUS_DURATION) * 100
  const treatMeta = earnedTreat ? TREAT_TIERS[earnedTreat] : null

  return (
    <>
      {/* Timer bar */}
      <div className={styles.timerBar}>
        <div className={styles.timerContent}>
          <span className={styles.timerIcon} aria-hidden>🍅</span>
          <span className={styles.timerText}>
            {formatTimer(showBreakPopup && breakPhase === 'countdown' ? breakRemaining : focusRemaining)}
          </span>
          {userPaused && <span className={styles.pausedLabel}>Paused</span>}
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          className={styles.skipBtn}
          onClick={handleSkipToBreak}
          title="Skip to break (demo)"
          data-coach="skip-to-break"
        >
          ⏩ Skip to Break
        </button>
      </div>

      {/* Break pop-up */}
      {showBreakPopup && (
        <div className={`${styles.overlay} ${popupVisible ? styles.overlayVisible : ''}`}>
          <div className={`${styles.popup} ${popupVisible ? styles.popupVisible : ''}`}>
            <span className={`${styles.cloud} ${styles.cloudTL}`} aria-hidden>✦</span>
            <span className={`${styles.cloud} ${styles.cloudTR}`} aria-hidden>✦</span>
            <span className={`${styles.cloud} ${styles.cloudBL}`} aria-hidden>✦</span>
            <span className={`${styles.cloud} ${styles.cloudBR}`} aria-hidden>✦</span>

            <div className={`${styles.balloonBody} ${breakPhase === 'celebration' ? styles.balloonCelebration : ''} ${breakPhase === 'reveal' && revealStage === 'legendary-dim' ? styles.legendaryDim : ''}`}>
              {/* Celebration effects inside the balloon */}
              {breakPhase === 'celebration' && (
                <Celebration onComplete={handleCelebrationDone} />
              )}
              <div className={styles.ruledLines} aria-hidden>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={styles.ruledLine} />
                ))}
              </div>

              {/* Activity suggestion */}
              {breakPhase === 'activity' && (
                <div className={styles.activityContent}>
                  <img src="/parts/hunchie-sticker.webp" alt="Hunchie" className={styles.stickerImg} />
                  <h2 className={styles.breakTitle}>Time for a break!</h2>
                  <p className={`${styles.activityText} ${shuffling ? styles.activityShuffle : ''}`}>
                    {activity}
                  </p>
                </div>
              )}

              {/* Break countdown */}
              {breakPhase === 'countdown' && (
                <div className={styles.activityContent}>
                  <img src="/parts/hunchie-sticker.webp" alt="Hunchie" className={styles.stickerImg} />
                  <h2 className={styles.breakTitle}>You got this!</h2>
                  <p className={styles.activityTextSmall}>{activity}</p>
                  <span className={styles.breakCountdown}>{formatTimer(breakRemaining)}</span>
                </div>
              )}

              {/* Celebration — no Hunchie, just effects */}
              {breakPhase === 'celebration' && (
                <div className={styles.activityContent} />
              )}

              {/* Mystery box reveal */}
              {breakPhase === 'reveal' && earnedTreat && treatMeta && (
                <div className={styles.activityContent}>
                  {/* Legendary golden beam */}
                  {(revealStage === 'legendary-dim' || revealStage === 'legendary-reveal') && (
                    <div className={styles.goldenBeam} />
                  )}

                  {/* Gift box */}
                  {(revealStage === 'box-idle' || revealStage === 'box-shake' || revealStage === 'box-open') && (
                    <div className={`${styles.mysteryBox} ${revealStage === 'box-shake' ? styles.boxShake : ''} ${revealStage === 'box-open' ? styles.boxOpen : ''}`}>
                      <div className={styles.boxTop}>
                        <div className={styles.boxBow} />
                      </div>
                      <div className={styles.boxBottom}>
                        <div className={styles.boxRibbon} />
                      </div>
                    </div>
                  )}

                  {/* Treat flying out */}
                  {(revealStage === 'treat-fly' || revealStage === 'legendary-dim' || revealStage === 'legendary-reveal' || revealStage === 'done') && (
                    <div className={`${styles.treatReveal} ${revealStage === 'legendary-reveal' ? styles.legendaryBurst : ''}`}>
                      <TreatIllustration treat={earnedTreat} size={90} animated />
                    </div>
                  )}

                  {/* Treat info text */}
                  {(revealStage === 'treat-fly' || revealStage === 'legendary-reveal' || revealStage === 'done') && (
                    <div className={styles.revealInfo}>
                      <h2 className={styles.breakTitle}>
                        {TREAT_EMOJI[earnedTreat]} {TREAT_NAMES[earnedTreat]}
                      </h2>
                      <span className={styles.revealTier} style={{ color: treatMeta.tierColor }}>
                        {treatMeta.tierLabel}
                      </span>
                      <p className={styles.revealHeal}>{treatMeta.healDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Treat reward — auto-saved to inventory */}
              {breakPhase === 'treat' && earnedTreat && treatMeta && (
                <div className={styles.activityContent}>
                  <img src="/parts/hunchie-eating.jpg" alt="Hunchie eating" className={styles.eatingImg} />
                  <TreatIllustration treat={earnedTreat} size={90} animated />
                  <h2 className={styles.breakTitle}>
                    {TREAT_EMOJI[earnedTreat]} {TREAT_NAMES[earnedTreat]}
                  </h2>
                  <span className={styles.treatTierLabel} style={{ color: treatMeta.tierColor }}>
                    {treatMeta.tierLabel}
                  </span>
                  <p className={styles.activityTextSmall}>
                    Saved to your inventory 🎒 Feed it to Hunchie anytime!
                  </p>
                </div>
              )}
            </div>

            {/* Buttons area */}
            <div className={styles.basketArea}>
              {breakPhase === 'activity' && (
                <>
                  <Button variant="teal" onClick={handleDoIt} className={styles.popupBtn}>
                    I'll do it! 💪
                  </Button>
                  <Button variant="yellow" onClick={handleShuffle} className={styles.popupBtn}>
                    I prefer something else 🔄
                  </Button>
                  <Button variant="pink" onClick={handleSkipBreak} className={styles.popupBtn}>
                    Skip break ⏭️
                  </Button>
                </>
              )}

              {breakPhase === 'countdown' && (
                <>
                  <p className={styles.countdownHint}>Hunchie is cheering you on...</p>
                  <Button variant="yellow" onClick={handleSkipBreakTimer} className={styles.popupBtn}>
                    Done early! ⏭️
                  </Button>
                </>
              )}

              {breakPhase === 'celebration' && (
                <p className={styles.countdownHint}>🎉 Celebrating your break! 🎉</p>
              )}

              {breakPhase === 'reveal' && (
                <p className={styles.countdownHint}>✨ Opening your reward... ✨</p>
              )}

              {breakPhase === 'treat' && (
                <Button variant="teal" onClick={handleBackToWork} className={styles.popupBtn}>
                  Back to work 🚀
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
