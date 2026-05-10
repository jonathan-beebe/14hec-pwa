import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual } from './planetConfig'
import { prepareGlyphProfile, type GlyphProfile } from './glyphSampler'

export const WIND_ENABLED = true

const GLYPH_SCALE_RATIO = 0.85
const POOL_FRACTION = 0.04
const POOL_MIN = 200
const POOL_MAX = 2000

// Wind blows along world +x. Gust modulates speed; direction wobble veers it
// gently around the Y axis; vertical wobble lifts/dips it. Wind is one global
// field — every source sees the same vector, so sand from one planet drifts
// past the next.
const WIND_BASE_SPEED = 0.32
const WIND_GUST_FREQ = 0.7
const WIND_GUST_AMP = 0.4
const WIND_GUST_FREQ_2 = 1.31
const WIND_GUST_AMP_2 = 0.18
const WIND_DIR_FREQ = 0.13
const WIND_DIR_AMP = 0.20
const WIND_VERTICAL_FREQ = 0.09
const WIND_VERTICAL_AMP = 0.07

const LIFESPAN_MIN = 1.5
const LIFESPAN_MAX = 5.0
const VEL_JITTER_X = 0.18
const VEL_JITTER_Y = 0.10
const VEL_JITTER_Z = 0.10
const FADE_IN = 0.10
// Tail exponent < 1 gives a soft, long fade-out: rapid drop at first, then a
// slow asymptote toward zero — sparse grains drifting into the distance.
const FADE_TAIL_EXP = 0.55
// Reject downwind spawns this fraction of the time, retrying up to MAX_ATTEMPTS.
// Net effect: ~80% of grains lift from the windward face.
const UPWIND_BIAS = 0.7
const MAX_ATTEMPTS = 4

const DRIFT_POINT_SIZE = 1.1

// Fraction of wind grains painted white instead of base color — bright
// glints in the trailing dust. Boost is fixed per slot (variety, no
// flicker); respawns rotate the visible sparkles over time.
const SPARKLE_FRACTION = 0.05

type PointsRef = MutableRefObject<THREE.Points | null>

function fade(p: number) {
  if (p < FADE_IN) return p / FADE_IN
  const u = (p - FADE_IN) / (1 - FADE_IN)
  return Math.max(0, 1 - Math.pow(u, FADE_TAIL_EXP))
}

type Pool = {
  positions: Float32Array
  colors: Float32Array
  baseColors: Float32Array
  velJitter: Float32Array
  life: Float32Array
  lifespan: Float32Array
  isSparkle: Uint8Array
  sparkleBoost: Float32Array
}

function makePool(size: number): Pool {
  const positions = new Float32Array(size * 3)
  const colors = new Float32Array(size * 3)
  const baseColors = new Float32Array(size * 3)
  const velJitter = new Float32Array(size * 3)
  const life = new Float32Array(size)
  const lifespan = new Float32Array(size)
  const isSparkle = new Uint8Array(size)
  const sparkleBoost = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    lifespan[i] = LIFESPAN_MIN + Math.random() * (LIFESPAN_MAX - LIFESPAN_MIN)
    // Negative life = startup delay, uniformly spread across LIFESPAN_MAX.
    // Without it, every slot is "expired" on frame 1 and they all respawn
    // simultaneously — visible burst as the pool comes online. Staggered
    // delays let the wind trickle on as if it's picking up.
    life[i] = -Math.random() * LIFESPAN_MAX
    velJitter[i * 3 + 0] = (Math.random() - 0.5) * VEL_JITTER_X
    velJitter[i * 3 + 1] = (Math.random() - 0.5) * VEL_JITTER_Y
    velJitter[i * 3 + 2] = (Math.random() - 0.5) * VEL_JITTER_Z
  }

  // Tag exactly SPARKLE_FRACTION of slots as sparkle. Shuffled-range pick
  // guarantees an exact count (vs. per-particle rng() drift).
  const sparkleCount = Math.round(size * SPARKLE_FRACTION)
  const order = shuffledRange(size)
  for (let k = 0; k < sparkleCount; k++) {
    const idx = order[k]
    isSparkle[idx] = 1
    sparkleBoost[idx] = Math.random()
  }

  return { positions, colors, baseColors, velJitter, life, lifespan, isSparkle, sparkleBoost }
}

function shuffledRange(n: number): Int32Array {
  const order = new Int32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    const tmp = order[i]
    order[i] = order[j]
    order[j] = tmp
  }
  return order
}

export type WindSource = {
  config: PlanetVisual
  morphRef: MutableRefObject<number>
  bodyRef: PointsRef
  ringRef: PointsRef
}

type SourcePacket = WindSource & {
  glyphProfile: GlyphProfile | null
  bodyCount: number
  ringCount: number
  totalCount: number
  ringFraction: number
}

