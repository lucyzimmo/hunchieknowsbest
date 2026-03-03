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

export type HunchieMood = 'happy' | 'sad' | 'annoyed' | 'calm' | 'sleepy'

/** Settings: one clear decision per screen (Lucy's flow) */
export type GoalLevel = 'Standard' | 'Gentle' | 'Strict'
export type NudgeFrequency = 'Daily' | 'Daily + Weekly' | 'Off'
export type InsightsLevel = 'On' | 'Off'

export interface UserSettings {
  goal: GoalLevel
  nudgeFrequency: NudgeFrequency
  insights: InsightsLevel
}

/** Session gamification (Nikki): health points, treats from breaks */
export interface SessionGamification {
  healthPoints: number
  maxHealth: number
  treats: number
  lastBreakAt?: Date
}
