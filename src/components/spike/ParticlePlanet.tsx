import { useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual, RingConfig, SatelliteConfig } from './planetConfig'
import { sampleGlyph, pairByAngle } from './glyphSampler'

const GLYPH_SCALE_RATIO = 0.85
const MORPH_LAMBDA = 7

type MorphRef = MutableRefObject<number>

function useSphereAttributes(config: PlanetVisual) {
  return useMemo(() => {
    const n = config.particleCount
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
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
      colors[i * 3 + 0] = cr
      colors[i * 3 + 1] = cg
      colors[i * 3 + 2] = cb
    }
    const glyphPoints = sampleGlyph(config.glyph, n, config.bodyScale * GLYPH_SCALE_RATIO)
    const glyphTargets = pairByAngle(dirs, glyphPoints, n)
    return { positions, colors, dirs, baseRadii, phases, glyphTargets }
  }, [config])
}

function useRingAttributes(ring: RingConfig, bodyScale: number) {
  return useMemo(() => {
    const n = ring.particleCount
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
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
      colors[i * 3 + 0] = (cr + j) * dim * fade
      colors[i * 3 + 1] = (cg + j) * dim * fade
      colors[i * 3 + 2] = (cb + j) * dim * fade
    }
    return { positions, colors, baseRadii, baseThetas, baseYs, phases }
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
}: {
  config: PlanetVisual
  morphRef: MorphRef
}) {
  const ref = useRef<THREE.Points>(null!)
  const matRef = useRef<THREE.PointsMaterial>(null!)
  const targetYawRef = useRef<number | null>(null)
  const { positions, colors, dirs, baseRadii, phases, glyphTargets } =
    useSphereAttributes(config)
  const amp = config.bodyScale * BODY_WOBBLE_AMP
  useFrame((state, delta) => {
    if (!ref.current) return
    const m = morphRef.current
    const inv = 1 - m
    if (m < 0.001) {
      targetYawRef.current = null
      ref.current.rotation.y += delta * config.rotationSpeed
    } else {
      if (targetYawRef.current === null) {
        const TWO_PI = Math.PI * 2
        targetYawRef.current =
          Math.round(ref.current.rotation.y / TWO_PI) * TWO_PI
      }
      ref.current.rotation.y = THREE.MathUtils.damp(
        ref.current.rotation.y,
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
    }
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
  })
  return (
    <points ref={ref}>
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
}: {
  ring: RingConfig
  bodyScale: number
  speed: number
  pointSize: number
  morphRef: MorphRef
}) {
  const ref = useRef<THREE.Points>(null!)
  const matRef = useRef<THREE.PointsMaterial>(null!)
  const { positions, colors, baseRadii, baseThetas, baseYs, phases } =
    useRingAttributes(ring, bodyScale)
  const amp = bodyScale * RING_WOBBLE_AMP
  useFrame((state, delta) => {
    if (!ref.current) return
    const m = morphRef.current
    const inv = 1 - m
    ref.current.rotation.y += delta * speed * inv
    const t = state.clock.elapsedTime
    const wobble = amp * inv
    const n = ring.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * RING_WOBBLE_FREQ + phases[i]) * wobble
      const theta = baseThetas[i]
      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = baseYs[i]
      positions[i * 3 + 2] = r * Math.sin(theta)
    }
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    if (matRef.current) matRef.current.opacity = RING_BASE_OPACITY * inv
  })
  return (
    <points ref={ref}>
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
}: {
  config: PlanetVisual
  morphRef: MorphRef
}) {
  const tiltRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (!tiltRef.current) return
    const inv = 1 - morphRef.current
    tiltRef.current.rotation.x = config.axisTilt * inv
    tiltRef.current.rotation.z = (config.axisRoll ?? 0) * inv
  })
  return (
    <group ref={tiltRef}>
      <PlanetBody config={config} morphRef={morphRef} />
      {config.ring && (
        <PlanetRing
          ring={config.ring}
          bodyScale={config.bodyScale}
          speed={config.ringRotationSpeed ?? config.rotationSpeed * 0.5}
          pointSize={config.pointSize}
          morphRef={morphRef}
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
      <PlanetSelf config={config} morphRef={morphRef} />
      {config.satellites?.map((sat) => (
        <Satellite key={sat.body.name} sat={sat} morphRef={morphRef} />
      ))}
    </>
  )
}

export default function ParticlePlanet({ config }: { config: PlanetVisual }) {
  const width = config.width ?? config.height
  const height = config.height
  const [engaged, setEngaged] = useState(false)
  const engagedByClick = useRef(false)

  const handleEnter = () => setEngaged(true)
  const handleLeave = () => {
    if (!engagedByClick.current) setEngaged(false)
  }
  const handleClick = () => {
    engagedByClick.current = !engagedByClick.current
    setEngaged(engagedByClick.current)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{ width, height }}
        className="cursor-pointer select-none touch-manipulation"
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 30 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <PlanetScene config={config} morphTarget={engaged ? 1 : 0} />
        </Canvas>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-earth-500">
        {config.name}
      </div>
    </div>
  )
}