export type WindDriftProps = {
  sources: WindSource[]
}

export default function WindDrift({ sources }: WindDriftProps) {
  const packets: SourcePacket[] = useMemo(
    () =>
      sources.map((s) => {
        const ringCount = s.config.ring?.particleCount ?? 0
        const totalCount = s.config.particleCount + ringCount
        return {
          ...s,
          glyphProfile: prepareGlyphProfile(
            s.config.glyph,
            s.config.bodyScale * GLYPH_SCALE_RATIO,
          ),
          bodyCount: s.config.particleCount,
          ringCount,
          totalCount,
          ringFraction: totalCount > 0 ? ringCount / totalCount : 0,
        }
      }),
    [sources],
  )

  // Cumulative weights for sampling sources proportional to their particle count.
  const { cumWeights, totalWeight } = useMemo(() => {
    const arr = new Float32Array(packets.length)
    let s = 0
    for (let i = 0; i < packets.length; i++) {
      s += packets[i].totalCount
      arr[i] = s
    }
    return { cumWeights: arr, totalWeight: s }
  }, [packets])

  const poolSize = Math.max(
    POOL_MIN,
    Math.min(POOL_MAX, Math.round(totalWeight * POOL_FRACTION)),
  )
  const pool = useMemo(() => makePool(poolSize), [poolSize])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const pointsRef = useRef<THREE.Points>(null!)

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    // useFrame fires before R3F's scene.updateMatrixWorld(), so on frame 1
    // every source's matrixWorld is still the identity. Without this, the
    // initial respawn would clump every grain at the world origin.
    for (const packet of packets) {
      packet.bodyRef.current?.updateWorldMatrix(true, false)
      packet.ringRef.current?.updateWorldMatrix(true, false)
    }
    const t = state.clock.elapsedTime

    const dirAngle = Math.sin(t * WIND_DIR_FREQ) * WIND_DIR_AMP
    const gust =
      1 +
      WIND_GUST_AMP * Math.sin(t * WIND_GUST_FREQ) +
      WIND_GUST_AMP_2 * Math.sin(t * WIND_GUST_FREQ_2 + 1.7)
    const vertical = Math.sin(t * WIND_VERTICAL_FREQ + 1.3) * WIND_VERTICAL_AMP
    // Clamp so a deep gust trough doesn't reverse the wind.
    const speed = WIND_BASE_SPEED * Math.max(0.2, gust)
    const wx = Math.cos(dirAngle) * speed
    const wy = vertical * speed
    const wz = Math.sin(dirAngle) * speed

    for (let i = 0; i < poolSize; i++) {
      const prevLife = pool.life[i]
      const li = prevLife + delta
      const ls = pool.lifespan[i]
      if (li >= ls) {
        respawn(i, pool, packets, cumWeights, totalWeight, tmp)
      } else if (li < 0) {
        // Still in startup delay — tick life, paint transparent (additive).
        pool.life[i] = li
        pool.colors[i * 3 + 0] = 0
        pool.colors[i * 3 + 1] = 0
        pool.colors[i * 3 + 2] = 0
      } else if (prevLife < 0) {
        // Just emerged from delay — respawn so it lifts from a real source
        // instead of drifting from its uninitialized origin.
        respawn(i, pool, packets, cumWeights, totalWeight, tmp)
      } else {
        pool.life[i] = li
        const vx = wx + pool.velJitter[i * 3 + 0]
        const vy = wy + pool.velJitter[i * 3 + 1]
        const vz = wz + pool.velJitter[i * 3 + 2]
        pool.positions[i * 3 + 0] += vx * delta
        pool.positions[i * 3 + 1] += vy * delta
        pool.positions[i * 3 + 2] += vz * delta
        const a = fade(li / ls)
        if (pool.isSparkle[i]) {
          // Sparkle: paint white with a per-particle boost so each glint has
          // its own stable peak brightness (variety, no flicker). Brightness
          // lerps from the grain's current life alpha up to that ceiling, so
          // the sparkle still fades in/out with its life curve.
          const boost = a + (1 - a) * pool.sparkleBoost[i]
          pool.colors[i * 3 + 0] = boost
          pool.colors[i * 3 + 1] = boost
          pool.colors[i * 3 + 2] = boost
        } else {
          pool.colors[i * 3 + 0] = pool.baseColors[i * 3 + 0] * a
          pool.colors[i * 3 + 1] = pool.baseColors[i * 3 + 1] * a
          pool.colors[i * 3 + 2] = pool.baseColors[i * 3 + 2] * a
        }
      }
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    posAttr.needsUpdate = true
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute
    colAttr.needsUpdate = true
  })

  return (
    // frustumCulled={false}: positions are mutated every frame in world space
    // and the cached bounding sphere goes stale, which culls the entire pool.
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pool.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[pool.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={DRIFT_POINT_SIZE}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function pickSourceIndex(cumWeights: Float32Array, totalWeight: number): number {
  const r = Math.random() * totalWeight
  for (let i = 0; i < cumWeights.length; i++) {
    if (r < cumWeights[i]) return i
  }
  return cumWeights.length - 1
}

function respawn(
  i: number,
  pool: Pool,
  packets: SourcePacket[],
  cumWeights: Float32Array,
  totalWeight: number,
  tmp: THREE.Vector3,
) {
  if (totalWeight <= 0) {
    pool.life[i] = pool.lifespan[i]
    return
  }

  let r = 0,
    g = 0,
    b = 0
  let sampled = false

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const packet = packets[pickSourceIndex(cumWeights, totalWeight)]
    const useRing =
      packet.ringCount > 0 &&
      packet.ringRef.current !== null &&
      Math.random() < packet.ringFraction

    if (useRing) {
      const ring = packet.ringRef.current
      if (!ring) continue
      const ringCfg = packet.config.ring!
      const f = Math.random()
      const radius =
        (ringCfg.inner + f * (ringCfg.outer - ringCfg.inner)) * packet.config.bodyScale
      const theta = Math.random() * Math.PI * 2
      const yJ =
        (Math.random() - 0.5) * (ringCfg.thickness ?? 0.01) * packet.config.bodyScale
      let bx = radius * Math.cos(theta)
      let by = yJ
      let bz = radius * Math.sin(theta)
      // When morphed, the visible ring particles are at glyph positions, not
      // ring positions. Shift wind spawns to match so grains don't appear
      // out of an invisible ring shape.
      const morph = packet.morphRef.current
      if (morph > 0.001 && packet.glyphProfile) {
        const gp = packet.glyphProfile
        const idx = (Math.random() * gp.opaqueX.length) | 0
        const gx = (gp.opaqueX[idx] - gp.cx) * gp.norm
        const gy = -(gp.opaqueY[idx] - gp.cy) * gp.norm
        bx = bx + (gx - bx) * morph
        by = by + (gy - by) * morph
        bz = bz + (0 - bz) * morph
      }
      tmp.set(bx, by, bz).applyMatrix4(ring.matrixWorld)
      const [cr, cg, cb] = ringCfg.color
      const j = (Math.random() - 0.5) * 0.06
      r = cr + j
      g = cg + j
      b = cb + j
      sampled = true
    } else {
      const body = packet.bodyRef.current
      if (!body) continue
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const dx = Math.sin(phi) * Math.cos(theta)
      const dy = Math.cos(phi)
      const dz = Math.sin(phi) * Math.sin(theta)
      const radius = packet.config.bodyScale * (0.97 + Math.random() * 0.03)
      let bx = dx * radius
      let by = dy * radius
      let bz = dz * radius
      const morph = packet.morphRef.current
      // When morphed, lift sand from the glyph silhouette instead of the
      // sphere — keeps the symbol shedding too. Glyph z is 0 (flat).
      if (morph > 0.001 && packet.glyphProfile) {
        const gp = packet.glyphProfile
        const idx = (Math.random() * gp.opaqueX.length) | 0
        const gx = (gp.opaqueX[idx] - gp.cx) * gp.norm
        const gy = -(gp.opaqueY[idx] - gp.cy) * gp.norm
        bx = bx + (gx - bx) * morph
        by = by + (gy - by) * morph
        bz = bz + (0 - bz) * morph
      }
      tmp.set(bx, by, bz).applyMatrix4(body.matrixWorld)
      const [cr, cg, cb] = packet.config.colorAt(dx, dy, dz)
      r = cr
      g = cg
      b = cb
      sampled = true
    }

    // Upwind bias: prefer windward (world -x) spawns. Reject downwind samples
    // most of the time, retrying with a fresh source pick.
    if (tmp.x <= 0 || Math.random() > UPWIND_BIAS) break
  }

  if (!sampled) {
    // No source had a ready ref — defer to next frame.
    pool.life[i] = pool.lifespan[i]
    return
  }

  pool.positions[i * 3 + 0] = tmp.x
  pool.positions[i * 3 + 1] = tmp.y
  pool.positions[i * 3 + 2] = tmp.z
  pool.baseColors[i * 3 + 0] = r
  pool.baseColors[i * 3 + 1] = g
  pool.baseColors[i * 3 + 2] = b
  pool.colors[i * 3 + 0] = 0
  pool.colors[i * 3 + 1] = 0
  pool.colors[i * 3 + 2] = 0
  pool.life[i] = 0
  pool.lifespan[i] = LIFESPAN_MIN + Math.random() * (LIFESPAN_MAX - LIFESPAN_MIN)
}
