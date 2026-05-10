import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual, RingConfig, SatelliteConfig } from './planetConfig'
import { prepareGlyphProfile, sampleFromProfile } from './glyphSampler'

const GLYPH_SCALE_RATIO = 0.85
const MORPH_LAMBDA = 7
const SPARKLE_BASE = 0.5
const SPARKLE_AMP = 0.5
const SPARKLE_FREQ_1 = 1.7
const SPARKLE_FREQ_2 = 2.7
const MORPH_IDLE_EPSILON = 0.01

const BODY_WOBBLE_FREQ = 1.4
const BODY_WOBBLE_AMP = 0.015
const RING_WOBBLE_FREQ = 1.1
const RING_WOBBLE_AMP = 0.018
const BODY_BASE_OPACITY = 0.95
const RING_BASE_OPACITY = 0.9

// Particles on the camera-facing side of the sphere paint at full color;
// the far side dims toward this floor. Adds 3D form to a flat point cloud.
const DEPTH_MIN = 0.15

// Fraction of body particles tagged as bright glints. Same idea as the
// wind-drift sparkle fraction: stable per-particle boost (no flicker),
// depth-gated so they only show on the camera-facing side.
const BODY_SPARKLE_FRACTION = 0.07

export { MORPH_LAMBDA }

function sparkle(t: number, phase: number) {
  const s1 = Math.sin(t * SPARKLE_FREQ_1 + phase * 1.7)
  const s2 = Math.sin(t * SPARKLE_FREQ_2 + phase * 0.9)
  return SPARKLE_BASE + SPARKLE_AMP * s1 * s2
}

export type MorphRef = MutableRefObject<number>
export type PointsRef = MutableRefObject<THREE.Points | null>

function useSphereAttributes(config: PlanetVisual) {
  return useMemo(() => {
    const n = config.particleCount
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const baseColors = new Float32Array(n * 3)
    const dirs = new Float32Array(n * 3)
    const baseRadii = new Float32Array(n)
    const phases = new Float32Array(n)
    const isSparkle = new Uint8Array(n)
    const sparkleBoost = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const dx = Math.sin(phi) * Math.cos(theta)
      const dy = Math.cos(phi)
      const dz = Math.sin(phi) * Math.sin(theta)
      const r = (0.97 + Math.random() * 0.03) * config.bodyScale
      dirs[i * 3 + 0] = dx
      dirs[i * 3 + 1] = dy
      dirs[i * 3 + 2] = dz
      baseRadii[i] = r
      phases[i] = Math.random() * Math.PI * 2
      positions[i * 3 + 0] = dx * r
      positions[i * 3 + 1] = dy * r
      positions[i * 3 + 2] = dz * r
      const [cr, cg, cb] = config.colorAt(dx, dy, dz)
      baseColors[i * 3 + 0] = cr
      baseColors[i * 3 + 1] = cg
      baseColors[i * 3 + 2] = cb
      colors[i * 3 + 0] = cr * SPARKLE_BASE
      colors[i * 3 + 1] = cg * SPARKLE_BASE
      colors[i * 3 + 2] = cb * SPARKLE_BASE
      if (Math.random() < BODY_SPARKLE_FRACTION) {
        isSparkle[i] = 1
        sparkleBoost[i] = Math.random()
      }
    }
    // Profile is retained so each engagement can re-sample the glyph in place.
    // sampleFromProfile draws each particle's target independently from the
    // silhouette, so writing straight into glyphTargets gives a fully random
    // pairing — neighboring sphere particles end up at unrelated glyph points.
    const glyphProfile = prepareGlyphProfile(
      config.glyph,
      config.bodyScale * GLYPH_SCALE_RATIO,
    )
    const glyphTargets = new Float32Array(n * 3)
    sampleFromProfile(glyphProfile, n, glyphTargets)
    return {
      positions,
      colors,
      baseColors,
      dirs,
      baseRadii,
      phases,
      isSparkle,
      sparkleBoost,
      glyphProfile,
      glyphTargets,
    }
  }, [config])
}

