import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { HitLog, Session, UserSettings, StrictnessConfig } from '../types'
import { STRICTNESS } from '../types'
import { generateDemoSessions } from '../data/demoData'

const STORAGE_KEY = 'hunchie-data'

const defaultSettings: UserSettings = {
  goal: 'Standard',
  nudgeFrequency: 'Daily + Weekly',
  insights: 'On',
  background: 'clouds',
}

interface StoredData {
  userName: string | null
  deviceName: string | null
  onboardingComplete: boolean
  sessions: Session[]
  settings: UserSettings
}

const defaultStored: StoredData = {
  userName: null,
  deviceName: null,
  onboardingComplete: false,
  sessions: [],
  settings: defaultSettings,
}

function createDemoData(): StoredData {
  return {
    userName: 'Christina',
    deviceName: 'Hunchie (Demo)',
    onboardingComplete: false,
    sessions: generateDemoSessions(),
    settings: defaultSettings,
  }
}

function loadStored(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // First visit — seed with demo data for Christina
      const demo = createDemoData()
      saveStored(demo)
      return demo
    }
    const parsed = JSON.parse(raw) as StoredData
    if (!parsed.settings) parsed.settings = defaultSettings
    // Rehydrate dates
    parsed.sessions = (parsed.sessions || []).map((s: Session) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
      hits: (s.hits || []).map((h: HitLog) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      })),
    }))
    return { ...defaultStored, ...parsed }
  } catch {
    return defaultStored
  }
}

