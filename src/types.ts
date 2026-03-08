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
export type BackgroundChoice = 'clouds' | 'sky' | 'stars' | 'pastel'

export interface StrictnessConfig {
  maxHp: number
  mildDmg: number
  medDmg: number
  sevDmg: number
  mildDelay: number   // seconds of inactivity before mild hit triggers
  medDelay: number
  sevDelay: number
  healMultiplier: number
  baseRecoveryMissions: number
  recoveryScaling: boolean
  recoveryCap: number
  legendaryFullHeal: boolean
}

export const STRICTNESS: Record<GoalLevel, StrictnessConfig> = {
  Gentle: {
    maxHp: 100,
    mildDmg: 5, medDmg: 15, sevDmg: 30,
    mildDelay: 600, medDelay: 1200, sevDelay: 1800,
    healMultiplier: 1.5,
    baseRecoveryMissions: 2,
    recoveryScaling: false,
    recoveryCap: 2,
    legendaryFullHeal: true,
  },
  Standard: {
    maxHp: 100,
    mildDmg: 10, medDmg: 25, sevDmg: 50,
    mildDelay: 300, medDelay: 900, sevDelay: 1500,
    healMultiplier: 1.0,
    baseRecoveryMissions: 3,
    recoveryScaling: true,
    recoveryCap: 5,
    legendaryFullHeal: true,
  },
  Strict: {
    maxHp: 100,
    mildDmg: 15, medDmg: 35, sevDmg: 70,
    mildDelay: 180, medDelay: 480, sevDelay: 900,
    healMultiplier: 0.75,
    baseRecoveryMissions: 4,
    recoveryScaling: true,
    recoveryCap: 7,
    legendaryFullHeal: false,
  },
}

export interface UserSettings {
  goal: GoalLevel
  nudgeFrequency: NudgeFrequency
  insights: InsightsLevel
  background: BackgroundChoice
}

/** Session gamification (Nikki): health points, treats from breaks */
export interface SessionGamification {
  healthPoints: number
  maxHealth: number
  treats: number
  lastBreakAt?: Date
}