function useRingAttributes(ring: RingConfig, bodyScale: number, glyph: string) {
  return useMemo(() => {
    const n = ring.particleCount
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const baseColors = new Float32Array(n * 3)
    const baseRadii = new Float32Array(n)
    const baseThetas = new Float32Array(n)
    const baseYs = new Float32Array(n)
    const phases = new Float32Array(n)
    const thickness = ring.thickness ?? 0.01
    for (let i = 0; i < n; i++) {
      const t = Math.random()
      const r = (ring.inner + t * (ring.outer - ring.inner)) * bodyScale
      const theta = 2 * Math.PI * Math.random()
      const y = (Math.random() - 0.5) * thickness * bodyScale
      baseRadii[i] = r
      baseThetas[i] = theta
      baseYs[i] = y
      phases[i] = Math.random() * Math.PI * 2
      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = r * Math.sin(theta)
      const dim = t > 0.55 && t < 0.62 ? 0.35 : 1.0
      const fade = 0.85 + Math.random() * 0.25
      const [cr, cg, cb] = ring.color
      const j = (Math.random() - 0.5) * 0.06
      const br = (cr + j) * dim * fade
      const bg = (cg + j) * dim * fade
      const bb = (cb + j) * dim * fade
      baseColors[i * 3 + 0] = br
      baseColors[i * 3 + 1] = bg
      baseColors[i * 3 + 2] = bb
      colors[i * 3 + 0] = br * SPARKLE_BASE
      colors[i * 3 + 1] = bg * SPARKLE_BASE
      colors[i * 3 + 2] = bb * SPARKLE_BASE
    }
    const glyphProfile = prepareGlyphProfile(glyph, bodyScale * GLYPH_SCALE_RATIO)
    const glyphTargets = new Float32Array(n * 3)
    sampleFromProfile(glyphProfile, n, glyphTargets)
    return {
      positions,
      colors,
      baseColors,
      baseRadii,
      baseThetas,
      baseYs,
      phases,
      glyphProfile,
      glyphTargets,
    }
  }, [ring, bodyScale, glyph])
}

