import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { HunchieAvatar } from '../components/HunchieAvatar'
import { HunchieAnimated, type HunchieAnimatedHandle } from '../components/HunchieAnimated'
import { PomodoroTimer } from '../components/PomodoroTimer'
import { TreatInventory } from '../components/TreatInventory'
import { EatingAnimation } from '../components/EatingAnimation'
import { BackgroundLayer } from '../components/BackgroundLayer'
import { CoachMarks } from '../components/CoachMarks'
import { TREAT_TIERS, TREAT_EMOJI, type TreatType } from '../components/TreatIllustration'
import type { HunchieMood } from '../types'
import type { HitLog } from '../types'
import type { Session } from '../types'
import styles from './Dashboard.module.css'

function getHunchieMood(hits: HitLog[], recentMinutes = 5): HunchieMood {
  const recent = recentMinutes * 60 * 1000
  const now = Date.now()
  const recentHits = hits.filter((h) => now - new Date(h.timestamp).getTime() < recent)
  const heavy = recentHits.filter((h) => h.severity === 'heavy').length
  const any = recentHits.length
  if (any === 0) return 'happy'
  if (heavy >= 2 || any >= 5) return 'annoyed'
  if (any >= 2) return 'sad'
  return 'calm'
}

/** Post-session mood: sleepy if not too bad, else calm/sad/annoyed */
function getPostSessionMood(session: Session): HunchieMood {
  const n = session.hits.length
  const heavy = session.hits.filter((h) => h.severity === 'heavy').length
  if (n === 0) return 'happy'
  if (heavy >= 2 || n >= 6) return 'annoyed'
  if (n >= 3) return 'sad'
  return 'sleepy'
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatSeverity(s: HitLog['severity']) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Hit reaction messages by severity — picked randomly on each hit
const HIT_MESSAGES: Record<string, string[]> = {
  light: [
    'A few posture events. Try to sit tall!',
    'Little nudge — shoulders back!',
    'Small slip! You got this.',
    'Gentle reminder: chin up!',
    'Just a tiny slouch. Straighten up!',
  ],
  medium: [
    'Ouch! Hunchie felt that one.',
    'That was a solid hit — sit up straighter!',
    'Hunchie\'s not happy about that slouch.',
    'Medium hit! Check your posture.',
    'Oof, Hunchie stumbled a bit there.',
  ],
  heavy: [
    'Yikes! Hunchie nearly toppled over!',
    'Major slouch detected — Hunchie is seeing stars!',
    'That was brutal! Please sit up!',
    'Hunchie is NOT okay. Fix your posture now!',
    'Critical hit! Hunchie needs a break after that one.',
  ],
}

function pickHitMessage(severity: string): string {
  const msgs = HIT_MESSAGES[severity] ?? HIT_MESSAGES.light
  return msgs[Math.floor(Math.random() * msgs.length)]
}

// Inspirational quotes shown after Hunchie returns from runaway
const RETURN_QUOTES = [
  'Every great comeback starts with a single step.',
  'You and Hunchie make a great team!',
  'Posture is a journey, not a destination.',
  'Small corrections lead to big improvements.',
  'Hunchie believes in you — sit tall!',
  'Together again and stronger than ever.',
  'A fresh start feels amazing, doesn\'t it?',
  'Your spine will thank you later!',
  'Progress, not perfection.',
  'Welcome back to good habits!',
]

// Trail checkpoint icons — expand based on missions required
const TRAIL_ICON_POOL = ['🫐', '🍎', '🍓', '🌰', '🏠']

const RECOVERY_PRODUCTIVITY = [
  'Sit up tall, roll your shoulders back 5 times, and take 3 deep breaths.',
  'Stand up, stretch your arms overhead for 10 seconds, then sit back down with good posture.',
  'Check your screen height — your eyes should be level with the top third. Adjust if needed.',
  'Place both feet flat on the floor and sit with your back against the chair. Hold for 30 seconds.',
  'Do 5 slow neck rolls in each direction, then reset your sitting position.',
  'Push your chair in, plant your feet, and sit at the edge of your seat with a straight back for 30 seconds.',
]

const RECOVERY_SELFCARE = [
  'Close your eyes and take 5 deep belly breaths. Inhale for 4, hold for 4, exhale for 6.',
  'Gently stretch your neck: tilt ear to shoulder, hold 10 seconds each side.',
  'Roll your shoulders forward 5 times, then backward 5 times. Shake out your hands.',
  'Stand up and do 3 gentle forward folds, letting your arms hang. Come back up slowly.',
  'Massage the back of your neck with your fingers for 30 seconds, then sit up straight.',
  'Squeeze your shoulder blades together 5 times, holding each squeeze for 3 seconds.',
]

// ── Return flower types ──
type FlowerVariant = 'daisy' | 'tulip' | 'forgetmenot' | 'buttercup' | 'wildflower'
const FLOWER_VARIANTS: FlowerVariant[] = ['daisy', 'tulip', 'forgetmenot', 'buttercup', 'wildflower']

interface ReturnFlower {
  id: number; x: number; y: number; type: FlowerVariant
  delay: number; scale: number; swayDur: number
}

function FlowerSVG({ type }: { type: FlowerVariant }) {
  switch (type) {
    case 'daisy':
      return (
        <svg width="22" height="22" viewBox="-11 -11 22 22">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
            const cx = Math.cos(a * Math.PI / 180) * 6, cy = Math.sin(a * Math.PI / 180) * 6
            return <ellipse key={a} cx={cx} cy={cy} rx="3" ry="5" fill="white" stroke="#f0f0f0" strokeWidth="0.3" transform={`rotate(${a},${cx},${cy})`} />
          })}
          <circle cx="0" cy="0" r="3.5" fill="#FFD54F" />
        </svg>
      )
    case 'tulip':
      return (
        <svg width="18" height="22" viewBox="-9 -11 18 22">
          <ellipse cx="-3" cy="0" rx="5" ry="8" fill="#F8BBD0" />
          <ellipse cx="3" cy="0" rx="5" ry="8" fill="#F48FB1" />
          <ellipse cx="0" cy="-1" rx="3.5" ry="7" fill="#EC407A" opacity="0.7" />
        </svg>
      )
    case 'forgetmenot':
      return (
        <svg width="20" height="20" viewBox="-10 -10 20 20">
          {[0, 72, 144, 216, 288].map(a => (
            <circle key={a} cx={Math.cos(a * Math.PI / 180) * 5} cy={Math.sin(a * Math.PI / 180) * 5} r="3.5" fill="#90CAF9" stroke="#64B5F6" strokeWidth="0.4" />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#FFF9C4" />
        </svg>
      )
    case 'buttercup':
      return (
        <svg width="20" height="20" viewBox="-10 -10 20 20">
          {[0, 72, 144, 216, 288].map(a => {
            const cx = Math.cos(a * Math.PI / 180) * 5, cy = Math.sin(a * Math.PI / 180) * 5
            return <ellipse key={a} cx={cx} cy={cy} rx="3.5" ry="5" fill="#FFF176" stroke="#FFD54F" strokeWidth="0.3" transform={`rotate(${a},${cx},${cy})`} />
          })}
          <circle cx="0" cy="0" r="2.5" fill="#FFB74D" />
        </svg>
      )
    case 'wildflower':
      return (
        <svg width="16" height="22" viewBox="-8 -11 16 22">
          <path d="M0,-9 C-7,-5 -6,3 -3,5 L0,7 L3,5 C6,3 7,-5 0,-9Z" fill="#CE93D8" stroke="#BA68C8" strokeWidth="0.5" />
          <ellipse cx="0" cy="-1" rx="2" ry="2.5" fill="#F3E5F5" opacity="0.5" />
        </svg>
      )
  }
}

const TREAT_STORAGE_KEY = 'hunchie-treats'

export function Dashboard() {
  const navigate = useNavigate()
  const {
    userName,
    currentSession,
    sessions,
    settings,
    isDemo,
    startSession,
    endSession,
    addHit,
    sessionPaused,
    sessionHealth,
    pauseSession,
    resumeSession,
    feedHunchie,
    runaway,
    runawayNote,
    missionsRequired,
    triggerRunaway,
    addRunawayCheckpoint,
    completeRunawayReturn,
    setDepartureComplete,
    strictness,
    maxHealth: MAX_HEALTH,
  } = useApp()
  const [now, setNow] = useState(() => new Date())
  const [hitTrigger, setHitTrigger] = useState<{
    count: number; severity: 'light' | 'medium' | 'heavy';
    hpDeducted?: number; timestamp?: number
  }>({ count: 0, severity: 'light' })
  const [hitMessage, setHitMessage] = useState<string | null>(null)
  const [returnQuote, setReturnQuote] = useState<string | null>(null)
  const [forceSlump, setForceSlump] = useState(false)
  // Treats persist across sessions via localStorage
  const [treatInventory, setTreatInventory] = useState<TreatType[]>(() => {
    try {
      const raw = localStorage.getItem(TREAT_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [returnAnimating, setReturnAnimating] = useState(false)
  const [showReturnCelebration, setShowReturnCelebration] = useState(false)
  const [departureAnimating, setDepartureAnimating] = useState(false)
  const [trailTreats, setTrailTreats] = useState<(TreatType | null)[]>([])
  const [departureFootprints, setDepartureFootprints] = useState<{ id: number; x: number; y: number; isLeft: boolean }[]>([])
  const departureHunchieRef = useRef<HTMLDivElement>(null)
  const departureSceneRef = useRef<HTMLDivElement>(null)
  const [eatingTreat, setEatingTreat] = useState<TreatType | null>(null)
  const [pendingFeed, setPendingFeed] = useState<{ treat: TreatType; index: number } | null>(null)
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [currentMission, setCurrentMission] = useState('')
  // Return flower state
  const [returnFlowers, setReturnFlowers] = useState<ReturnFlower[]>([])
  const [floatingPetals, setFloatingPetals] = useState<{ id: number; x: number; y: number; color: string; size: number; drift: number; dur: number }[]>([])
  const [flowersFading, setFlowersFading] = useState(false)
  const [showCoachMarks, setShowCoachMarks] = useState(false)
  const lastRecoveryCategory = useRef<'prod' | 'care'>('care')
  const shownRecoveryProd = useRef<Set<number>>(new Set())
  const shownRecoveryCare = useRef<Set<number>>(new Set())
  const slumpTimer = useRef<ReturnType<typeof setTimeout>>()
  const hunchieRef = useRef<HunchieAnimatedHandle>(null)
  const hunchieSectionRef = useRef<HTMLDivElement>(null)
  const returnTrackRef = useRef<HTMLDivElement>(null)

  // Refs for timeouts that must survive React strict mode double-invocations
  const departureT1 = useRef<ReturnType<typeof setTimeout>>()
  const departureT2 = useRef<ReturnType<typeof setTimeout>>()
  const returnT1 = useRef<ReturnType<typeof setTimeout>>()
  const returnT2 = useRef<ReturnType<typeof setTimeout>>()
  const departureTriggered = useRef(false)
  const returnTriggered = useRef(false)
  const isReturning = useRef(false)
  const footprintRaf = useRef<number>()
  const returnFlowerRaf = useRef<number>()

  // Persist treat inventory to localStorage
  useEffect(() => {
    localStorage.setItem(TREAT_STORAGE_KEY, JSON.stringify(treatInventory))
  }, [treatInventory])

  // Global click debug listener (removable later)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      console.log('Click landed on:', target.tagName, target.id || target.className)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Cleanup all timers on unmount only
  useEffect(() => {
    return () => {
      clearTimeout(departureT1.current)
      clearTimeout(departureT2.current)
      clearTimeout(returnT1.current)
      clearTimeout(returnT2.current)
      if (footprintRaf.current) cancelAnimationFrame(footprintRaf.current)
      if (returnFlowerRaf.current) cancelAnimationFrame(returnFlowerRaf.current)
    }
  }, [])

  // On mount: clear stale runaway if HP is full
  useEffect(() => {
    if (runaway.active && sessionHealth >= MAX_HEALTH) {
      completeRunawayReturn()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Detect HP reaching 0 -> trigger runaway
  useEffect(() => {
    if (sessionHealth <= 0 && currentSession && !departureTriggered.current) {
      if (runaway.active && runaway.departureComplete) return
      departureTriggered.current = true
      setDepartureAnimating(true)
      setDepartureFootprints([])
      departureT1.current = setTimeout(() => {
        triggerRunaway()
      }, 1000)
      departureT2.current = setTimeout(() => {
        setDepartureComplete()
        setDepartureAnimating(false)
      }, 6000)
    }
  }, [sessionHealth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync footprints to Hunchie's position during departure
  useEffect(() => {
    if (!departureAnimating) return // DON'T clear footprints here — they persist into empty state
    const hunchieEl = departureHunchieRef.current
    const sceneEl = departureSceneRef.current
    if (!hunchieEl || !sceneEl) return

    let footprintId = 0
    let isLeft = true
    // Walk starts at 25% of 5s = 1250ms, ends at 90% = 4500ms
    // 8 steps across that range
    const WALK_START = 1250
    const WALK_END = 4500
    const TOTAL_STEPS = 8
    const STEP_INTERVAL = (WALK_END - WALK_START) / TOTAL_STEPS
    const startTime = performance.now()
    let stepsPlaced = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      if (stepsPlaced >= TOTAL_STEPS) return

      const nextStepTime = WALK_START + stepsPlaced * STEP_INTERVAL
      if (elapsed >= nextStepTime) {
        const hRect = hunchieEl.getBoundingClientRect()
        const sRect = sceneEl.getBoundingClientRect()
        // Place footprints BEHIND Hunchie (to the left since it walks right)
        // Use center minus ~40% of width so prints trail behind, not under
        const x = hRect.left - sRect.left + hRect.width * 0.15
        const y = hRect.top - sRect.top + hRect.height * 0.92
        // Offset left/right foot from center
        const footOffset = isLeft ? -10 : 10

        setDepartureFootprints(prev => [...prev, {
          id: footprintId++,
          x: x + footOffset,
          y,
          isLeft,
        }])
        isLeft = !isLeft
        stepsPlaced++
      }
      footprintRaf.current = requestAnimationFrame(tick)
    }
    footprintRaf.current = requestAnimationFrame(tick)
    return () => {
      if (footprintRaf.current) cancelAnimationFrame(footprintRaf.current)
    }
  }, [departureAnimating])

  // Handle return animation when all checkpoints are complete
  useEffect(() => {
    if (runaway.active && runaway.checkpoints >= missionsRequired && !returnTriggered.current) {
      // Set flags SYNCHRONOUSLY before any setTimeout — blocks hits immediately
      returnTriggered.current = true
      isReturning.current = true
      ;(window as any).HUNCHIE_RETURN_IN_PROGRESS = true
      setReturnAnimating(true)
      setReturnFlowers([])
      setFloatingPetals([])
      setFlowersFading(false)
      console.log('[Return] Started — isReturning=true, canBeHit will be false')
      returnT1.current = setTimeout(() => {
        completeRunawayReturn()
        hunchieRef.current?.removeAllBandaids()
        departureTriggered.current = false
        returnTriggered.current = false
        setRecoveryOpen(false)
        setDepartureFootprints([])
        // Reset hit state so Hunchie doesn't replay the last severe hit animation
        setHitTrigger({ count: 0, severity: 'light' })
        setHitMessage(null)
        setReturnQuote(RETURN_QUOTES[Math.floor(Math.random() * RETURN_QUOTES.length)])
        setShowReturnCelebration(true)
        setReturnAnimating(false)
        // Start fading flowers as Hunchie arrives home
        setFlowersFading(true)
        console.log('[Return] Animation complete — celebration showing, isReturning still true')
        returnT2.current = setTimeout(() => {
          setReturnFlowers([])
          setFloatingPetals([])
          setFlowersFading(false)
        }, 2000)
      }, 6000)
    }
  }, [runaway.active, runaway.checkpoints, missionsRequired, completeRunawayReturn])

  // Spawn flowers at each hop landing during return animation
  useEffect(() => {
    if (!returnAnimating) return
    const sectionEl = hunchieSectionRef.current
    const trackEl = returnTrackRef.current
    if (!sectionEl || !trackEl) return

    const startTime = performance.now()
    // Landing times matching CSS hop keyframes (% of 6s)
    const LAND_TIMES = [960, 1620, 2280, 2940, 3600, 4260]
    const BURST_TIME = 4500
    let hopsTriggered = 0
    let burstDone = false
    let fid = 0

    const spawnCluster = (cx: number, cy: number, count: number) => {
      const flowers: ReturnFlower[] = Array.from({ length: count }, (_, i) => ({
        id: fid++,
        x: cx + (Math.random() - 0.5) * 50,
        y: cy + (Math.random() - 0.5) * 16,
        type: FLOWER_VARIANTS[Math.floor(Math.random() * FLOWER_VARIANTS.length)],
        delay: i * 0.05,
        scale: 0.7 + Math.random() * 0.5,
        swayDur: 2 + Math.random() * 2,
      }))
      setReturnFlowers(prev => [...prev, ...flowers])
    }

    const spawnBurst = (cx: number, cy: number) => {
      const count = 12
      const flowers: ReturnFlower[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 55 + Math.random() * 35
        return {
          id: fid++,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius * 0.5,
          type: FLOWER_VARIANTS[Math.floor(Math.random() * FLOWER_VARIANTS.length)],
          delay: (i / count) * 0.5,
          scale: 0.8 + Math.random() * 0.4,
          swayDur: 2 + Math.random() * 2,
        }
      })
      setReturnFlowers(prev => [...prev, ...flowers])
      // Floating petals
      const colors = ['#F8BBD0', '#CE93D8', '#FFF176', '#90CAF9', 'white', '#F48FB1']
      setFloatingPetals(Array.from({ length: 10 }, (_, i) => ({
        id: i, x: cx + (Math.random() - 0.5) * 100, y: cy + (Math.random() - 0.5) * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6, drift: (Math.random() - 0.5) * 50, dur: 2 + Math.random() * 2,
      })))
    }

    const tick = (now: number) => {
      const elapsed = now - startTime
      const secRect = sectionEl.getBoundingClientRect()
      const tRect = trackEl.getBoundingClientRect()
      const x = tRect.left - secRect.left + tRect.width * 0.5
      const y = tRect.top - secRect.top + tRect.height * 0.9

      while (hopsTriggered < LAND_TIMES.length && elapsed >= LAND_TIMES[hopsTriggered]) {
        spawnCluster(x, y, 2 + Math.floor(Math.random() * 2))
        hopsTriggered++
      }
      if (!burstDone && elapsed >= BURST_TIME) {
        burstDone = true
        spawnBurst(x, y)
      }
      if (elapsed < 6000) {
        returnFlowerRaf.current = requestAnimationFrame(tick)
      }
    }

    returnFlowerRaf.current = requestAnimationFrame(tick)
    return () => {
      if (returnFlowerRaf.current) cancelAnimationFrame(returnFlowerRaf.current)
    }
  }, [returnAnimating])

  // When user skips a Pomodoro break, Hunchie looks sad briefly
  const handleSkipPomodoroBreak = useCallback(() => {
    setForceSlump(true)
    clearTimeout(slumpTimer.current)
    slumpTimer.current = setTimeout(() => setForceSlump(false), 2000)
  }, [])

  // Treats always auto-save to inventory
  const handleTreatEarned = useCallback((treat: TreatType) => {
    setTreatInventory(prev => [...prev, treat])
  }, [])

  const handleBreakCompleted = useCallback(() => {}, [])
  const handleBreakSkipped = useCallback(() => {}, [])

  // Recovery mission picker — alternates categories, no repeats until cycled
  const pickMission = useCallback((forceCategory?: 'prod' | 'care') => {
    const cat = forceCategory ?? (lastRecoveryCategory.current === 'prod' ? 'care' : 'prod')
    lastRecoveryCategory.current = cat
    const pool = cat === 'prod' ? RECOVERY_PRODUCTIVITY : RECOVERY_SELFCARE
    const shown = cat === 'prod' ? shownRecoveryProd : shownRecoveryCare
    if (shown.current.size >= pool.length) shown.current.clear()
    const available = pool.map((m, i) => ({ m, i })).filter(({ i }) => !shown.current.has(i))
    const pick = available[Math.floor(Math.random() * available.length)]
    shown.current.add(pick.i)
    return pick.m
  }, [])

  const handleOpenRecovery = useCallback(() => {
    setRecoveryOpen(true)
    setCurrentMission(pickMission())
  }, [pickMission])

  const handleRegenerateMission = useCallback(() => {
    // Swap to OTHER category
    const other = lastRecoveryCategory.current === 'prod' ? 'care' : 'prod'
    setCurrentMission(pickMission(other))
  }, [pickMission])

  const handleCompleteMission = useCallback(() => {
    addRunawayCheckpoint()
    const checkpointIdx = runaway.checkpoints
    setTrailTreats(prev => {
      const next = [...prev]
      const pool: TreatType[] = ['blueberries', 'apple', 'strawberry', 'acorn', 'grapes']
      next[checkpointIdx] = pool[checkpointIdx % pool.length]
      return next
    })
    // If there are more missions, pick next one
    if (runaway.checkpoints + 1 < missionsRequired) {
      setCurrentMission(pickMission())
    } else {
      // All done — close recovery panel, return animation will trigger via effect
      setRecoveryOpen(false)
    }
  }, [runaway.checkpoints, missionsRequired, addRunawayCheckpoint, pickMission])

  const handleDismissCelebration = useCallback(() => {
    // Full cleanup of all blocking states after animation/celebration
    setShowReturnCelebration(false)
    setDepartureAnimating(false)
    setReturnAnimating(false)
    setEatingTreat(null)
    setPendingFeed(null)
    isReturning.current = false
    ;(window as any).HUNCHIE_RETURN_IN_PROGRESS = false
    console.log('[Return] Celebration dismissed — all blocking states cleared')
  }, [])

  // Feed from inventory — starts eating animation, then applies healing on completion
  const handleInventoryFeed = useCallback((index: number) => {
    if (runaway.active || eatingTreat) return
    if (sessionHealth >= MAX_HEALTH) return
    const treat = treatInventory[index]
    if (!treat) return

    // Start eating animation
    setEatingTreat(treat)
    setPendingFeed({ treat, index })
    setTreatInventory(prev => prev.filter((_, i) => i !== index))
  }, [sessionHealth, treatInventory, runaway.active, eatingTreat])

  // Called when eating animation completes
  const handleEatingComplete = useCallback(() => {
    if (!pendingFeed) {
      setEatingTreat(null)
      return
    }
    const meta = TREAT_TIERS[pendingFeed.treat]

    // Legendary mushroom: in strict mode heals 80% of max instead of full
    let healAmt = meta.healAmount
    if (meta.tier === 'legendary' && !strictness.legendaryFullHeal) {
      healAmt = Math.round(MAX_HEALTH * 0.8)
    }
    feedHunchie(healAmt)

    // Remove bandaids based on tier
    if (meta.bandaidsRemoved === 'all') {
      hunchieRef.current?.removeAllBandaids()
    } else {
      hunchieRef.current?.removeBandaids(meta.bandaidsRemoved)
    }

    setEatingTreat(null)
    setPendingFeed(null)
  }, [pendingFeed, feedHunchie, strictness, MAX_HEALTH])

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.endedAt),
    [sessions]
  )

  const lastSession = useMemo(() => {
    if (completedSessions.length === 0) return null
    return completedSessions
      .slice()
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())[0]
  }, [completedSessions])

  const todaySessions = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return completedSessions.filter((s) => new Date(s.endedAt!) >= today)
  }, [completedSessions])

  const weekSessions = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    return completedSessions
      .filter((s) => new Date(s.endedAt!) >= weekAgo)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime())
  }, [completedSessions])

  const todayStats = useMemo(() => {
    if (todaySessions.length === 0) return null
    const totalMins = todaySessions.reduce((acc, s) => {
      if (!s.endedAt) return acc
      const ms = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
      return acc + ms / 60000
    }, 0)
    const totalHunches = todaySessions.reduce((acc, s) => acc + s.hits.length, 0)
    return {
      durationMins: Math.round(totalMins),
      hunches: totalHunches,
      sessionCount: todaySessions.length,
      lastSession,
      mood: lastSession ? getPostSessionMood(lastSession) : 'calm' as HunchieMood,
    }
  }, [todaySessions, lastSession])

  const baseMood = useMemo(
    () => getHunchieMood(currentSession?.hits ?? [], 5),
    [currentSession?.hits, now]
  )
  // Override mood to 'sad' briefly when user skips a Pomodoro break
  const mood = forceSlump ? 'sad' as HunchieMood : baseMood

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleStartSession = () => {
    departureTriggered.current = false
    returnTriggered.current = false
    isReturning.current = false
    ;(window as any).HUNCHIE_RETURN_IN_PROGRESS = false
    if (runaway.active) {
      completeRunawayReturn()
    }
    hunchieRef.current?.removeAllBandaids()
    startSession()
  }
  const handleRestartSession = () => {
    endSession()
    hunchieRef.current?.removeAllBandaids()
    startSession()
  }
  const handleEndSession = () => {
    endSession()
    navigate('/summary', { replace: true })
  }
  const hunchieIsAway = runaway.active && runaway.departureComplete
  const isAnimating = !!departureAnimating || !!returnAnimating || !!eatingTreat || showReturnCelebration

  // Safety timeout: if isAnimating stays true for 10+ seconds, force-clear all blocking states
  const animSafetyRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (isAnimating) {
      animSafetyRef.current = setTimeout(() => {
        console.warn('isAnimating safety reset triggered — force-clearing blocking states')
        setDepartureAnimating(false)
        setReturnAnimating(false)
        setEatingTreat(null)
        setPendingFeed(null)
        setShowReturnCelebration(false)
        isReturning.current = false
        ;(window as any).HUNCHIE_RETURN_IN_PROGRESS = false
      }, 10000)
    } else {
      clearTimeout(animSafetyRef.current)
    }
    return () => clearTimeout(animSafetyRef.current)
  }, [isAnimating])

  // ── Central hit gate — single source of truth ──
  const canBeHit = sessionHealth > 0 && !sessionPaused && !hunchieIsAway && !isAnimating && !isReturning.current

  const HP_PER_HIT: Record<string, number> = { light: strictness.mildDmg, medium: strictness.medDmg, heavy: strictness.sevDmg }
  const handleLogHit = (severity: HitLog['severity']) => {
    if (!canBeHit) return
    addHit(severity, 'hit')
    setHitTrigger(prev => ({
      count: prev.count + 1,
      severity,
      hpDeducted: HP_PER_HIT[severity],
      timestamp: Date.now(),
    }))
    setHitMessage(pickHitMessage(severity))
    setReturnQuote(null)
  }

  // ── Idle: Ginelle's dashboard — TODAY + THIS WEEK ──
  const visibleStats = settings.dailyStats ?? ['minutes', 'hunches', 'mood', 'weekList']
  const showMinutes = visibleStats.includes('minutes')
  const showHunches = visibleStats.includes('hunches')
  const showMood = visibleStats.includes('mood')
  const showWeekList = visibleStats.includes('weekList')

  if (!currentSession) {
    return (
      <div className={styles.page}>
        <CoachMarks
          force={showCoachMarks}
          onDismiss={() => setShowCoachMarks(false)}
          onComplete={() => setTreatInventory(prev => [...prev, 'apple'])}
        />
        <div className={styles.dashboard}>
          <h1 className={styles.dashboardTitle}>Hey, {userName || 'there'}!</h1>

          <section className={styles.todaySection} data-coach="today">
            <h2 className={styles.sectionLabel}>TODAY</h2>
            {todayStats ? (
              <>
                {(showMinutes || showHunches) && (
                  <div className={styles.todayStats}>
                    {showMinutes && (
                      <div className={styles.todayStat}>
                        <span className={styles.todayStatValue}>{todayStats.durationMins}</span>
                        <span className={styles.todayStatLabel}>min</span>
                      </div>
                    )}
                    {showHunches && (
                      <div className={styles.todayStat}>
                        <span className={styles.todayStatValue}>{todayStats.hunches}</span>
                        <span className={styles.todayStatLabel}>hunches</span>
                      </div>
                    )}
                  </div>
                )}
                {showMood && (
                  <div className={styles.todayHunchie}>
                    <HunchieAvatar mood={todayStats.mood} size="large" className={styles.avatar} />
                    <p className={styles.moodCaption}>
                      {todayStats.mood === 'sleepy' && "Hunchie's sleepy — not distraught with your session."}
                      {todayStats.mood === 'happy' && "Hunchie's happy. Great posture today!"}
                      {todayStats.mood === 'calm' && "Hunchie's calm. Nice work."}
                      {todayStats.mood === 'sad' && "Hunchie noticed some slouching."}
                      {todayStats.mood === 'annoyed' && "Hunchie's a bit annoyed — try to sit up more next time."}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.noToday}>No sessions today yet. Start one below.</p>
            )}
          </section>

          {showWeekList && (
            <section className={styles.weekSection}>
              <h2 className={styles.sectionLabel}>THIS WEEK</h2>
              {weekSessions.length === 0 ? (
                <p className={styles.noWeek}>No sessions this week yet.</p>
              ) : (
                <ul className={styles.weekList}>
                  {weekSessions.slice(0, 7).map((s) => {
                    const start = new Date(s.startedAt)
                    const end = s.endedAt ? new Date(s.endedAt) : null
                    const mins = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0
                    return (
                      <li key={s.id} className={styles.weekItem}>
                        <span className={styles.weekDate}>{start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className={styles.weekMeta}>{mins} min · {s.hits.length} hunches</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          <Button variant="pink" onClick={handleStartSession} className={styles.startBtn} data-coach="start-session">
            Start session
          </Button>

          {isDemo && (
            <p className={styles.demoHint}>
              Demo mode — use buttons during a session to simulate posture events.
            </p>
          )}

          <nav className={styles.navLinks}>
            <button type="button" className={styles.navLink} onClick={() => navigate('/trends')} data-coach="trends">
              Trends
            </button>
            <button type="button" className={styles.navLink} onClick={() => navigate('/settings')} data-coach="settings">
              Settings
            </button>
            {lastSession && (
              <button type="button" className={styles.navLink} onClick={() => navigate('/summary')}>
                Last summary
              </button>
            )}
          </nav>
        </div>
      </div>
    )
  }

  // ── Active session: meadow BG, pause/restart/feed, health + treats ──
  return (
    <div className={`${styles.page} ${styles.sessionActive}`}>
      <PomodoroTimer
        paused={sessionPaused || hunchieIsAway || departureAnimating || returnAnimating}
        onSkipBreak={handleSkipPomodoroBreak}
        onTreatEarned={handleTreatEarned}
        onBreakCompleted={handleBreakCompleted}
        onBreakSkipped={handleBreakSkipped}
      />

      {showReturnCelebration && (
        <div className={styles.returnCelebration}>
          <div className={styles.returnCard}>
            <h2 className={styles.returnTitle}>Hunchie is back!! 🎉🦔</h2>
            <p className={styles.returnSub}>Hunchie missed you! Let's keep going together.</p>
            <Button variant="teal" onClick={handleDismissCelebration} className={styles.returnDismissBtn}>
              Welcome back!
            </Button>
          </div>
        </div>
      )}

      <CoachMarks
        force={showCoachMarks}
        onDismiss={() => setShowCoachMarks(false)}
        onComplete={() => setTreatInventory(prev => [...prev, 'apple'])}
      />

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.settingsBtn} onClick={() => navigate('/settings')} aria-label="Settings">
            <span className={styles.settingsIcon}>⚙</span>
            <span className={styles.settingsLabel}>Settings</span>
          </button>
          <button type="button" className={styles.helpBtn} onClick={() => setShowCoachMarks(true)} aria-label="Help">
            ?
          </button>
        </div>
        <Button variant="pink" onClick={handleEndSession} className={styles.endHeaderBtn}>End Session</Button>
      </header>

      {/* Pause / Restart / Feed bar */}
      <section className={styles.sessionControls}>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={sessionPaused ? resumeSession : pauseSession}
            title={sessionPaused ? 'Resume' : 'Pause'}
            aria-label={sessionPaused ? 'Resume session' : 'Pause session'}
          >
            {sessionPaused ? (
              <span className={styles.controlIcon} aria-hidden>▶</span>
            ) : (
              <span className={styles.controlIcon} aria-hidden>⏸</span>
            )}
          </button>
          <span className={styles.controlLabel}>{sessionPaused ? 'Resume' : 'Pause'}</span>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={handleRestartSession}
            title="Restart session"
            aria-label="Restart session"
          >
            <span className={styles.controlIcon} aria-hidden>↻</span>
          </button>
          <span className={styles.controlLabel}>Restart</span>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => {
              if (hunchieIsAway || eatingTreat) return
              if (treatInventory.length > 0 && sessionHealth < MAX_HEALTH) {
                handleInventoryFeed(0)
              }
            }}
            disabled={treatInventory.length < 1 || sessionHealth >= MAX_HEALTH || hunchieIsAway || !!eatingTreat}
            title={hunchieIsAway ? 'Hunchie is away' : treatInventory.length >= 1 && sessionHealth < MAX_HEALTH ? 'Feed Hunchie (restore health)' : 'No treats or Hunchie is full'}
            aria-label={hunchieIsAway ? 'Hunchie is away' : treatInventory.length >= 1 ? 'Feed Hunchie' : 'No treats to feed'}
          >
            <span className={styles.controlIcon} aria-hidden>🍎</span>
          </button>
          <span className={styles.controlLabel}>Feed</span>
        </div>
        <TreatInventory
          treats={treatInventory}
          canFeed={sessionHealth < MAX_HEALTH && !eatingTreat}
          sessionHealth={sessionHealth}
          maxHealth={MAX_HEALTH}
          onFeed={handleInventoryFeed}
          hunchieAway={hunchieIsAway}
        />
      </section>

      <div className={styles.healthBar}>
        <span className={styles.healthLabel}>HP</span>
        <div className={styles.healthTrack}>
          <div className={styles.healthFill} style={{ width: `${Math.round((sessionHealth / MAX_HEALTH) * 100)}%` }} />
        </div>
        <span className={styles.hpNumber}>{sessionHealth}</span>
      </div>

      <section className={styles.hunchieSection} ref={hunchieSectionRef}>
        {/* Background image layer */}
        <BackgroundLayer />

        {/* Eating animation overlay */}
        {eatingTreat && (
          <EatingAnimation treat={eatingTreat} onComplete={handleEatingComplete} />
        )}

        {/* Hunchie is present */}
        {!hunchieIsAway && !departureAnimating && !returnAnimating && (
          <>
            <div className={styles.hunchieShadow}>
              <HunchieAnimated ref={hunchieRef} mood={mood} size={240} hitTrigger={hitTrigger} />
            </div>
            <p className={styles.moodLabel}>
              {returnQuote
                ? returnQuote
                : hitMessage
                  ? hitMessage
                  : mood === 'happy'
                    ? "You're doing great! No hits detected."
                    : mood === 'calm'
                      ? 'Keep it up — looking good.'
                      : mood === 'sad'
                        ? 'A few posture events. Try to sit tall!'
                        : "Lots of slouching — let's reset and sit up!"}
            </p>
          </>
        )}

        {/* Departure animation */}
        {departureAnimating && (
          <div className={styles.departureScene} ref={departureSceneRef}>
            <div className={styles.departureHunchie} ref={departureHunchieRef}>
              <HunchieAnimated ref={hunchieRef} mood="sad" size={200} hitTrigger={hitTrigger} />
            </div>
            {departureFootprints.map(fp => (
              <svg
                key={fp.id}
                className={styles.pawPrint}
                style={{ left: fp.x - 18, top: fp.y - 22, transform: `rotate(${fp.isLeft ? -10 : 10}deg)` } as CSSProperties}
                width="36" height="44" viewBox="0 0 36 44"
              >
                {/* Main pad */}
                <ellipse cx="18" cy="30" rx="10" ry="12" fill="#8D6E63" />
                {/* Toe dots */}
                <circle cx="8" cy="13" r="4.5" fill="#8D6E63" />
                <circle cx="18" cy="9" r="4.5" fill="#8D6E63" />
                <circle cx="28" cy="13" r="4.5" fill="#8D6E63" />
                <circle cx="13" cy="7" r="3" fill="#8D6E63" />
              </svg>
            ))}
            <div className={styles.fallingLeaves}>
              <span className={styles.driftLeaf} style={{ left: '30%', animationDelay: '3s' }}>🍂</span>
              <span className={styles.driftLeaf} style={{ left: '60%', animationDelay: '3.5s' }}>🍃</span>
            </div>
          </div>
        )}

        {/* Empty state — Hunchie is away */}
        {hunchieIsAway && !returnAnimating && (
          <div className={styles.emptyState}>
            <div className={styles.emptySpot}>
              <span className={styles.fallenLeaf} style={{ left: '25%', top: '60%' }}>🍂</span>
              <span className={styles.fallenLeaf} style={{ left: '55%', top: '70%' }}>🍃</span>
              <span className={styles.fallenLeaf} style={{ left: '40%', top: '75%' }}>🍂</span>
              {/* Settled footprint trail from departure */}
              {departureFootprints.map(fp => (
                <svg
                  key={fp.id}
                  className={styles.pawPrintSettled}
                  style={{ left: fp.x - 18, top: fp.y - 22, transform: `rotate(${fp.isLeft ? -10 : 10}deg)` } as CSSProperties}
                  width="36" height="44" viewBox="0 0 36 44"
                >
                  <ellipse cx="18" cy="30" rx="10" ry="12" fill="#8D6E63" />
                  <circle cx="8" cy="13" r="4.5" fill="#8D6E63" />
                  <circle cx="18" cy="9" r="4.5" fill="#8D6E63" />
                  <circle cx="28" cy="13" r="4.5" fill="#8D6E63" />
                  <circle cx="13" cy="7" r="3" fill="#8D6E63" />
                </svg>
              ))}
            </div>

            {/* Note card + open tasks button */}
            {!recoveryOpen && (
              <>
                <div className={styles.noteCard}>
                  <p className={styles.awayNote}>{runawayNote}</p>
                  <p className={styles.awaySubnote}>Complete {missionsRequired} recovery tasks to bring Hunchie back!</p>
                  <p className={styles.scaredCount}>Times scared away: {runaway.runawayCount}</p>
                </div>
                <Button variant="teal" onClick={handleOpenRecovery} className={styles.recoveryStartBtn}>
                  Start Recovery Tasks 🍂
                </Button>
              </>
            )}

            {/* Recovery task card */}
            {recoveryOpen && (
              <div className={styles.recoveryCard}>
                <div className={styles.recoveryHeader}>
                  <span className={styles.recoveryLeaf}>🍂</span>
                  <h3 className={styles.recoveryTitle}>Recovery Mission</h3>
                  <span className={styles.recoveryProgress}>
                    {runaway.checkpoints}/{missionsRequired}
                  </span>
                </div>
                <p className={styles.recoveryMission}>{currentMission}</p>
                <div className={styles.recoveryActions}>
                  <Button variant="teal" onClick={handleCompleteMission} className={styles.recoveryBtn}>
                    Done! ✓
                  </Button>
                  <Button variant="yellow" onClick={handleRegenerateMission} className={styles.recoveryBtn}>
                    Try another 🔄
                  </Button>
                </div>
              </div>
            )}

            {/* Trail progress bar */}
            <div className={styles.trail}>
              <div className={styles.trailPath} />
              {Array.from({ length: missionsRequired }).map((_, i) => {
                const icon = i === missionsRequired - 1 ? '🏠' : TRAIL_ICON_POOL[i % (TRAIL_ICON_POOL.length - 1)]
                const leftPct = missionsRequired === 1 ? 50 : 15 + (i / (missionsRequired - 1)) * 70
                return (
                  <div
                    key={i}
                    className={`${styles.checkpoint} ${runaway.checkpoints > i ? styles.checkpointActive : ''}`}
                    style={{ left: `${leftPct}%` }}
                  >
                    <span className={styles.checkpointIcon}>{icon}</span>
                    {trailTreats[i] && runaway.checkpoints > i && (
                      <span className={styles.checkpointTreat}>
                        {TREAT_EMOJI[trailTreats[i]!]}
                      </span>
                    )}
                  </div>
                )
              })}
              <div className={styles.trailDecorations}>
                <span className={styles.trailMushroom}>🍄</span>
                <span className={styles.trailLeaf}>🌿</span>
                <span className={styles.trailMushroom} style={{ left: '70%' }}>🍄</span>
              </div>
            </div>

            {/* Peeking Hunchie hints */}
            {runaway.checkpoints >= Math.ceil(missionsRequired * 0.4) && runaway.checkpoints < Math.ceil(missionsRequired * 0.7) && (
              <div className={styles.bushRustle}>
                <span className={styles.rustleEmoji}>🌿</span>
              </div>
            )}
            {runaway.checkpoints >= Math.ceil(missionsRequired * 0.7) && runaway.checkpoints < missionsRequired && (
              <div className={styles.peekingEyes}>
                <span className={styles.peekEmoji}>👀</span>
                <div className={styles.peekBush}>🌳</div>
              </div>
            )}
          </div>
        )}

        {/* Return animation — bouncy hops */}
        {returnAnimating && (
          <div className={styles.returnScene}>
            <div className={styles.returnTrack} ref={returnTrackRef}>
              <div className={styles.returnHop}>
                <HunchieAnimated ref={hunchieRef} mood="happy" size={200} hitTrigger={hitTrigger} />
              </div>
            </div>
          </div>
        )}

        {/* Return flowers layer */}
        {returnFlowers.length > 0 && (
          <div className={`${styles.flowersLayer} ${flowersFading ? styles.flowersFadeOut : ''}`}>
            {returnFlowers.map(f => (
              <div
                key={f.id}
                className={styles.flowerItem}
                style={{
                  left: f.x,
                  top: f.y,
                  '--bloom-delay': `${f.delay}s`,
                  '--stem-delay': `${f.delay}s`,
                  '--sway-dur': `${f.swayDur}s`,
                  transform: `scale(${f.scale})`,
                } as CSSProperties}
              >
                <div className={styles.flowerBloomWrap}>
                  <FlowerSVG type={f.type} />
                </div>
                <div className={styles.flowerSparkle} />
                <div className={styles.flowerStem} />
              </div>
            ))}
            {floatingPetals.map(p => (
              <div
                key={p.id}
                className={styles.floatingPetal}
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  '--petal-drift': `${p.drift}px`,
                  animationDuration: `${p.dur}s`,
                } as CSSProperties}
              />
            ))}
          </div>
        )}

        <div className={styles.liveStats}>
          <span>{currentSession.hits.length} hits</span>
        </div>
      </section>

      <section className={styles.logSection}>
        <h2 className={styles.sectionTitle}>Event log</h2>

        <p className={styles.hitButtonsLabel}>Log a hit</p>
        <div className={styles.hitButtons}>
          <Button variant="yellow" onClick={() => handleLogHit('light')} className={styles.hitBtn} disabled={!canBeHit}>
            Mild hit
          </Button>
          <Button variant="orange" onClick={() => handleLogHit('medium')} className={styles.hitBtn} disabled={!canBeHit}>
            Medium hit
          </Button>
          <Button variant="pink" onClick={() => handleLogHit('heavy')} className={styles.hitBtn} disabled={!canBeHit}>
            Severe hit
          </Button>
        </div>

        <div className={styles.hitLog}>
          {currentSession.hits.length === 0 ? (
            <p className={styles.emptyLog}>
              No events yet. Tap a button above to log a hit.
            </p>
          ) : (
            currentSession.hits
              .slice()
              .reverse()
              .map((h) => (
                <div key={h.id} className={styles.hitRow}>
                  <span className={styles.hitTime}>{formatTime(new Date(h.timestamp))}</span>
                  <span className={styles.hitSeverity}>{formatSeverity(h.severity)}</span>
                </div>
              ))
          )}
        </div>
      </section>

    </div>
  )
}
