export type HitSeverity = 'light' | 'medium' | 'heavy'

export interface HitLog {
  id: string
  sessionId: string
  timestamp: Date
  severity: HitSeverity
  type: 'hit' | 'slouch'
}

export interface Session {
  id: string
  startedAt: Date
  endedAt?: Date
  hits: HitLog[]
  /** If time allows: environment comfort, state, energy/emotional notes */
  environmentComfort?: 'chair' | 'floor' | 'cushion' | 'other'
  environmentState?: 'noisy' | 'calm' | 'mixed'
  userNotes?: string
}

export type HunchieMood = 'happy' | 'sad' | 'annoyed' | 'calm'