function PlanetBody({
  config,
  morphRef,
  pointsRef,
}: {
  config: PlanetVisual
  morphRef: MorphRef
  pointsRef: PointsRef
}) {
  const matRef = useRef<THREE.PointsMaterial>(null!)
  const targetYawRef = useRef<number | null>(null)
  const prevMorphRef = useRef(0)
  const {
    positions,
    colors,
    baseColors,
    dirs,
    baseRadii,
    phases,
    isSparkle,
    sparkleBoost,
    glyphProfile,
    glyphTargets,
  } = useSphereAttributes(config)
  const amp = config.bodyScale * BODY_WOBBLE_AMP
  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return
    const m = morphRef.current
    const prevM = prevMorphRef.current
    // Trailing edge of the morph (settling back to idle): shuffle each
    // particle's identity and re-sample glyph targets. Permuting the full
    // per-particle tuple — dirs, baseRadii, baseColors, phases, isSparkle,
    // sparkleBoost — in lockstep keeps the SET of (position, color) pairs
    // unchanged at m=0, so the swap is pixel-perfect invisible. What
    // changes is each particle's individual trajectory: on the next
    // engagement, particle i runs from its new home to an independently
    // sampled glyph point — neighbors on the sphere scatter to unrelated
    // destinations rather than swirling together.
    if (prevM > MORPH_IDLE_EPSILON && m <= MORPH_IDLE_EPSILON) {
      const n = config.particleCount
      const perm = new Int32Array(n)
      for (let i = 0; i < n; i++) perm[i] = i
      for (let i = n - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0
        const tmp = perm[i]
        perm[i] = perm[j]
        perm[j] = tmp
      }
      const dirsCopy = dirs.slice()
      const radiiCopy = baseRadii.slice()
      const colorsCopy = baseColors.slice()
      const phasesCopy = phases.slice()
      const sparkleFlagCopy = isSparkle.slice()
      const sparkleBoostCopy = sparkleBoost.slice()
      for (let i = 0; i < n; i++) {
        const p = perm[i]
        dirs[i * 3 + 0] = dirsCopy[p * 3 + 0]
        dirs[i * 3 + 1] = dirsCopy[p * 3 + 1]
        dirs[i * 3 + 2] = dirsCopy[p * 3 + 2]
        baseRadii[i] = radiiCopy[p]
        baseColors[i * 3 + 0] = colorsCopy[p * 3 + 0]
        baseColors[i * 3 + 1] = colorsCopy[p * 3 + 1]
        baseColors[i * 3 + 2] = colorsCopy[p * 3 + 2]
        phases[i] = phasesCopy[p]
        isSparkle[i] = sparkleFlagCopy[p]
        sparkleBoost[i] = sparkleBoostCopy[p]
      }
      sampleFromProfile(glyphProfile, n, glyphTargets)
    }
    prevMorphRef.current = m
    const inv = 1 - m
    if (m < 0.001) {
      targetYawRef.current = null
      points.rotation.y += delta * config.rotationSpeed
    } else {
      if (targetYawRef.current === null) {
        const TWO_PI = Math.PI * 2
        targetYawRef.current =
          Math.round(points.rotation.y / TWO_PI) * TWO_PI
      }
      points.rotation.y = THREE.MathUtils.damp(
        points.rotation.y,
        targetYawRef.current,
        MORPH_LAMBDA,
        delta,
      )
    }
    // Refresh matrixWorld so depth shading reflects the rotation.y just set
    // (and any tilt set by PlanetSelf this frame). Third row of the upper-3x3
    // (column-major: e[2], e[6], e[10]) maps a local offset to its world-z
    // component; column length gives uniform scale → world sphere radius.
    points.updateWorldMatrix(true, false)
    const e = points.matrixWorld.elements
    const m20 = e[2]
    const m21 = e[6]
    const m22 = e[10]
    const c0 = e[8]
    const c1 = e[9]
    const worldScale = Math.sqrt(c0 * c0 + c1 * c1 + m22 * m22)
    const invDepthNorm = 1 / (config.bodyScale * worldScale)
    const t = state.clock.elapsedTime
    const wobble = amp * inv
    const n = config.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * BODY_WOBBLE_FREQ + phases[i]) * wobble
      const sx = dirs[i * 3 + 0] * r
      const sy = dirs[i * 3 + 1] * r
      const sz = dirs[i * 3 + 2] * r
      const tx = glyphTargets[i * 3 + 0]
      const ty = glyphTargets[i * 3 + 1]
      const tz = glyphTargets[i * 3 + 2]
      const px = sx + (tx - sx) * m
      const py = sy + (ty - sy) * m
      const pz = sz + (tz - sz) * m
      positions[i * 3 + 0] = px
      positions[i * 3 + 1] = py
      positions[i * 3 + 2] = pz
      let nz = (m20 * px + m21 * py + m22 * pz) * invDepthNorm
      if (nz < -1) nz = -1
      else if (nz > 1) nz = 1
      const depth = DEPTH_MIN + (1 - DEPTH_MIN) * ((nz + 1) * 0.5)
      const s = sparkle(t, phases[i])
      if (isSparkle[i]) {
        // White glint: per-particle boost gives stable peak brightness;
        // depth gates it to the camera-facing hemisphere so sparkles fade
        // out as they rotate to the back. The existing sparkle() oscillator
        // adds a soft twinkle on top.
        const k = sparkleBoost[i] * depth * s
        colors[i * 3 + 0] = k
        colors[i * 3 + 1] = k
        colors[i * 3 + 2] = k
      } else {
        const k = s * depth
        colors[i * 3 + 0] = baseColors[i * 3 + 0] * k
        colors[i * 3 + 1] = baseColors[i * 3 + 1] * k
        colors[i * 3 + 2] = baseColors[i * 3 + 2] * k
      }
    }
    const attr = points.geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    const cAttr = points.geometry.attributes.color as THREE.BufferAttribute
    cAttr.needsUpdate = true
  })
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={config.pointSize}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={BODY_BASE_OPACITY}
        depthWrite={false}
      />
    </points>
  )
}

