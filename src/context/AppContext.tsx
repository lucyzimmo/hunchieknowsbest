import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HitLog, Session, UserSettings } from '../types'
import { generateDemoSessions } from '../data/demoData'

const STORAGE_KEY = 'hunchie-data'

const defaultSettings: UserSettings = {
  goal: 'Standard',
  nudgeFrequency: 'Daily + Weekly',
  insights: 'On',
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

const MAX_HEALTH = 100
const HEALTH_PER_HIT = { light: 10, medium: 25, heavy: 50 }
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
  resetOnboarding: () => void
  resetToDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredData>(loadStored)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [sessionHealth, setSessionHealth] = useState(MAX_HEALTH)
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
    setSessionHealth(MAX_HEALTH)
    setSessionTreats(0)
    persist((prev) => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }))
    return session
  }, [persist])

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
      if (!currentSession) return
      const hit: HitLog = {
        id: `hit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sessionId: currentSession.id,
        timestamp: new Date(),
        severity,
        type,
      }
      setSessionHealth((h) => Math.max(0, h - HEALTH_PER_HIT[severity]))
      setCurrentSession((prev) =>
        prev ? { ...prev, hits: [...prev.hits, hit] } : null
      )
      persist((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === currentSession.id
            ? { ...s, hits: [...s.hits, hit] }
            : s
        ),
      }))
    },
    [currentSession, persist]
  )

  const pauseSession = useCallback(() => setSessionPaused(true), [])
  const resumeSession = useCallback(() => setSessionPaused(false), [])

  const takeBreak = useCallback(() => {
    setSessionTreats((t) => t + 1)
  }, [])

  const feedHunchie = useCallback((healAmount?: number) => {
    setSessionHealth((h) => Math.min(MAX_HEALTH, h + (healAmount ?? HEALTH_PER_TREAT)))
  }, [])

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
      const cap = prev.runawayCount <= 1 ? 3 : prev.runawayCount === 2 ? 4 : 5
      const next = { ...prev, checkpoints: Math.min(prev.checkpoints + 1, cap) }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
  }, [])

  const completeRunawayReturn = useCallback(() => {
    setRunaway(prev => {
      const next = { ...prev, active: false, checkpoints: 0, departureComplete: false }
      localStorage.setItem('hunchie-runaway', JSON.stringify(next))
      return next
    })
    setSessionHealth(MAX_HEALTH)
  }, [])

  const runawayNote = useMemo(() => {
    const idx = Math.min(runaway.runawayCount - 1, RUNAWAY_NOTES.length - 1)
    return RUNAWAY_NOTES[Math.max(0, idx)]
  }, [runaway.runawayCount])

  // Scaling difficulty: 1st runaway = 3 missions, 2nd = 4, 3rd+ = 5
  const missionsRequired = useMemo(() => {
    const count = runaway.runawayCount
    if (count <= 1) return 3
    if (count === 2) return 4
    return 5
  }, [runaway.runawayCount])

  const updateSettings = useCallback(
    (partial: Partial<UserSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }))
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
