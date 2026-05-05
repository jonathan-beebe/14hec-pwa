import { useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual, RingConfig, SatelliteConfig } from './planetConfig'
import { prepareGlyphProfile, sampleFromProfile, pairByAngle } from './glyphSampler'
import WindDrift, { WIND_ENABLED } from './WindDrift'

const GLYPH_SCALE_RATIO = 0.85
const MORPH_LAMBDA = 7
const SPARKLE_BASE = 0.5
const SPARKLE_AMP = 0.5
const SPARKLE_FREQ_1 = 1.7
const SPARKLE_FREQ_2 = 2.7
const MORPH_IDLE_EPSILON = 0.01

function sparkle(t: number, phase: number) {
  const s1 = Math.sin(t * SPARKLE_FREQ_1 + phase * 1.7)
  const s2 = Math.sin(t * SPARKLE_FREQ_2 + phase * 0.9)
  return SPARKLE_BASE + SPARKLE_AMP * s1 * s2
}

type MorphRef = MutableRefObject<number>
type PointsRef = MutableRefObject<THREE.Points | null>

function useSphereAttributes(config: PlanetVisual) {
  return useMemo(() => {
    const n = config.particleCount
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const baseColors = new Float32Array(n * 3)
    const dirs = new Float32Array(n * 3)
    const baseRadii = new Float32Array(n)
    const phases = new Float32Array(n)
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
    }
    // Profile + scratch are retained so each engagement can re-roll the glyph
    // sample and pairing in place — keeps the morph from looking identical
    // every time without allocating on the hot path.
    const glyphProfile = prepareGlyphProfile(
      config.glyph,
      config.bodyScale * GLYPH_SCALE_RATIO,
    )
    const glyphScratch = new Float32Array(n * 3)
    const glyphTargets = new Float32Array(n * 3)
    sampleFromProfile(glyphProfile, n, glyphScratch)
    pairByAngle(dirs, glyphScratch, n, 0, glyphTargets)
    return {
      positions,
      colors,
      baseColors,
      dirs,
      baseRadii,
      phases,
      glyphProfile,
      glyphScratch,
      glyphTargets,
    }
  }, [config])
}

function useRingAttributes(ring: RingConfig, bodyScale: number) {
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
    return { positions, colors, baseColors, baseRadii, baseThetas, baseYs, phases }
  }, [ring, bodyScale])
}

const BODY_WOBBLE_FREQ = 1.4
const BODY_WOBBLE_AMP = 0.015
const RING_WOBBLE_FREQ = 1.1
const RING_WOBBLE_AMP = 0.018
const BODY_BASE_OPACITY = 0.95
const RING_BASE_OPACITY = 0.9

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
    glyphProfile,
    glyphScratch,
    glyphTargets,
  } = useSphereAttributes(config)
  const amp = config.bodyScale * BODY_WOBBLE_AMP
  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return
    const m = morphRef.current
    const prevM = prevMorphRef.current
    // Re-roll glyph targets on the trailing edge of the morph (settling back
    // to idle). Doing it here — not on engage — guarantees we never swap
    // targets mid-flight, which would snap particles. Next engagement then
    // pulls from a fresh sample with a fresh angular pairing rotation.
    if (prevM > MORPH_IDLE_EPSILON && m <= MORPH_IDLE_EPSILON) {
      const n = config.particleCount
      sampleFromProfile(glyphProfile, n, glyphScratch)
      const k = (Math.random() * n) | 0
      pairByAngle(dirs, glyphScratch, n, k, glyphTargets)
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
      positions[i * 3 + 0] = sx + (tx - sx) * m
      positions[i * 3 + 1] = sy + (ty - sy) * m
      positions[i * 3 + 2] = sz + (tz - sz) * m
      const s = sparkle(t, phases[i])
      colors[i * 3 + 0] = baseColors[i * 3 + 0] * s
      colors[i * 3 + 1] = baseColors[i * 3 + 1] * s
      colors[i * 3 + 2] = baseColors[i * 3 + 2] * s
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
  speed,
  pointSize,
  morphRef,
  pointsRef,
}: {
  ring: RingConfig
  bodyScale: number
  speed: number
  pointSize: number
  morphRef: MorphRef
  pointsRef: PointsRef
}) {
  const matRef = useRef<THREE.PointsMaterial>(null!)
  const { positions, colors, baseColors, baseRadii, baseThetas, baseYs, phases } =
    useRingAttributes(ring, bodyScale)
  const amp = bodyScale * RING_WOBBLE_AMP
  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return
    const m = morphRef.current
    const inv = 1 - m
    points.rotation.y += delta * speed * inv
    const t = state.clock.elapsedTime
    const wobble = amp * inv
    const n = ring.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * RING_WOBBLE_FREQ + phases[i]) * wobble
      const theta = baseThetas[i]
      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = baseYs[i]
      positions[i * 3 + 2] = r * Math.sin(theta)
      const s = sparkle(t, phases[i])
      colors[i * 3 + 0] = baseColors[i * 3 + 0] * s
      colors[i * 3 + 1] = baseColors[i * 3 + 1] * s
      colors[i * 3 + 2] = baseColors[i * 3 + 2] * s
    }
    const attr = points.geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    const cAttr = points.geometry.attributes.color as THREE.BufferAttribute
    cAttr.needsUpdate = true
    if (matRef.current) matRef.current.opacity = RING_BASE_OPACITY * inv
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

function PlanetScene({
  config,
  morphTarget,
}: {
  config: PlanetVisual
  morphTarget: number
}) {
  const morphRef = useRef(0)
  // Body / ring refs live at scene root so WindDrift can read matrixWorld for
  // spawn positions — drift is in world space and must not inherit the
  // planet's spin or tilt.
  const bodyRef = useRef<THREE.Points | null>(null)
  const ringRef = useRef<THREE.Points | null>(null)
  useFrame((_, delta) => {
    morphRef.current = THREE.MathUtils.damp(
      morphRef.current,
      morphTarget,
      MORPH_LAMBDA,
      delta,
    )
  })
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
      {WIND_ENABLED && (
        <WindDrift
          config={config}
          morphRef={morphRef}
          bodyRef={bodyRef}
          ringRef={ringRef}
        />
      )}
    </>
  )
}

export default function ParticlePlanet({
  config,
  selected = false,
  onSelect,
}: {
  config: PlanetVisual
  selected?: boolean
  onSelect?: () => void
}) {
  const width = config.width ?? config.height
  const height = config.height
  const [hovered, setHovered] = useState(false)
  const engaged = selected || hovered

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{ width, height }}
        className="cursor-pointer select-none touch-manipulation"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onSelect}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 30 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <PlanetScene config={config} morphTarget={engaged ? 1 : 0} />
        </Canvas>
      </div>
      <div
        className={`text-[10px] uppercase tracking-widest transition-colors ${
          selected ? 'text-celestial-300' : 'text-earth-500'
        }`}
      >
        {config.name}
      </div>
    </div>
  )
}
