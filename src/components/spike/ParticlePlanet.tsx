import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual, RingConfig, SatelliteConfig } from './planetConfig'

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
    return { positions, colors, dirs, baseRadii, phases }
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

function PlanetBody({ config }: { config: PlanetVisual }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, colors, dirs, baseRadii, phases } = useSphereAttributes(config)
  const amp = config.bodyScale * BODY_WOBBLE_AMP
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * config.rotationSpeed
    const t = state.clock.elapsedTime
    const n = config.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * BODY_WOBBLE_FREQ + phases[i]) * amp
      positions[i * 3 + 0] = dirs[i * 3 + 0] * r
      positions[i * 3 + 1] = dirs[i * 3 + 1] * r
      positions[i * 3 + 2] = dirs[i * 3 + 2] * r
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
        size={config.pointSize}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.95}
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
}: {
  ring: RingConfig
  bodyScale: number
  speed: number
  pointSize: number
}) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, colors, baseRadii, baseThetas, baseYs, phases } =
    useRingAttributes(ring, bodyScale)
  const amp = bodyScale * RING_WOBBLE_AMP
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * speed
    const t = state.clock.elapsedTime
    const n = ring.particleCount
    for (let i = 0; i < n; i++) {
      const r = baseRadii[i] + Math.sin(t * RING_WOBBLE_FREQ + phases[i]) * amp
      const theta = baseThetas[i]
      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = baseYs[i]
      positions[i * 3 + 2] = r * Math.sin(theta)
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
        size={pointSize}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}

function PlanetSelf({ config }: { config: PlanetVisual }) {
  return (
    <group rotation-z={config.axisRoll ?? 0}>
      <group rotation-x={config.axisTilt}>
        <PlanetBody config={config} />
        {config.ring && (
          <PlanetRing
            ring={config.ring}
            bodyScale={config.bodyScale}
            speed={config.ringRotationSpeed ?? config.rotationSpeed * 0.5}
            pointSize={config.pointSize}
          />
        )}
      </group>
    </group>
  )
}

function Satellite({ sat }: { sat: SatelliteConfig }) {
  const orbitRef = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * sat.orbitSpeed
  })
  return (
    <group rotation-x={sat.inclination ?? 0}>
      <group ref={orbitRef} rotation-y={sat.phase ?? 0}>
        <group position={[sat.orbitRadius, 0, 0]}>
          <PlanetSelf config={sat.body} />
        </group>
      </group>
    </group>
  )
}

function PlanetScene({ config }: { config: PlanetVisual }) {
  return (
    <>
      <PlanetSelf config={config} />
      {config.satellites?.map((sat) => (
        <Satellite key={sat.body.name} sat={sat} />
      ))}
    </>
  )
}

export default function ParticlePlanet({ config }: { config: PlanetVisual }) {
  const width = config.width ?? config.height
  const height = config.height
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width, height }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 30 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <PlanetScene config={config} />
        </Canvas>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-earth-500">
        {config.name}
      </div>
    </div>
  )
}
