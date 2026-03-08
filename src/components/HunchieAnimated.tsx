import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import type { HunchieMood } from '../types'
import styles from './HunchieAnimated.module.css'

interface Props {
  mood: HunchieMood
  size?: number
  className?: string
  hitTrigger?: { count: number; severity: 'light' | 'medium' | 'heavy'; hpDeducted?: number; timestamp?: number }
}

export interface HunchieAnimatedHandle {
  removeBandaid: (timestamp: number) => void
  removeBandaids: (count: number) => void
  removeAllBandaids: () => void
}

interface BandaidData {
  timestamp: number
  hpDeducted: number
  slotName: string
  x: number
  y: number
  rotation: number
  birthTime: number
}

const PARTS = {
  quills:    { x: 10,  y: 5,   w: 740, h: 753 },
  body:      { x: 0,   y: 50,  w: 521, h: 708 },
  head:      { x: 22,  y: 40,  w: 429, h: 341 },
  leftEar:   { x: 50,  y: 30,  w: 161, h: 146 },
  rightEar:  { x: 290, y: 50,  w: 171, h: 186 },
  leftArm:   { x: 41,  y: 400, w: 180, h: 211 },
  rightArm:  { x: 290, y: 260, w: 191, h: 206 },
  leftFoot:  { x: 65,  y: 590, w: 231, h: 168 },
  rightFoot: { x: 240, y: 610, w: 266, h: 148 },
  eye:       { x: 155, y: 80,  w: 171, h: 176 },
  mouth:     { x: 180, y: 265, w: 216, h: 136 },
} as const

const PIVOTS = {
  body:      [260, 400],
  head:      [236, 210],
  quills:    [380, 380],
  leftArm:   [130, 400],
  rightArm:  [290, 260],
  leftFoot:  [180, 590],
  rightFoot: [370, 610],
  leftEar:   [130, 103],
  rightEar:  [375, 143],
  eyes:      [240, 168],
  shadow:    [375, 750],
} as const

const BALL_CX = 260
const BALL_CY = 390
const BALL_R = 230

function scaleAt(cx: number, cy: number, sx: number, sy: number) {
  return `translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`
}

function rotateAt(cx: number, cy: number, deg: number) {
  return `rotate(${deg}, ${cx}, ${cy})`
}