function saveStored(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const HEALTH_PER_TREAT = 20
const RUNAWAY_NOTES = [
  "Hunchie needed to rest in the forest for a while... \uD83C\uDF42",
  "Hunchie went to visit a friend in the forest... \uD83C\uDF32",
  "Hunchie is napping under a big oak tree... \uD83C\uDF43",
  "Hunchie went on a little adventure... \uD83D\uDDFA\uFE0F",
]

export interface RunawayState {
  active: boolean
  checkpoints: number
  runawayCount: number
  departureComplete: boolean
}

interface AppState {
  userName: string | null
  deviceName: string | null
  onboardingComplete: boolean
  sessions: Session[]
  currentSession: Session | null
  sessionPaused: boolean
  sessionHealth: number
  sessionTreats: number
  runaway: RunawayState
}

interface AppContextValue extends AppState {
  isDemo: boolean
  settings: UserSettings
  strictness: StrictnessConfig
  maxHealth: number
  runawayNote: string
  missionsRequired: number
  completeOnboarding: (name: string, deviceName: string) => void
  startSession: () => Session
  endSession: () => void
  addHit: (severity: HitLog['severity'], type: 'hit' | 'slouch') => void
  pauseSession: () => void
  resumeSession: () => void
  takeBreak: () => void
  feedHunchie: (healAmount?: number) => void
  triggerRunaway: () => void
  addRunawayCheckpoint: () => void
  completeRunawayReturn: () => void
  setDepartureComplete: () => void
  updateSessionNotes: (
    sessionId: string,
    notes: { environmentComfort?: Session['environmentComfort']; environmentState?: Session['environmentState']; userNotes?: string }
  ) => void
  updateSettings: (partial: Partial<UserSettings>) => void
  replayOnboarding: () => void
  resetOnboarding: () => void
  resetToDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredData>(loadStored)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const currentSessionRef = useRef<Session | null>(null)
  useEffect(() => { currentSessionRef.current = currentSession }, [currentSession])
  const [sessionPaused, setSessionPaused] = useState(false)
  const [sessionHealth, setSessionHealth] = useState<number>(() => STRICTNESS[loadStored().settings?.goal ?? 'Standard'].maxHp)
  const [sessionTreats, setSessionTreats] = useState(0)
  const [runaway, setRunaway] = useState<RunawayState>(() => {
    try {
      const saved = localStorage.getItem('hunchie-runaway')
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return { active: false, checkpoints: 0, runawayCount: 0, departureComplete: false }
  })

  const isDemo = useMemo(
    () => stored.deviceName?.toLowerCase().includes('demo') ?? true,
    [stored.deviceName]
  )

  const strictness = useMemo(
    () => STRICTNESS[stored.settings?.goal ?? 'Standard'],
    [stored.settings?.goal]
  )
  const maxHealth = strictness.maxHp

  const persist = useCallback((updater: (prev: StoredData) => StoredData) => {
    setStored((prev) => {
      const next = updater(prev)
      saveStored(next)
      return next
    })
  }, [])

  const completeOnboarding = useCallback(
    (name: string, deviceName: string) => {
      persist((prev) => ({
        ...prev,
        userName: name,
        deviceName,
        onboardingComplete: true,
      }))
    },
    [persist]
  )

  const startSession = useCallback(() => {
    const session: Session = {
      id: `session-${Date.now()}`,
      startedAt: new Date(),
      hits: [],
    }
    setCurrentSession(session)
    setSessionPaused(false)
    setSessionHealth(maxHealth)
    setSessionTreats(0)
    persist((prev) => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }))
    return session
  }, [persist, maxHealth])

  const endSession = useCallback(() => {
    if (!currentSession) return
    const ended = {
      ...currentSession,
      endedAt: new Date(),
    }
    persist((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === currentSession.id ? ended : s
      ),
    }))
    setCurrentSession(null)
  }, [currentSession, persist])

  const addHit = useCallback(
    (severity: HitLog['severity'], type: 'hit' | 'slouch') => {
      const session = currentSessionRef.current
      if (!session) return
      const hit: HitLog = {
        id: `hit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sessionId: session.id,
        timestamp: new Date(),
        severity,
        type,
      }
      const dmgMap = { light: strictness.mildDmg, medium: strictness.medDmg, heavy: strictness.sevDmg }
      setSessionHealth((h) => Math.max(0, h - dmgMap[severity]))
      setCurrentSession((prev) =>
        prev ? { ...prev, hits: [...prev.hits, hit] } : null
      )
      persist((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === session.id
            ? { ...s, hits: [...s.hits, hit] }
            : s
        ),
      }))
    },
    [persist, strictness]
  )

  const pauseSession = useCallback(() => setSessionPaused(true), [])
  const resumeSession = useCallback(() => setSessionPaused(false), [])

  const takeBreak = useCallback(() => {
    setSessionTreats((t) => t + 1)
  }, [])

  const feedHunchie = useCallback((healAmount?: number) => {
    const base = healAmount ?? HEALTH_PER_TREAT
    const healed = Math.round(base * strictness.healMultiplier)
    setSessionHealth((h) => Math.min(maxHealth, h + healed))
  }, [strictness, maxHealth])

  const triggerRunaway = useCallback(() => {
    setRunaway(prev => {
      const next = {
        active: true,
        checkpoints: 0,
        runawayCount: prev.runawayCount + 1,
        departureComplete: false,
      }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
  }, [])

  const setDepartureComplete = useCallback(() => {
    setRunaway(prev => {
      const next = { ...prev, departureComplete: true }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
  }, [])

  const addRunawayCheckpoint = useCallback(() => {
    setRunaway(prev => {
      if (!prev.active) return prev
      // Cap based on strictness: scaling adds +1 per runaway up to recoveryCap
      let cap: number
      if (strictness.recoveryScaling) {
        cap = Math.min(strictness.baseRecoveryMissions + (prev.runawayCount - 1), strictness.recoveryCap)
      } else {
        cap = strictness.baseRecoveryMissions
      }
      const next = { ...prev, checkpoints: Math.min(prev.checkpoints + 1, cap) }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
  }, [strictness])

  const completeRunawayReturn = useCallback(() => {
    setRunaway(prev => {
      const next = { ...prev, active: false, checkpoints: 0, departureComplete: false }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
    setSessionHealth(maxHealth)
  }, [maxHealth])

  const runawayNote = useMemo(() => {
    const idx = Math.min(runaway.runawayCount - 1, RUNAWAY_NOTES.length - 1)
    return RUNAWAY_NOTES[Math.max(0, idx)]
  }, [runaway.runawayCount])

  // Scaling difficulty based on strictness config
  const missionsRequired = useMemo(() => {
    if (!strictness.recoveryScaling) return strictness.baseRecoveryMissions
    const count = runaway.runawayCount
    return Math.min(strictness.baseRecoveryMissions + Math.max(0, count - 1), strictness.recoveryCap)
  }, [runaway.runawayCount, strictness])

  const updateSettings = useCallback(
    (partial: Partial<UserSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }))
      // If goal changed, cap current HP to new max
      if (partial.goal) {
        const newMax = STRICTNESS[partial.goal].maxHp
        setSessionHealth((h) => Math.min(h, newMax))
      }
    },
    [persist]
  )

  const updateSessionNotes = useCallback(
    (
      sessionId: string,
      notes: {
        environmentComfort?: Session['environmentComfort']
        environmentState?: Session['environmentState']
        userNotes?: string
      }
    ) => {
      persist((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId ? { ...s, ...notes } : s
        ),
      }))
    },
    [persist]
  )

  const replayOnboarding = useCallback(() => {
    persist((prev) => ({ ...prev, onboardingComplete: false }))
  }, [persist])

  const resetOnboarding = useCallback(() => {
    setStored(defaultStored)
    saveStored(defaultStored)
    setCurrentSession(null)
  }, [])

  const resetToDemo = useCallback(() => {
    const demo = createDemoData()
    setStored(demo)
    saveStored(demo)
    setCurrentSession(null)
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ...stored,
      currentSession,
      sessionPaused,
      sessionHealth,
      sessionTreats,
      runaway,
      runawayNote,
      missionsRequired,
      isDemo,
      settings: stored.settings ?? defaultSettings,
      strictness,
      maxHealth,
      completeOnboarding,
      startSession,
      endSession,
      addHit,
      pauseSession,
      resumeSession,
      takeBreak,
      feedHunchie,
      triggerRunaway,
      addRunawayCheckpoint,
      completeRunawayReturn,
      setDepartureComplete,
      updateSessionNotes,
      updateSettings,
      replayOnboarding,
      resetOnboarding,
      resetToDemo,
    }),
    [
      stored,
      currentSession,
      sessionPaused,
      sessionHealth,
      sessionTreats,
      runaway,
      runawayNote,
      missionsRequired,
      isDemo,
      strictness,
      maxHealth,
      completeOnboarding,
      startSession,
      endSession,
      addHit,
      pauseSession,
      resumeSession,
      takeBreak,
      feedHunchie,
      triggerRunaway,
      addRunawayCheckpoint,
      completeRunawayReturn,
      setDepartureComplete,
      updateSessionNotes,
      updateSettings,
      replayOnboarding,
      resetOnboarding,
      resetToDemo,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
