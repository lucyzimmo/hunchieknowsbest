import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HitLog, Session } from '../types'
import { generateDemoSessions } from '../data/demoData'

const STORAGE_KEY = 'hunchie-data'

interface StoredData {
  userName: string | null
  deviceName: string | null
  onboardingComplete: boolean
  sessions: Session[]
}

const defaultStored: StoredData = {
  userName: null,
  deviceName: null,
  onboardingComplete: false,
  sessions: [],
}

function createDemoData(): StoredData {
  return {
    userName: 'Christina',
    deviceName: 'Hunchie (Demo)',
    onboardingComplete: true,
    sessions: generateDemoSessions(),
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

interface AppState {
  userName: string | null
  deviceName: string | null
  onboardingComplete: boolean
  sessions: Session[]
  currentSession: Session | null
}

interface AppContextValue extends AppState {
  isDemo: boolean
  completeOnboarding: (name: string, deviceName: string) => void
  startSession: () => Session
  endSession: () => void
  addHit: (severity: HitLog['severity'], type: 'hit' | 'slouch') => void
  updateSessionNotes: (
    sessionId: string,
    notes: { environmentComfort?: Session['environmentComfort']; environmentState?: Session['environmentState']; userNotes?: string }
  ) => void
  resetOnboarding: () => void
  resetToDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredData>(loadStored)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

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
      isDemo,
      completeOnboarding,
      startSession,
      endSession,
      addHit,
      updateSessionNotes,
      resetOnboarding,
      resetToDemo,
    }),
    [
      stored,
      currentSession,
      isDemo,
      completeOnboarding,
      startSession,
      endSession,
      addHit,
      updateSessionNotes,
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
