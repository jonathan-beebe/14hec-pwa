import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual } from './planetConfig'
import { prepareGlyphProfile, type GlyphProfile } from './glyphSampler'

export const WIND_ENABLED = true

const GLYPH_SCALE_RATIO = 0.85
const POOL_FRACTION = 0.05
const POOL_MIN = 32
const POOL_MAX = 600

// Wind blows along world +x. Gust modulates speed; direction wobble veers it
// gently around the Y axis; vertical wobble lifts/dips it. All in world space —
// drift particles do NOT inherit the planet's spin, tilt, or satellite orbit.
const WIND_BASE_SPEED = 0.32
const WIND_GUST_FREQ = 0.7
const WIND_GUST_AMP = 0.4
const WIND_GUST_FREQ_2 = 1.31
const WIND_GUST_AMP_2 = 0.18
const WIND_DIR_FREQ = 0.13
const WIND_DIR_AMP = 0.20
const WIND_VERTICAL_FREQ = 0.09
const WIND_VERTICAL_AMP = 0.07

const LIFESPAN_MIN = 1.0
const LIFESPAN_MAX = 2.0
const VEL_JITTER_X = 0.08
const VEL_JITTER_Y = 0.06
const VEL_JITTER_Z = 0.06
const FADE_IN = 0.12
// Reject downwind spawns this fraction of the time, retrying up to MAX_ATTEMPTS.
// Net effect: ~80% of grains lift from the windward face.
const UPWIND_BIAS = 0.7
const MAX_ATTEMPTS = 4

const POINT_SIZE_RATIO = 0.85

type PointsRef = MutableRefObject<THREE.Points | null>

function fade(p: number) {
  if (p < FADE_IN) return p / FADE_IN
  return Math.max(0, 1 - (p - FADE_IN) / (1 - FADE_IN))
}

type Pool = {
  positions: Float32Array
  colors: Float32Array
  baseColors: Float32Array
  velJitter: Float32Array
  life: Float32Array
  lifespan: Float32Array
  glyphProfile: GlyphProfile | null
}

function makePool(config: PlanetVisual, size: number): Pool {
  const positions = new Float32Array(size * 3)
  const colors = new Float32Array(size * 3)
  const baseColors = new Float32Array(size * 3)
  const velJitter = new Float32Array(size * 3)
  const life = new Float32Array(size)
  const lifespan = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    // Lifespans are randomized so the pool desyncs naturally after the first
    // cycle; life starts at lifespan so every slot respawns on frame 1, when
    // body/ring matrixWorld is finally available.
    lifespan[i] = LIFESPAN_MIN + Math.random() * (LIFESPAN_MAX - LIFESPAN_MIN)
    life[i] = lifespan[i]
    velJitter[i * 3 + 0] = (Math.random() - 0.5) * VEL_JITTER_X
    velJitter[i * 3 + 1] = (Math.random() - 0.5) * VEL_JITTER_Y
    velJitter[i * 3 + 2] = (Math.random() - 0.5) * VEL_JITTER_Z
  }
  const glyphProfile = prepareGlyphProfile(
    config.glyph,
    config.bodyScale * GLYPH_SCALE_RATIO,
  )
  return { positions, colors, baseColors, velJitter, life, lifespan, glyphProfile }
}

export type WindDriftProps = {
  config: PlanetVisual
  morphRef: MutableRefObject<number>
  bodyRef: PointsRef
  ringRef: PointsRef
}

