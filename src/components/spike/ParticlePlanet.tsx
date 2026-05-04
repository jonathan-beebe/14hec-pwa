import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual, RingConfig } from './planetConfig'

function useSphereAttributes(config: PlanetVisual) {
  return useMemo(() => {
    const positions = new Float32Array(config.particleCount * 3)
    const colors = new Float32Array(config.particleCount * 3)
    for (let i = 0; i < config.particleCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = (0.97 + Math.random() * 0.03) * config.bodyScale
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.cos(phi)
      const z = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      const nx = x / config.bodyScale
      const ny = y / config.bodyScale
      const nz = z / config.bodyScale
      const [cr, cg, cb] = config.colorAt(nx, ny, nz)
      colors[i * 3 + 0] = cr
      colors[i * 3 + 1] = cg
      colors[i * 3 + 2] = cb
    }
    return { positions, colors }
  }, [config])
}

function useRingAttributes(ring: RingConfig, bodyScale: number) {
  return useMemo(() => {
    const positions = new Float32Array(ring.particleCount * 3)
    const colors = new Float32Array(ring.particleCount * 3)
    const thickness = ring.thickness ?? 0.01
    for (let i = 0; i < ring.particleCount; i++) {
      const t = Math.random()
      const r = (ring.inner + t * (ring.outer - ring.inner)) * bodyScale
      const theta = 2 * Math.PI * Math.random()
      const x = r * Math.cos(theta)
      const z = r * Math.sin(theta)
      const y = (Math.random() - 0.5) * thickness * bodyScale
      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      const dim = t > 0.55 && t < 0.62 ? 0.35 : 1.0
      const fade = 0.85 + Math.random() * 0.25
      const [cr, cg, cb] = ring.color
      const j = (Math.random() - 0.5) * 0.06
      colors[i * 3 + 0] = (cr + j) * dim * fade
      colors[i * 3 + 1] = (cg + j) * dim * fade
      colors[i * 3 + 2] = (cb + j) * dim * fade
    }
    return { positions, colors }
  }, [ring, bodyScale])
}

function PlanetBody({ config }: { config: PlanetVisual }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, colors } = useSphereAttributes(config)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * config.rotationSpeed
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
  const { positions, colors } = useRingAttributes(ring, bodyScale)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
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

function PlanetScene({ config }: { config: PlanetVisual }) {
  return (
    <group rotation-z={config.axisTilt}>
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
