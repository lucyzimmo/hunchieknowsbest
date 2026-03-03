import type { HitLog, HitSeverity, Session } from '../types'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const MIN = 60 * 1000

function hit(
  sessionId: string,
  index: number,
  sessionStart: number,
  offsetMin: number,
  severity: HitSeverity,
  type: 'hit' | 'slouch'
): HitLog {
  return {
    id: `demo-hit-${sessionId}-${index}`,
    sessionId,
    timestamp: new Date(sessionStart + offsetMin * MIN),
    severity,
    type,
  }
}

/**
 * Generates 7 demo sessions for Christina spanning the last 5 days.
 * The data tells a story: she starts rough and improves over time.
 */
export function generateDemoSessions(): Session[] {
  const now = Date.now()

  // Session 1: 5 days ago, morning – first session, lots of slouching
  const s1Start = now - 5 * DAY + 9 * HOUR
  const s1: Session = {
    id: 'demo-session-1',
    startedAt: new Date(s1Start),
    endedAt: new Date(s1Start + 28 * MIN),
    hits: [
      hit('demo-session-1', 1, s1Start, 2, 'medium', 'slouch'),
      hit('demo-session-1', 2, s1Start, 5, 'light', 'slouch'),
      hit('demo-session-1', 3, s1Start, 9, 'heavy', 'hit'),
      hit('demo-session-1', 4, s1Start, 12, 'medium', 'slouch'),
      hit('demo-session-1', 5, s1Start, 16, 'light', 'slouch'),
      hit('demo-session-1', 6, s1Start, 19, 'heavy', 'hit'),
      hit('demo-session-1', 7, s1Start, 23, 'medium', 'hit'),
      hit('demo-session-1', 8, s1Start, 26, 'light', 'slouch'),
    ],
    environmentComfort: 'chair',
    environmentState: 'noisy',
    userNotes: 'First time using Hunchie! Didn\'t realize how much I slouch.',
  }

  // Session 2: 4 days ago, afternoon – still adjusting
  const s2Start = now - 4 * DAY + 14 * HOUR
  const s2: Session = {
    id: 'demo-session-2',
    startedAt: new Date(s2Start),
    endedAt: new Date(s2Start + 22 * MIN),
    hits: [
      hit('demo-session-2', 1, s2Start, 4, 'light', 'slouch'),
      hit('demo-session-2', 2, s2Start, 7, 'medium', 'hit'),
      hit('demo-session-2', 3, s2Start, 11, 'light', 'slouch'),
      hit('demo-session-2', 4, s2Start, 14, 'medium', 'slouch'),
      hit('demo-session-2', 5, s2Start, 18, 'light', 'hit'),
      hit('demo-session-2', 6, s2Start, 20, 'heavy', 'hit'),
    ],
    environmentComfort: 'chair',
    environmentState: 'calm',
    userNotes: 'Better than yesterday but still catching myself.',
  }

  // Session 3: 3 days ago, morning – starting to improve
  const s3Start = now - 3 * DAY + 10 * HOUR
  const s3: Session = {
    id: 'demo-session-3',
    startedAt: new Date(s3Start),
    endedAt: new Date(s3Start + 30 * MIN),
    hits: [
      hit('demo-session-3', 1, s3Start, 6, 'light', 'slouch'),
      hit('demo-session-3', 2, s3Start, 13, 'light', 'slouch'),
      hit('demo-session-3', 3, s3Start, 19, 'medium', 'hit'),
      hit('demo-session-3', 4, s3Start, 25, 'light', 'slouch'),
      hit('demo-session-3', 5, s3Start, 28, 'light', 'hit'),
    ],
    environmentComfort: 'cushion',
    environmentState: 'calm',
    userNotes: 'Switched to a cushion, seems to help!',
  }

  // Session 4: 3 days ago, evening – tried floor sitting
  const s4Start = now - 3 * DAY + 19 * HOUR
  const s4: Session = {
    id: 'demo-session-4',
    startedAt: new Date(s4Start),
    endedAt: new Date(s4Start + 18 * MIN),
    hits: [
      hit('demo-session-4', 1, s4Start, 2, 'heavy', 'slouch'),
      hit('demo-session-4', 2, s4Start, 5, 'medium', 'slouch'),
      hit('demo-session-4', 3, s4Start, 8, 'heavy', 'hit'),
      hit('demo-session-4', 4, s4Start, 10, 'medium', 'slouch'),
      hit('demo-session-4', 5, s4Start, 13, 'medium', 'hit'),
      hit('demo-session-4', 6, s4Start, 15, 'light', 'slouch'),
      hit('demo-session-4', 7, s4Start, 17, 'medium', 'hit'),
    ],
    environmentComfort: 'floor',
    environmentState: 'mixed',
    userNotes: 'Floor sitting was tough — my back was not happy.',
  }

  // Session 5: 2 days ago – back to chair, much better
  const s5Start = now - 2 * DAY + 11 * HOUR
  const s5: Session = {
    id: 'demo-session-5',
    startedAt: new Date(s5Start),
    endedAt: new Date(s5Start + 35 * MIN),
    hits: [
      hit('demo-session-5', 1, s5Start, 10, 'light', 'slouch'),
      hit('demo-session-5', 2, s5Start, 22, 'light', 'slouch'),
      hit('demo-session-5', 3, s5Start, 30, 'light', 'hit'),
    ],
    environmentComfort: 'chair',
    environmentState: 'calm',
    userNotes: 'Really noticing improvements. Barely slouched!',
  }

  // Session 6: yesterday morning – great session
  const s6Start = now - 1 * DAY + 9 * HOUR
  const s6: Session = {
    id: 'demo-session-6',
    startedAt: new Date(s6Start),
    endedAt: new Date(s6Start + 25 * MIN),
    hits: [
      hit('demo-session-6', 1, s6Start, 12, 'light', 'slouch'),
      hit('demo-session-6', 2, s6Start, 20, 'light', 'hit'),
    ],
    environmentComfort: 'chair',
    environmentState: 'calm',
    userNotes: 'Feeling strong today, great posture awareness.',
  }

  // Session 7: earlier today – best session yet
  const s7Start = now - 3 * HOUR
  const s7: Session = {
    id: 'demo-session-7',
    startedAt: new Date(s7Start),
    endedAt: new Date(s7Start + 20 * MIN),
    hits: [
      hit('demo-session-7', 1, s7Start, 15, 'light', 'slouch'),
    ],
    environmentComfort: 'chair',
    environmentState: 'calm',
    userNotes: 'Best one yet! Only caught me once.',
  }

  return [s1, s2, s3, s4, s5, s6, s7]
}