function springDecay(t: number, freq: number, decay: number) {
  return Math.sin(t * freq) * Math.exp(-t * decay)
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

// Roll phase timings
const ROLL_CROUCH = 0.25
const ROLL_SWAP = 0.1
const ROLL_SPIN = 1.0
const ROLL_UNSWAP = 0.1
const ROLL_RECOVER = 0.25
const ROLL_TOTAL = ROLL_CROUCH + ROLL_SWAP + ROLL_SPIN + ROLL_UNSWAP + ROLL_RECOVER

type ReactionType = 'none' | 'bounce' | 'roll' | 'hitMild' | 'hitMedium' | 'hitSevere'

// Bandaid placement slots on different body parts (SVG coordinates)
const BANDAID_BODY_SLOTS = [
  { name: 'forehead',   x: 230, y: 120, rot: -25 },
  { name: 'leftCheek',  x: 175, y: 200, rot: -40 },
  { name: 'rightCheek', x: 310, y: 185, rot: 30 },
  { name: 'leftArm',    x: 110, y: 470, rot: -15 },
  { name: 'rightArm',   x: 370, y: 330, rot: 20 },
  { name: 'leftLeg',    x: 150, y: 640, rot: -30 },
  { name: 'rightLeg',   x: 340, y: 660, rot: 25 },
  { name: 'torso',      x: 260, y: 380, rot: -10 },
]

// Bandaid dot grid positions (relative to bandaid center, 100×36 bandaid)
const BANDAID_DOTS: Array<[number, number]> = []
for (let bx = -36; bx <= 36; bx += 9) {
  for (let by = -9; by <= 9; by += 7) {
    BANDAID_DOTS.push([bx, by])
  }
}

// Star orbit parameters — big stars, wide orbit, outside body-root
const STAR_ORBIT_CX = 236
const STAR_ORBIT_CY = 200
const STAR_ORBIT_R = 220
const STAR_SIZE = 65

export const HunchieAnimated = forwardRef<HunchieAnimatedHandle, Props>(
  function HunchieAnimated({ mood: _mood, size = 260, className = '', hitTrigger }, ref) {
  const rafId = useRef(0)
  const elCache = useRef<Record<string, Element | null>>({})
  const el = (id: string) => {
    if (!elCache.current[id]) elCache.current[id] = document.getElementById(id)
    return elCache.current[id]
  }

  const reaction = useRef<{ type: ReactionType; start: number }>({ type: 'none', start: 0 })
  const lastReaction = useRef<ReactionType>('roll')
  const prevHitCount = useRef(0)

  // Bandaid state — persistent across animations, removed only via removeBandaid()
  const [bandaids, setBandaids] = useState<BandaidData[]>([])
  const bandaidsRef = useRef<BandaidData[]>([])

  useImperativeHandle(ref, () => ({
    removeBandaid: (timestamp: number) => {
      bandaidsRef.current = bandaidsRef.current.filter(b => b.timestamp !== timestamp)
      setBandaids([...bandaidsRef.current])
      delete elCache.current[`bandaid-${timestamp}`]
    },
    removeBandaids: (count: number) => {
      const toRemove = bandaidsRef.current.slice(0, count)
      toRemove.forEach(b => delete elCache.current[`bandaid-${b.timestamp}`])
      bandaidsRef.current = bandaidsRef.current.slice(count)
      setBandaids([...bandaidsRef.current])
    },
    removeAllBandaids: () => {
      bandaidsRef.current.forEach(b => delete elCache.current[`bandaid-${b.timestamp}`])
      bandaidsRef.current = []
      setBandaids([])
    },
  }), [])

  // Pick a random body-part slot that doesn't already have a bandaid
  const pickBandaidSlot = useCallback(() => {
    const used = new Set(bandaidsRef.current.map(b => b.slotName))
    const available = BANDAID_BODY_SLOTS.filter(s => !used.has(s.name))
    if (available.length === 0) return null
    return available[Math.floor(Math.random() * available.length)]
  }, [])

  const spawnBandaid = useCallback((hpDeducted: number, timestamp: number) => {
    const slot = pickBandaidSlot()
    if (!slot) return
    const newBandaid: BandaidData = {
      timestamp,
      hpDeducted,
      slotName: slot.name,
      x: slot.x + (Math.random() - 0.5) * 10,
      y: slot.y + (Math.random() - 0.5) * 10,
      rotation: slot.rot + (Math.random() - 0.5) * 10,
      birthTime: performance.now(),
    }
    bandaidsRef.current = [...bandaidsRef.current, newBandaid]
    setBandaids([...bandaidsRef.current])
  }, [pickBandaidSlot])

  // React to hit triggers from Dashboard
  useEffect(() => {
    if ((window as any).HUNCHIE_RETURN_IN_PROGRESS) return
    if (!hitTrigger || hitTrigger.count === prevHitCount.current) return
    prevHitCount.current = hitTrigger.count
    const map: Record<string, ReactionType> = {
      light: 'hitMild',
      medium: 'hitMedium',
      heavy: 'hitSevere',
    }
    const type = map[hitTrigger.severity]
    reaction.current = { type, start: performance.now() }

    // Medium + Severe → spawn a bandaid on a random body part
    if (type === 'hitMedium' || type === 'hitSevere') {
      spawnBandaid(hitTrigger.hpDeducted ?? 6, hitTrigger.timestamp ?? Date.now())
    }
  }, [hitTrigger, spawnBandaid])

  const handleClick = useCallback(() => {
    if (reaction.current.type !== 'none') return
    const next: ReactionType = lastReaction.current === 'roll' ? 'bounce' : 'roll'
    lastReaction.current = next
    reaction.current = { type: next, start: performance.now() }
  }, [])

  const animate = useCallback((time: number) => {
    const t = time / 1000

    // --- Idle ambient motion ---
    const breathe = Math.sin(t * 1.2)
    let bodySx = 1 + breathe * 0.02
    let bodySy = 1 + breathe * 0.025
    let bodyRotation = 0
    let bodyTx = 0

    let headRot = Math.sin(t * 0.65 + 0.5) * 2
    let quillsSx = 1 + Math.sin(t * 0.7) * 0.005
    let quillsSy = 1 + Math.sin(t * 0.7) * 0.007
    let lArmRot = Math.sin(t * 0.9 + 1.0) * 4
    let rArmRot = Math.sin(t * 0.85 + 2.5) * -3.5
    let lFootRot = Math.sin(t * 0.6 + 0.8) * 2
    let rFootRot = Math.sin(t * 0.55 + 2.0) * -2
    const earGateL = Math.max(0, Math.sin(t * 0.3) - 0.7) / 0.3
    let lEarRot = earGateL * Math.sin(t * 4) * 5
    const earGateR = Math.max(0, Math.sin(t * 0.25 + 1.5) - 0.7) / 0.3
    let rEarRot = earGateR * Math.sin(t * 3.5 + 1) * -4
    let shadowSx = 1 + breathe * -0.03

    // Sprite swap
    let hedgehogOpacity = 1
    let ballOpacity = 0
    let ballRotation = 0
    let ballSx = 1
    let ballSy = 1
    let ballTx = 0

    // Stars + dizzy rings overlay
    let starsOpacity = 0
    let starsAngle = 0
    let ringsAngle = 0
    let ring1Ry = STAR_ORBIT_R * 0.45
    let ring2Ry = (STAR_ORBIT_R - 30) * 0.45

    // --- Click/hit reactions ---
    const rx = reaction.current
    if (rx.type !== 'none') {
      const elapsed = (time - rx.start) / 1000

      // ===== BOUNCE (click) =====
      if (rx.type === 'bounce') {
        const dur = 1.2
        if (elapsed < dur) {
          const spring = springDecay(elapsed, 12, 4)
          bodySx += spring * -0.06
          bodySy += spring * 0.08
          headRot += springDecay(elapsed, 10, 3.5) * -6
          lArmRot += springDecay(elapsed, 11, 3.5) * 12
          rArmRot += springDecay(elapsed, 11, 3.5) * -10
          lFootRot += springDecay(elapsed, 9, 4) * 5
          rFootRot += springDecay(elapsed, 9, 4) * -5
          lEarRot += springDecay(elapsed, 14, 4) * -8
          rEarRot += springDecay(elapsed, 14, 4) * 6
          const puff = springDecay(elapsed, 10, 4)
          quillsSx += puff * 0.03
          quillsSy += puff * -0.02
          shadowSx += spring * 0.05
        } else {
          reaction.current = { type: 'none', start: 0 }
        }
      }

      // ===== ROLL (click) =====
      if (rx.type === 'roll') {
        if (elapsed >= ROLL_TOTAL) {
          reaction.current = { type: 'none', start: 0 }
        } else if (elapsed < ROLL_CROUCH) {
          const p = easeOut(elapsed / ROLL_CROUCH)
          bodySx = lerp(1, 1.08, p)
          bodySy = lerp(1, 0.88, p)
          bodyRotation = lerp(0, 5, p)
          headRot = lerp(0, 8, p)
          lArmRot = lerp(0, 10, p)
          rArmRot = lerp(0, -8, p)
          lFootRot = lerp(0, 3, p)
          rFootRot = lerp(0, -3, p)
          shadowSx = lerp(1, 1.15, p)
        } else if (elapsed < ROLL_CROUCH + ROLL_SWAP) {
          const p = clamp01((elapsed - ROLL_CROUCH) / ROLL_SWAP)
          hedgehogOpacity = 1 - p
          ballOpacity = p
          bodySx = 1.08; bodySy = 0.88; bodyRotation = 5; shadowSx = 1.15
        } else if (elapsed < ROLL_CROUCH + ROLL_SWAP + ROLL_SPIN) {
          const spinElapsed = elapsed - ROLL_CROUCH - ROLL_SWAP
          const p = spinElapsed / ROLL_SPIN
          const spinEase = easeInOut(p)
          hedgehogOpacity = 0; ballOpacity = 1
          ballRotation = spinEase * 360
          ballTx = Math.sin(p * Math.PI) * 100
          const groundPhase = Math.abs(Math.cos(spinEase * Math.PI * 2))
          ballSx = 1 + groundPhase * 0.08
          ballSy = 1 - groundPhase * 0.06
          shadowSx = lerp(0.6, 1, groundPhase)
        } else if (elapsed < ROLL_CROUCH + ROLL_SWAP + ROLL_SPIN + ROLL_UNSWAP) {
          const p = clamp01((elapsed - ROLL_CROUCH - ROLL_SWAP - ROLL_SPIN) / ROLL_UNSWAP)
          hedgehogOpacity = p; ballOpacity = 1 - p
          bodySx = lerp(1.05, 1.02, p); bodySy = lerp(0.9, 0.98, p)
          shadowSx = lerp(1.1, 1, p)
        } else {
          const recElapsed = elapsed - ROLL_CROUCH - ROLL_SWAP - ROLL_SPIN - ROLL_UNSWAP
          const p = clamp01(recElapsed / ROLL_RECOVER)
          hedgehogOpacity = 1; ballOpacity = 0
          const wobble = Math.sin(p * Math.PI * 5) * (1 - p) * 4
          bodySx = lerp(1.02, 1, easeOut(p)); bodySy = lerp(0.98, 1, easeOut(p))
          headRot = wobble * 1.5
          lArmRot = wobble * 2; rArmRot = wobble * -1.5
          lFootRot = wobble * 0.5; rFootRot = wobble * -0.5
          lEarRot = wobble * -1.2; rEarRot = wobble * 1
        }
      }

      // ===== MILD HIT — ±8px shake, 5° tilt, 10px recoil, 1s =====
      if (rx.type === 'hitMild') {
        if (elapsed >= 1.0) {
          reaction.current = { type: 'none', start: 0 }
        } else {
          // Tremble ±8px for 0.8s
          if (elapsed < 0.8) {
            bodyTx = Math.sin(elapsed * 40) * 8
          }
          // Recoil 10px backward then return
          if (elapsed < 0.15) {
            bodyTx += lerp(0, -10, elapsed / 0.15)
          } else if (elapsed < 0.8) {
            bodyTx += lerp(-10, 0, easeOut((elapsed - 0.15) / 0.65))
          }
          // Tilt 5° during shake then return
          if (elapsed < 0.15) {
            bodyRotation = lerp(0, 5, elapsed / 0.15)
          } else if (elapsed < 0.8) {
            bodyRotation = lerp(5, 0, easeOut((elapsed - 0.15) / 0.65))
          }
        }
      }

      // ===== MEDIUM HIT — ±15px shake, 25px recoil, 12° tilt, heavy sway, bandaid, 1.5s =====
      if (rx.type === 'hitMedium') {
        if (elapsed >= 1.5) {
          reaction.current = { type: 'none', start: 0 }
        } else {
          // Tremble ±15px for 1.2s
          if (elapsed < 1.2) {
            bodyTx = Math.sin(elapsed * 35) * 15
          }
          // Recoil 25px backward then return
          if (elapsed < 0.15) {
            bodyTx += lerp(0, -25, elapsed / 0.15)
          } else if (elapsed < 1.2) {
            bodyTx += lerp(-25, 0, easeOut((elapsed - 0.15) / 1.05))
          }
          // Tilt 12° then return
          if (elapsed < 0.15) {
            bodyRotation = lerp(0, 12, elapsed / 0.15)
          } else if (elapsed < 1.2) {
            bodyRotation = lerp(12, 0, easeOut((elapsed - 0.15) / 1.05))
          }
          // Heavy sine sway layered on top (0.3s – 1.5s)
          if (elapsed > 0.3) {
            bodyTx += Math.sin((elapsed - 0.3) * 3) * 8
            bodyRotation += Math.sin((elapsed - 0.3) * 3 + 0.5) * 4
          }
        }
      }

      // ===== SEVERE HIT — ±20px shake, 35px recoil, near-topple 45°, big stars, 6s =====
      if (rx.type === 'hitSevere') {
        if (elapsed >= 6.0) {
          reaction.current = { type: 'none', start: 0 }
        } else {
          // Phase 1 (0–0.2s): Impact — recoil snap to -35px, tilt to 45°
          if (elapsed < 0.2) {
            bodyTx = lerp(0, -35, elapsed / 0.2)
            bodyRotation = lerp(0, 45, elapsed / 0.2)
          }
          // Phase 2 (0.2–1.5s): Massive shake ±20px, still near 45°
          else if (elapsed < 1.5) {
            const shakeDecay = 1 - (elapsed - 0.2) / 1.3 * 0.3
            bodyTx = lerp(-35, 0, easeOut((elapsed - 0.2) / 1.3)) + Math.sin(elapsed * 35) * 20 * shakeDecay
            bodyRotation = 45
          }
          // Phase 3 (1.5–2.5s): Teeter between 40° and 50°
          else if (elapsed < 2.5) {
            bodyTx = Math.sin(elapsed * 3) * 5
            bodyRotation = 45 + Math.sin((elapsed - 1.5) * Math.PI * 2) * 5
          }
          // Phase 4 (2.5–5.0s): Drunk sway, tilt gradually reducing
          else if (elapsed < 5.0) {
            const p = (elapsed - 2.5) / 2.5
            const tiltTarget = lerp(40, 0, easeOut(p))
            bodyTx = Math.sin(elapsed * 1.5) * lerp(10, 3, p)
            bodyRotation = tiltTarget + Math.sin(elapsed * 2) * lerp(5, 1, p)
          }
          // Phase 5 (5.0–5.5s): Straighten with overcorrect
          else if (elapsed < 5.5) {
            const p = (elapsed - 5.0) / 0.5
            bodyTx = lerp(3, 0, easeOut(p))
            bodyRotation = lerp(5, -5, easeOut(p))
          }
          // Phase 6 (5.5–6.0s): Overcorrect wobble settle
          else {
            const p = (elapsed - 5.5) / 0.5
            bodyRotation = lerp(-5, 0, easeOut(p))
            bodyTx = Math.sin(p * Math.PI * 2) * 2 * (1 - p)
          }

          // Limp limbs during phases 2–4
          if (elapsed > 0.2 && elapsed < 5.0) {
            lArmRot = Math.sin(elapsed * 2) * 10
            rArmRot = Math.sin(elapsed * 2 + 1) * -8
            lFootRot = Math.sin(elapsed * 1.5) * 6
            rFootRot = Math.sin(elapsed * 1.5 + 1) * -5
            lEarRot = Math.sin(elapsed * 3) * -8
            rEarRot = Math.sin(elapsed * 3 + 0.5) * 7
          }

          // Stars + dizzy rings orbit (0.3s – 5.5s, fade out last 0.5s)
          if (elapsed > 0.3 && elapsed < 5.5) {
            starsOpacity = elapsed < 0.5
              ? (elapsed - 0.3) / 0.2
              : elapsed > 5.0
                ? lerp(1, 0, (elapsed - 5.0) / 0.5)
                : 1
            starsAngle = (elapsed - 0.3) * 90
            ringsAngle = (elapsed - 0.3) * 55 // rings rotate slower than stars
            // 3D tilt illusion — animate ry with sine wave
            const ringTime = elapsed - 0.3
            ring1Ry = STAR_ORBIT_R * (0.3 + 0.2 * Math.sin(ringTime * 1.8))
            ring2Ry = (STAR_ORBIT_R - 30) * (0.3 + 0.2 * Math.sin(ringTime * 1.8 + 1.2))
          }
        }
      }
    }

    // --- Clamp bodyTx so Hunchie stays within viewBox ---
    bodyTx = Math.max(-60, Math.min(60, bodyTx))

    // --- Dynamic viewBox expansion during rotation ---
    const absRot = Math.abs(bodyRotation)
    const svgEl = el('hunchie-svg')
    if (svgEl && absRot > 5) {
      const expand = Math.min(1, absRot / 45)
      const vbX = lerp(-20, -200, expand)
      const vbY = lerp(-10, -80, expand)
      const vbW = lerp(790, 1150, expand)
      const vbH = lerp(783, 1000, expand)
      svgEl.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`)
    } else if (svgEl) {
      svgEl.setAttribute('viewBox', '-20 -10 790 783')
    }

    // --- Animate bandaid pop-in (scale 0 → 1.1 → 1.0) ---
    for (const b of bandaidsRef.current) {
      const bElapsed = (time - b.birthTime) / 1000
      let bScale = 1
      let bOpacity = 1
      if (bElapsed < 0.3) {
        bOpacity = Math.min(1, bElapsed / 0.1)
        bScale = bElapsed < 0.2
          ? lerp(0, 1.1, bElapsed / 0.2)
          : lerp(1.1, 1.0, (bElapsed - 0.2) / 0.1)
      }
      const bEl = el(`bandaid-${b.timestamp}`)
      if (bEl) {
        bEl.setAttribute('transform',
          `translate(${b.x}, ${b.y}) scale(${bScale}) rotate(${b.rotation})`)
        bEl.setAttribute('opacity', String(bOpacity))
      }
    }

    // --- Apply transforms by element id ---
    const bp = PIVOTS.body
    let bodyTransform = scaleAt(bp[0], bp[1], bodySx, bodySy)
    if (bodyRotation !== 0) {
      bodyTransform += ` rotate(${bodyRotation}, ${bp[0]}, ${bp[1]})`
    }
    if (bodyTx !== 0) {
      bodyTransform = `translate(${bodyTx}, 0) ` + bodyTransform
    }
    el('body-root')?.setAttribute('transform', bodyTransform)
    el('hedgehog')?.setAttribute('opacity', String(hedgehogOpacity))

    el('head')?.setAttribute('transform',
      rotateAt(PIVOTS.head[0], PIVOTS.head[1], headRot))
    el('quills')?.setAttribute('transform',
      scaleAt(PIVOTS.quills[0], PIVOTS.quills[1], quillsSx, quillsSy))
    el('left-arm')?.setAttribute('transform',
      rotateAt(PIVOTS.leftArm[0], PIVOTS.leftArm[1], lArmRot))
    el('right-arm')?.setAttribute('transform',
      rotateAt(PIVOTS.rightArm[0], PIVOTS.rightArm[1], rArmRot))
    el('left-foot')?.setAttribute('transform',
      rotateAt(PIVOTS.leftFoot[0], PIVOTS.leftFoot[1], lFootRot))
    el('right-foot')?.setAttribute('transform',
      rotateAt(PIVOTS.rightFoot[0], PIVOTS.rightFoot[1], rFootRot))
    el('left-ear')?.setAttribute('transform',
      rotateAt(PIVOTS.leftEar[0], PIVOTS.leftEar[1], lEarRot))
    el('right-ear')?.setAttribute('transform',
      rotateAt(PIVOTS.rightEar[0], PIVOTS.rightEar[1], rEarRot))

    // #dizzy — stars + rings during severe hit (outside body-root)
    if (starsOpacity > 0) {
      el('stars')?.setAttribute('opacity', String(starsOpacity))
      el('stars')?.setAttribute('transform',
        rotateAt(STAR_ORBIT_CX, STAR_ORBIT_CY, starsAngle))
      el('dizzy-rings')?.setAttribute('opacity', String(starsOpacity))
      el('dizzy-rings')?.setAttribute('transform',
        rotateAt(STAR_ORBIT_CX, STAR_ORBIT_CY, ringsAngle))
      el('dizzy-ring-1')?.setAttribute('ry', String(ring1Ry))
      el('dizzy-ring-2')?.setAttribute('ry', String(ring2Ry))
    } else {
      el('stars')?.setAttribute('opacity', '0')
      el('dizzy-rings')?.setAttribute('opacity', '0')
    }

    // #ball — geometric ball during roll
    el('ball')?.setAttribute('opacity', String(ballOpacity))
    if (ballOpacity > 0) {
      let ballTransform = ''
      if (ballTx !== 0) ballTransform += `translate(${ballTx}, 0) `
      ballTransform += scaleAt(BALL_CX, BALL_CY, ballSx, ballSy)
      if (ballRotation !== 0) ballTransform += ` rotate(${ballRotation}, ${BALL_CX}, ${BALL_CY})`
      el('ball')?.setAttribute('transform', ballTransform)
    }

    // #shadow — ground shadow
    el('shadow')?.setAttribute('transform',
      scaleAt(PIVOTS.shadow[0], PIVOTS.shadow[1], shadowSx, 1))

    rafId.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId.current)
  }, [animate])

  // 4-pointed star path centered at 0,0
  const starPath = (s: number) =>
    `M0,${-s} L${s * 0.3},${-s * 0.3} L${s},0 L${s * 0.3},${s * 0.3} L0,${s} L${-s * 0.3},${s * 0.3} L${-s},0 L${-s * 0.3},${-s * 0.3}Z`

  return (
    <div
      className={`${styles.wrap} ${className}`}
      style={{ width: size, height: size, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <svg id="hunchie-svg" viewBox="-20 -10 790 783" className={styles.svg} style={{ overflow: 'visible' }}>

        {/* Shadow — ground shadow ellipse beneath the character */}
        <ellipse id="shadow" className="shadow" cx="375" cy="750" rx="160" ry="14" fill="rgba(0,0,0,0.08)" />

        {/* Ball sprite — geometric ball shown during roll animation (sprite-swap) */}
        <g id="ball" className="ball" opacity="0">
          {/* Ball outer shell — dark brown circle with stroke */}
          <circle id="ball-outer" className="ball-shell" cx={BALL_CX} cy={BALL_CY} r={BALL_R} fill="#4A3628" stroke="#3A2818" strokeWidth="3" />
          {/* Ball inner fill — slightly lighter brown */}
          <circle id="ball-inner" className="ball-fill" cx={BALL_CX} cy={BALL_CY} r={BALL_R * 0.88} fill="#5C4432" />
          {/* Ball quill texture — 4 concentric zigzag polygon rings */}
          {[0.95, 0.82, 0.68, 0.55].map((ring, i) => {
            const r = BALL_R * ring
            const n = 12 + i * 2
            const points = Array.from({ length: n }, (_, j) => {
              const angle = (j / n) * Math.PI * 2
              const rr = j % 2 === 0 ? r : r * 0.88
              return `${BALL_CX + Math.cos(angle) * rr},${BALL_CY + Math.sin(angle) * rr}`
            }).join(' ')
            return <polygon key={i} id={`ball-quill-ring-${i}`} className="ball-quill-ring" points={points} fill="none" stroke="#E8D4C0" strokeWidth="4" strokeLinejoin="round" />
          })}
          {/* Ball belly peek — outer circle hint */}
          <circle id="ball-belly-outer" className="ball-belly" cx={BALL_CX - 30} cy={BALL_CY + 10} r={BALL_R * 0.42} fill="#F0D8C8" />
          {/* Ball belly peek — inner lighter circle */}
          <circle id="ball-belly-inner" className="ball-belly" cx={BALL_CX - 30} cy={BALL_CY + 10} r={BALL_R * 0.3} fill="#F8E8DC" />
          {/* Ball face shadow — subtle head shape hint */}
          <ellipse id="ball-face-shadow" className="ball-hint" cx={BALL_CX - 25} cy={BALL_CY - 10} rx="45" ry="35" fill="#D4B8A0" opacity="0.3" />
          {/* Ball left ear bump — subtle ear shape hint */}
          <ellipse id="ball-ear-left" className="ball-hint" cx={BALL_CX - 65} cy={BALL_CY - 55} rx="16" ry="13" fill="#D4B8A0" opacity="0.4" />
          {/* Ball right ear bump — subtle ear shape hint */}
          <ellipse id="ball-ear-right" className="ball-hint" cx={BALL_CX + 10} cy={BALL_CY - 60} rx="14" ry="12" fill="#D4B8A0" opacity="0.4" />
        </g>

        {/* Body group — root transform group for scaling, rotation, translation */}
        <g id="body-root" className="body-root">
          {/* Hedgehog group — all visible body parts; opacity toggled for sprite-swap */}
          <g id="hedgehog" className="hedgehog">

            {/* Quills — spiky back (largest layer, behind everything) */}
            <g id="quills" className="quills">
              <image id="quills-img" className="part-image" href="/parts/quills.png" x={PARTS.quills.x} y={PARTS.quills.y} width={PARTS.quills.w} height={PARTS.quills.h} />
            </g>

            {/* Body — main torso/belly shape */}
            <image id="body-img" className="part-image body" href="/parts/body.png" x={PARTS.body.x} y={PARTS.body.y} width={PARTS.body.w} height={PARTS.body.h} />

            {/* Left ear — pivots at (130, 103) */}
            <g id="left-ear" className="left-ear">
              <image id="left-ear-img" className="part-image" href="/parts/left_ear.png" x={PARTS.leftEar.x} y={PARTS.leftEar.y} width={PARTS.leftEar.w} height={PARTS.leftEar.h} />
            </g>

            {/* Right ear — pivots at (375, 143) */}
            <g id="right-ear" className="right-ear">
              <image id="right-ear-img" className="part-image" href="/parts/right_ear.png" x={PARTS.rightEar.x} y={PARTS.rightEar.y} width={PARTS.rightEar.w} height={PARTS.rightEar.h} />
            </g>

            {/* Head group — face area; rotates as a unit around (236, 210) */}
            <g id="head" className="head">
              {/* Head base — face outline and cheeks */}
              <image id="head-img" className="part-image" href="/parts/head.png" x={PARTS.head.x} y={PARTS.head.y} width={PARTS.head.w} height={PARTS.head.h} />

              {/* Eyes group — contains the eye PNG; scaled for blink, hidden during squint */}
              <g id="eyes" className="eyes">
                {/* NOTE: "eye.png" actually contains the upper face area near quills, not just the eye */}
                <image id="eye-img" className="part-image" href="/parts/eye.png" x={PARTS.eye.x} y={PARTS.eye.y} width={PARTS.eye.w} height={PARTS.eye.h} />
              </g>

              {/* Mouth area — NOTE: "mouth.png" actually contains the eye, nose, AND mouth region */}
              <image id="mouth-img" className="part-image mouth" href="/parts/mouth.png" x={PARTS.mouth.x} y={PARTS.mouth.y} width={PARTS.mouth.w} height={PARTS.mouth.h} />
            </g>

            {/* Left arm — pivots at (130, 400) */}
            <g id="left-arm" className="left-arm">
              <image id="left-arm-img" className="part-image" href="/parts/left_arm.png" x={PARTS.leftArm.x} y={PARTS.leftArm.y} width={PARTS.leftArm.w} height={PARTS.leftArm.h} />
            </g>

            {/* Right arm — pivots at (290, 260) */}
            <g id="right-arm" className="right-arm">
              <image id="right-arm-img" className="part-image" href="/parts/right_arm.png" x={PARTS.rightArm.x} y={PARTS.rightArm.y} width={PARTS.rightArm.w} height={PARTS.rightArm.h} />
            </g>

            {/* Left foot — pivots at (180, 590) */}
            <g id="left-foot" className="left-foot">
              <image id="left-foot-img" className="part-image" href="/parts/left_foot.png" x={PARTS.leftFoot.x} y={PARTS.leftFoot.y} width={PARTS.leftFoot.w} height={PARTS.leftFoot.h} />
            </g>

            {/* Right foot — pivots at (370, 610) */}
            <g id="right-foot" className="right-foot">
              <image id="right-foot-img" className="part-image" href="/parts/right_foot.png" x={PARTS.rightFoot.x} y={PARTS.rightFoot.y} width={PARTS.rightFoot.w} height={PARTS.rightFoot.h} />
            </g>

            {/* Dynamic bandaids — spawned on random body parts by medium/severe hits */}
            {bandaids.map((b) => (
              <g key={b.timestamp} id={`bandaid-${b.timestamp}`} className="bandaid overlay" opacity="0">
                {/* White backing */}
                <rect x="-53" y="-20" width="106" height="40" rx="20" fill="#fff" />
                {/* Dark outline + peach body */}
                <rect x="-50" y="-18" width="100" height="36" rx="18"
                  fill="#F4B48C" stroke="#3A2518" strokeWidth="2.5" />
                {/* Center pad — slightly lighter with subtle border */}
                <rect x="-22" y="-12" width="44" height="24" rx="3"
                  fill="#F8C8A0" stroke="#C08050" strokeWidth="1.2" />
                {/* Dot pattern across bandage */}
                {BANDAID_DOTS.map(([dx, dy], i) => (
                  <circle key={i} cx={dx} cy={dy} r="1.3" fill="rgba(255,255,255,0.5)" />
                ))}
                {/* Highlight shine */}
                <line x1="-38" y1="-10" x2="38" y2="-10"
                  stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}

          </g>

        </g>

        {/* Dizzy rings — 2 concentric dashed ellipses with 3D tilt (outside body-root) */}
        <g id="dizzy-rings" className="dizzy-rings overlay" opacity="0">
          <ellipse id="dizzy-ring-1" cx={STAR_ORBIT_CX} cy={STAR_ORBIT_CY}
            rx={STAR_ORBIT_R} ry={STAR_ORBIT_R * 0.45}
            fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="8 4" />
          <ellipse id="dizzy-ring-2" cx={STAR_ORBIT_CX} cy={STAR_ORBIT_CY}
            rx={STAR_ORBIT_R - 30} ry={(STAR_ORBIT_R - 30) * 0.45}
            fill="none" stroke="#FFA500" strokeWidth="1.5" strokeDasharray="6 3" />
        </g>

        {/* Stars — 3 big yellow stars orbiting head during severe hit (outside body-root so they don't tilt) */}
        <g id="stars" className="stars overlay" opacity="0">
          {[0, 120, 240].map((offset) => {
            const rad = (offset * Math.PI) / 180
            const cx = STAR_ORBIT_CX + Math.cos(rad) * STAR_ORBIT_R
            const cy = STAR_ORBIT_CY + Math.sin(rad) * STAR_ORBIT_R
            return (
              <path key={offset} id={`star-${offset}`} className="star"
                d={starPath(STAR_SIZE)}
                transform={`translate(${cx}, ${cy})`}
                fill="#FFD700" stroke="#E8A0B0" strokeWidth="2.5" />
            )
          })}
        </g>
      </svg>
    </div>
  )
})