function PlanetRing({
  ring,
  bodyScale,
  glyph,
  speed,
  pointSize,
  morphRef,
  pointsRef,
}: {
  ring: RingConfig
  bodyScale: number
  glyph: string
  speed: number
  pointSize: number
  morphRef: MorphRef
  pointsRef: PointsRef
}) {
  const targetYawRef = useRef<number | null>(null)
  const prevMorphRef = useRef(0)
  const {
    positions,
    colors,
    baseColors,
    baseRadii,
    baseThetas,
    baseYs,
    phases,
    glyphProfile,
    glyphTargets,
  } = useRingAttributes(ring, bodyScale, glyph)
  const amp = bodyScale * RING_WOBBLE_AMP
  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return
    const m = morphRef.current
    const prevM = prevMorphRef.current
    // Trailing edge: permute identities and re-sample glyph targets. Same
    // approach as PlanetBody — moving every per-particle attribute together
    // (radii, thetas, ys, baseColors, phases) keeps the SET of points
    // pixel-identical at m=0, so disengage settle is invisible. The fresh
    // sampleFromProfile draws each particle's destination independently,
    // so neighbors on the ring scatter to unrelated glyph points instead
    // of swirling.
    if (prevM > MORPH_IDLE_EPSILON && m <= MORPH_IDLE_EPSILON) {
      const n = ring.particleCount
      const perm = new Int32Array(n)
      for (let i = 0; i < n; i++) perm[i] = i
      for (let i = n - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0
        const tmp = perm[i]
        perm[i] = perm[j]
        perm[j] = tmp
      }
      const radiiCopy = baseRadii.slice()
      const thetasCopy = baseThetas.slice()
      const ysCopy = baseYs.slice()
      const colorsCopy = baseColors.slice()
      const phasesCopy = phases.slice()
      for (let i = 0; i < n; i++) {
        const p = perm[i]
        baseRadii[i] = radiiCopy[p]
        baseThetas[i] = thetasCopy[p]
        baseYs[i] = ysCopy[p]
        baseColors[i * 3 + 0] = colorsCopy[p * 3 + 0]
        baseColors[i * 3 + 1] = colorsCopy[p * 3 + 1]
        baseColors[i * 3 + 2] = colorsCopy[p * 3 + 2]
        phases[i] = phasesCopy[p]
      }
      sampleFromProfile(glyphProfile, n, glyphTargets)
    }
    prevMorphRef.current = m
    const inv = 1 - m
    // Anchor yaw to a multiple of 2π during morph so the glyph (defined in
    // local XY) lands camera-facing instead of yawed off by a stale rotation.
    if (m < 0.001) {
      targetYawRef.current = null
      points.rotation.y += delta * speed
    } else {
      if (targetYawRef.current === null) {
        const TWO_PI = Math.PI * 2
        targetYawRef.current =
          Math.round(points.rotation.y / TWO_PI) * TWO_PI
      }
      points.rotation.y = THREE.MathUtils.damp(
        points.rotation.y,
        targetYawRef.current,
        MORPH_LAMBDA,
        delta,
      )
    }
    // Same depth-shading approach as the body — see PlanetBody useFrame for
    // matrix derivation. Ring particles extend out to ring.outer * bodyScale,
    // so we normalize by that instead of bodyScale or every grain clamps to
    // the depth extremes.
    points.updateWorldMatrix(true, false)
    const e = points.matrixWorld.elements
    const m20 = e[2]
    const m21 = e[6]
    const m22 = e[10]
    const c0 = e[8]
    const c1 = e[9]
    const worldScale = Math.sqrt(c0 * c0 + c1 * c1 + m22 * m22)
    const invDepthNorm = 1 / (ring.outer * bodyScale * worldScale)
    const t = state.clock.elapsedTime
    const wobble = amp * inv
    const n = ring.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * RING_WOBBLE_FREQ + phases[i]) * wobble
      const theta = baseThetas[i]
      const sx = r * Math.cos(theta)
      const sy = baseYs[i]
      const sz = r * Math.sin(theta)
      const tx = glyphTargets[i * 3 + 0]
      const ty = glyphTargets[i * 3 + 1]
      const tz = glyphTargets[i * 3 + 2]
      const px = sx + (tx - sx) * m
      const py = sy + (ty - sy) * m
      const pz = sz + (tz - sz) * m
      positions[i * 3 + 0] = px
      positions[i * 3 + 1] = py
      positions[i * 3 + 2] = pz
      let nz = (m20 * px + m21 * py + m22 * pz) * invDepthNorm
      if (nz < -1) nz = -1
      else if (nz > 1) nz = 1
      const depth = DEPTH_MIN + (1 - DEPTH_MIN) * ((nz + 1) * 0.5)
      const s = sparkle(t, phases[i])
      const k = s * depth
      colors[i * 3 + 0] = baseColors[i * 3 + 0] * k
      colors[i * 3 + 1] = baseColors[i * 3 + 1] * k
      colors[i * 3 + 2] = baseColors[i * 3 + 2] * k
    }
    const attr = points.geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    const cAttr = points.geometry.attributes.color as THREE.BufferAttribute
    cAttr.needsUpdate = true
  })
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={RING_BASE_OPACITY}
        depthWrite={false}
      />
    </points>
  )
}

