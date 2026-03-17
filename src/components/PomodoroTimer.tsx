import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from './Button'
import { Celebration } from './Celebration'
import { TreatIllustration, pickRandomTreat, TREAT_NAMES, TREAT_TIERS, TREAT_EMOJI, type TreatType } from './TreatIllustration'
import styles from './PomodoroTimer.module.css'

const FOCUS_DURATION = 25 * 60
const BREAK_DURATION = 5 * 60

// 30+ break activities — each fills ~5 minutes, no screens
import type { TaskCategory } from '../types'

const BREAK_ACTIVITIES: Record<TaskCategory, string[]> = {
  posture: [
    'Sit up tall and roll your shoulders back 10 times. Then forward 10 times. Reset your posture and hold for 30 seconds. Repeat the cycle!',
    'Stand up, clasp your hands behind your back, and open your chest wide. Hold 15 seconds. Sit down with perfect posture. Repeat 5 times!',
    'Do chin tucks: pull your chin straight back (make a double chin). Hold 5 seconds, release. Repeat 20 times — great for forward head posture!',
    'Stand against a wall: head, shoulders, and hips touching the wall. Hold 30 seconds. Step away and maintain that posture sitting down. Repeat 5 times!',
    'Sit at the edge of your chair with feet flat. Stack your spine: pelvis, ribcage, then head. Hold 1 minute. Rest 15 seconds. Repeat until time is up!',
    'Do doorway chest stretches: arms on each side of a doorframe, lean forward gently. Hold 20 seconds. Reset posture. Repeat 8 times!',
    'Thread-the-needle stretch: on all fours, slide one arm under your body and rotate. Hold 15 seconds each side. Alternate for 5 minutes!',
    'Cat-cow stretches: on all fours, arch your back up (cat), then dip it down (cow). Move slowly. Do 20 rounds then sit with awareness!',
    'Shoulder blade squeezes: squeeze your shoulder blades together like you\'re holding a pencil between them. Hold 5 seconds, release. Repeat 25 times!',
    'Stand up and do a full body posture check: feet hip-width, knees soft, pelvis neutral, shoulders back, chin tucked. Hold 1 minute. Sit and maintain. Repeat!',
  ],
  fitness: [
    'Do 5 sets of 20 jumping jacks with 30-second rest between sets. Try to go faster each round!',
    'Hold a plank for 30 seconds, rest 30 seconds. Repeat 5 times. Can you hold longer each round?',
    'Do 10 star jumps as dramatically as possible. Rest 20 seconds. Repeat until time runs out!',
    'Sprint to your kitchen and back 3 times. Then do 10 squats. Sprint again. Keep alternating until the timer ends!',
    'Do 20 squats while humming your favorite song. Switch songs each set of 20. See how many sets you can do!',
    'Wall-sit for 45 seconds, rest 30 seconds. Repeat until time is up! Try to last longer each round.',
    'Do 15 lunges across your room. Then 15 back. Alternate between forward lunges and side lunges each lap!',
    'Do 10 push-ups, then 10 mountain climbers, then 10 burpees. Rest 30 seconds. Repeat the circuit!',
    'High knees for 30 seconds, rest 15 seconds. Butt kicks 30 seconds, rest 15 seconds. Repeat the cycle!',
    'Do 10 tricep dips on your chair, then 10 calf raises, then hold a wall-sit for 20 seconds. Repeat!',
  ],
  mindfulness: [
    'Close your eyes and take 5 deep belly breaths: inhale 4 counts, hold 4 counts, exhale 6 counts. Repeat the full cycle for 5 minutes.',
    'Body scan meditation: start at your toes and slowly notice each body part up to your head. Spend 20 seconds on each area. Notice without judging.',
    'Practice box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat for 5 minutes. Focus only on the counting.',
    'Do a gratitude exercise: think of 5 things you\'re grateful for right now. For each one, close your eyes and sit with the feeling for 30 seconds.',
    'Progressive muscle relaxation: tense your feet 5 seconds, release. Move up: calves, thighs, belly, fists, shoulders, face. Repeat the full cycle!',
    'Mindful listening: close your eyes and count every distinct sound you can hear for 2 minutes. Then sit in silence for 3 minutes.',
    'Massage your temples in slow circles for 30 seconds. Then your jaw. Then behind your ears. Then your forehead. Cycle through mindfully.',
    'Gentle neck stretches: tilt your ear to your shoulder, hold 15 seconds each side. Then slow neck rolls 10 each direction. Move with your breath.',
    '4-7-8 breathing: inhale 4 counts through nose, hold 7 counts, exhale 8 counts through mouth. This calms the nervous system. Repeat 8 rounds.',
    'Do 3 gentle forward folds: stand, let arms hang, breathe into the stretch. Come up slowly vertebra by vertebra. Shake out your hands between each.',
  ],
  creative: [
    'Draw Hunchie from memory with your non-dominant hand. Now draw it as a cowboy. Now as an astronaut. Now as a chef. Keep going!',
    'Sketch your pet (or dream pet) as a superhero. Design their costume, logo, and origin story. Draw as many versions as you can!',
    'Write a haiku about your lunch. Then about your chair. Then about the weather. Keep writing haikus until time runs out — aim for 10!',
    'Design a flag for your desk territory. Then a national anthem (hum it). Then a coat of arms. Build your desk nation!',
    'Invent a new animal by combining two real ones. Name it, draw it, give it a backstory. Then create its rival animal!',
    'Write a 4-line poem about your chair. Then your desk. Then your wall. Then something you can see out the window. One poem per minute!',
    'Sculpt something out of whatever is on your desk. Destroy it. Rebuild it better. Keep iterating until the timer ends!',
    'Draw a comic strip about Hunchie\'s day off. 4 panels minimum. Add speech bubbles and sound effects!',
    'Design a menu for a restaurant run by Hunchie. Name the dishes, draw the food, set the prices. Make it fancy!',
    'Write a short story in exactly 50 words about your best posture day ever. Then rewrite it in exactly 25 words. Then 10.',
  ],
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export type TreatReward = { treat: TreatType }

interface Props {
  paused?: boolean
  userPaused?: boolean
  taskCategory?: TaskCategory
  onSkipBreak?: () => void
  onTreatEarned?: (treat: TreatType) => void
  onBreakCompleted?: () => void
  onBreakSkipped?: () => void
}

type RevealStage = 'box-idle' | 'box-shake' | 'box-open' | 'treat-fly' | 'legendary-dim' | 'legendary-reveal' | 'done'

export function PomodoroTimer({ paused: externalPaused, userPaused, taskCategory = 'posture', onSkipBreak, onTreatEarned, onBreakCompleted, onBreakSkipped }: Props) {
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
  const [bonusTreat, setBonusTreat] = useState<TreatType | null>(null)
  const [showBonusBanner, setShowBonusBanner] = useState(false)
  const handledCompletion = useRef(false)

  const shownActivities = useRef<Set<number>>(new Set())

  const pickActivity = useCallback(() => {
    const activities = BREAK_ACTIVITIES[taskCategory] || BREAK_ACTIVITIES.posture
    if (shownActivities.current.size >= activities.length) {
      shownActivities.current.clear()
    }
    const available = activities
      .map((a, i) => ({ a, i }))
      .filter(({ i }) => !shownActivities.current.has(i))
    const pick = available[Math.floor(Math.random() * available.length)]
    shownActivities.current.add(pick.i)
    return pick.a
  }, [taskCategory])

  const showBreakPopupAfterBonus = useCallback(() => {
    setShowBonusBanner(false)
    setActivity(pickActivity())
    setBreakPhase('activity')
    setBreakRemaining(BREAK_DURATION)
    setShowBreakPopup(true)
    setEarnedTreat(null)
    setBreakWasCompleted(false)
    setTimeout(() => setPopupVisible(true), 20)
  }, [pickActivity])

  // Handle timer completion — bonus treat then break
  useEffect(() => {
    if (focusRemaining > 0 || handledCompletion.current || showBreakPopup || externalPaused) return
    handledCompletion.current = true
    const bonus = Math.random() < 0.5 ? pickRandomTreat() : null
    if (bonus) {
      setBonusTreat(bonus)
      setShowBonusBanner(true)
      onTreatEarned?.(bonus)
      const t = setTimeout(showBreakPopupAfterBonus, 3000)
      return () => clearTimeout(t)
    }
    showBreakPopupAfterBonus()
  }, [focusRemaining, showBreakPopup, externalPaused, onTreatEarned, showBreakPopupAfterBonus])

  // Focus countdown tick
  useEffect(() => {
    if (!isRunning || showBreakPopup || showBonusBanner || isPaused || externalPaused) return
    if (focusRemaining <= 0) return
    const id = setInterval(() => setFocusRemaining(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [isRunning, focusRemaining, showBreakPopup, showBonusBanner, isPaused, externalPaused])

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
  const revealTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const finishReveal = useCallback(() => {
    if (!earnedTreat) return
    revealTimers.current.forEach(clearTimeout)
    revealTimers.current = []
    setRevealStage('done')
    onTreatEarned?.(earnedTreat)
    if (breakWasCompleted) onBreakCompleted?.()
    else onBreakSkipped?.()
    setBreakPhase('treat')
  }, [earnedTreat, onTreatEarned, breakWasCompleted, onBreakCompleted, onBreakSkipped])

  const handleBoxClick = useCallback(() => {
    if (revealStage === 'done' || breakPhase !== 'reveal') return
    if (revealStage === 'box-idle' || revealStage === 'box-shake') {
      // User clicked box — skip to open + reveal
      revealTimers.current.forEach(clearTimeout)
      revealTimers.current = []
      setRevealStage('box-open')
      const t1 = setTimeout(() => setRevealStage('treat-fly'), 500)
      const t2 = setTimeout(finishReveal, 1500)
      revealTimers.current.push(t1, t2)
    } else {
      // Already past box — skip to end
      finishReveal()
    }
  }, [revealStage, breakPhase, finishReveal])

  useEffect(() => {
    if (breakPhase !== 'reveal' || !earnedTreat) return
    const isLegendary = TREAT_TIERS[earnedTreat].tier === 'legendary'
    const timers = revealTimers.current
    timers.forEach(clearTimeout)
    revealTimers.current = []

    setRevealStage('box-idle')
    timers.push(setTimeout(() => setRevealStage('box-shake'), 300))
    timers.push(setTimeout(() => setRevealStage('box-open'), 1300))
    timers.push(setTimeout(() => setRevealStage('treat-fly'), 1800))

    if (isLegendary) {
      timers.push(setTimeout(() => setRevealStage('legendary-dim'), 2600))
      timers.push(setTimeout(() => setRevealStage('legendary-reveal'), 3600))
      timers.push(setTimeout(finishReveal, 5100))
    } else {
      timers.push(setTimeout(finishReveal, 2800))
    }

    return () => { revealTimers.current.forEach(clearTimeout); revealTimers.current = [] }
  }, [breakPhase, earnedTreat, finishReveal])

  const handleSkipToBreak = () => {
    setFocusRemaining(0)
  }

  const restartFocus = () => {
    setPopupVisible(false)
    handledCompletion.current = false
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
        <button
          type="button"
          className={styles.skipBtn}
          onClick={handleSkipToBreak}
          disabled={externalPaused}
          title={externalPaused ? 'Press Start to begin your session first' : 'Skip to break (demo)'}
          data-coach="skip-to-break"
        >
          ⏩ Skip to Break (demo)
        </button>
      </div>

      {/* Bonus treat banner */}
      {showBonusBanner && bonusTreat && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(123, 74, 30, 0.3)',
          backdropFilter: 'blur(3px)',
          zIndex: 250,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div className={styles.bonusBanner}>
            <span className={styles.bonusEmoji}>{TREAT_EMOJI[bonusTreat]}</span>
            <h3 className={styles.bonusTitle}>Bonus Treat!</h3>
            <p className={styles.bonusText}>
              Congrats, you got a bonus <strong>{TREAT_NAMES[bonusTreat]}</strong> for completing this session!
            </p>
          </div>
        </div>
      )}

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
                <div className={styles.activityContent} onClick={handleBoxClick} style={{ cursor: 'pointer' }}>
                  {/* Legendary golden beam */}
                  {(revealStage === 'legendary-dim' || revealStage === 'legendary-reveal') && (
                    <div className={styles.goldenBeam} />
                  )}

                  {/* Gift box */}
                  {(revealStage === 'box-idle' || revealStage === 'box-shake' || revealStage === 'box-open') && (
                    <>
                      <div className={`${styles.mysteryBox} ${revealStage === 'box-shake' ? styles.boxShake : ''} ${revealStage === 'box-open' ? styles.boxOpen : ''}`}>
                        <div className={styles.boxTop}>
                          <div className={styles.boxBow} />
                        </div>
                        <div className={styles.boxBottom}>
                          <div className={styles.boxRibbon} />
                        </div>
                      </div>
                      {(revealStage === 'box-idle' || revealStage === 'box-shake') && (
                        <p className={styles.tapHint}>Tap to open!</p>
                      )}
                    </>
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