export default function WindDrift({
  config,
  morphRef,
  bodyRef,
  ringRef,
}: WindDriftProps) {
  const ringCount = config.ring?.particleCount ?? 0
  const total = config.particleCount + ringCount
  const poolSize = Math.max(
    POOL_MIN,
    Math.min(POOL_MAX, Math.round(total * POOL_FRACTION)),
  )
  const ringFraction = ringCount / total

  const pool = useMemo(() => makePool(config, poolSize), [config, poolSize])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const pointsRef = useRef<THREE.Points>(null!)

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime

    const dirAngle = Math.sin(t * WIND_DIR_FREQ) * WIND_DIR_AMP
    const gust =
      1 +
      WIND_GUST_AMP * Math.sin(t * WIND_GUST_FREQ) +
      WIND_GUST_AMP_2 * Math.sin(t * WIND_GUST_FREQ_2 + 1.7)
    const vertical = Math.sin(t * WIND_VERTICAL_FREQ + 1.3) * WIND_VERTICAL_AMP
    // Clamp so a deep gust trough doesn't reverse the wind.
    const speed = WIND_BASE_SPEED * config.bodyScale * Math.max(0.2, gust)
    const wx = Math.cos(dirAngle) * speed
    const wy = vertical * speed
    const wz = Math.sin(dirAngle) * speed

    const morph = morphRef.current
    const body = bodyRef.current
    const ring = ringRef.current

    for (let i = 0; i < poolSize; i++) {
      const li = pool.life[i] + delta
      const ls = pool.lifespan[i]
      if (li >= ls) {
        respawn(i, pool, config, morph, body, ring, ringFraction, tmp)
      } else {
        pool.life[i] = li
        const vx = wx + pool.velJitter[i * 3 + 0]
        const vy = wy + pool.velJitter[i * 3 + 1]
        const vz = wz + pool.velJitter[i * 3 + 2]
        pool.positions[i * 3 + 0] += vx * delta
        pool.positions[i * 3 + 1] += vy * delta
        pool.positions[i * 3 + 2] += vz * delta
        const a = fade(li / ls)
        pool.colors[i * 3 + 0] = pool.baseColors[i * 3 + 0] * a
        pool.colors[i * 3 + 1] = pool.baseColors[i * 3 + 1] * a
        pool.colors[i * 3 + 2] = pool.baseColors[i * 3 + 2] * a
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
        size={config.pointSize * POINT_SIZE_RATIO}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
      />
    </points>
  )
}

function respawn(
  i: number,
  pool: Pool,
  config: PlanetVisual,
  morph: number,
  body: THREE.Points | null,
  ring: THREE.Points | null,
  ringFraction: number,
  tmp: THREE.Vector3,
) {
  const useRing =
    ring !== null && config.ring !== undefined && Math.random() < ringFraction
  let r = 0,
    g = 0,
    b = 0

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (useRing) {
      const ringCfg = config.ring!
      const f = Math.random()
      const radius =
        (ringCfg.inner + f * (ringCfg.outer - ringCfg.inner)) * config.bodyScale
      const theta = Math.random() * Math.PI * 2
      const yJ = (Math.random() - 0.5) * (ringCfg.thickness ?? 0.01) * config.bodyScale
      tmp.set(radius * Math.cos(theta), yJ, radius * Math.sin(theta))
      tmp.applyMatrix4(ring!.matrixWorld)
      const [cr, cg, cb] = ringCfg.color
      const j = (Math.random() - 0.5) * 0.06
      r = cr + j
      g = cg + j
      b = cb + j
    } else if (body !== null) {
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const dx = Math.sin(phi) * Math.cos(theta)
      const dy = Math.cos(phi)
      const dz = Math.sin(phi) * Math.sin(theta)
      const radius = config.bodyScale * (0.97 + Math.random() * 0.03)
      let bx = dx * radius
      let by = dy * radius
      let bz = dz * radius
      // When morphed, lift sand from the glyph silhouette instead of the
      // sphere — keeps the symbol shedding too. Glyph z is 0 (flat).
      if (morph > 0.001 && pool.glyphProfile) {
        const gp = pool.glyphProfile
        const idx = (Math.random() * gp.opaqueX.length) | 0
        const gx = (gp.opaqueX[idx] - gp.cx) * gp.norm
        const gy = -(gp.opaqueY[idx] - gp.cy) * gp.norm
        bx = bx + (gx - bx) * morph
        by = by + (gy - by) * morph
        bz = bz + (0 - bz) * morph
      }
      tmp.set(bx, by, bz).applyMatrix4(body.matrixWorld)
      const [cr, cg, cb] = config.colorAt(dx, dy, dz)
      r = cr
      g = cg
      b = cb
    } else {
      // No source available yet (refs not attached on frame 0). Leave the
      // slot at end-of-life so the next frame retries the spawn.
      pool.life[i] = pool.lifespan[i]
      return
    }
    // Upwind bias is on world-space x: reject the leeward face most of the
    // time, so retried samples tend toward the windward face.
    if (tmp.x <= 0 || Math.random() > UPWIND_BIAS) break
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