function PlanetSelf({
  config,
  morphRef,
  bodyRef,
  ringRef,
}: {
  config: PlanetVisual
  morphRef: MorphRef
  bodyRef?: PointsRef
  ringRef?: PointsRef
}) {
  const tiltRef = useRef<THREE.Group>(null!)
  const internalBodyRef = useRef<THREE.Points | null>(null)
  const internalRingRef = useRef<THREE.Points | null>(null)
  const effBodyRef = bodyRef ?? internalBodyRef
  const effRingRef = ringRef ?? internalRingRef
  useFrame(() => {
    if (!tiltRef.current) return
    const inv = 1 - morphRef.current
    tiltRef.current.rotation.x = config.axisTilt * inv
    tiltRef.current.rotation.z = (config.axisRoll ?? 0) * inv
  })
  return (
    <group ref={tiltRef}>
      <PlanetBody config={config} morphRef={morphRef} pointsRef={effBodyRef} />
      {config.ring && (
        <PlanetRing
          ring={config.ring}
          bodyScale={config.bodyScale}
          glyph={config.glyph}
          speed={config.ringRotationSpeed ?? config.rotationSpeed * 0.5}
          pointSize={config.pointSize}
          morphRef={morphRef}
          pointsRef={effRingRef}
        />
      )}
    </group>
  )
}

function Satellite({ sat, morphRef }: { sat: SatelliteConfig; morphRef: MorphRef }) {
  const orbitRef = useRef<THREE.Group>(null!)
  const wrapRef = useRef<THREE.Group>(null!)
  const innerMorphRef = useRef(0)
  useFrame((_, delta) => {
    const inv = 1 - morphRef.current
    if (orbitRef.current) orbitRef.current.rotation.y += delta * sat.orbitSpeed * inv
    if (wrapRef.current) wrapRef.current.scale.setScalar(inv)
  })
  return (
    <group ref={wrapRef} rotation-x={sat.inclination ?? 0}>
      <group ref={orbitRef} rotation-y={sat.phase ?? 0}>
        <group position={[sat.orbitRadius, 0, 0]}>
          <PlanetSelf config={sat.body} morphRef={innerMorphRef} />
        </group>
      </group>
    </group>
  )
}

/**
 * One planet + ring + satellites, scene-only (no Canvas). The owning scene
 * supplies morph + body/ring refs so a global wind field can read matrixWorld
 * for spawn positions, and so engagement state can come from picker hover.
 */
export default function PlanetCluster({
  config,
  morphRef,
  bodyRef,
  ringRef,
}: {
  config: PlanetVisual
  morphRef: MorphRef
  bodyRef: PointsRef
  ringRef: PointsRef
}) {
  return (
    <>
      <PlanetSelf
        config={config}
        morphRef={morphRef}
        bodyRef={bodyRef}
        ringRef={ringRef}
      />
      {config.satellites?.map((sat) => (
        <Satellite key={sat.body.name} sat={sat} morphRef={morphRef} />
      ))}
    </>
  )
}
