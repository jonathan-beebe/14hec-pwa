import { useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetVisual } from '@/components/design-system/components/planet/planetConfig'
import PlanetCluster, {
  MORPH_LAMBDA,
  type MorphRef,
  type PointsRef,
} from '@/components/design-system/components/planet/PlanetCluster'
import WindDrift, { WIND_ENABLED, type WindSource } from '@/components/design-system/components/planet/WindDrift'

// Per-canvas legacy used a perspective camera at z=4 fov=30°, giving a
// vertical world extent of 2 * 4 * tan(15°). Pinning the unified ortho zoom
// to the same scale keeps body sizes pixel-equivalent across the migration.
const VIEWPORT_VERTICAL_EXTENT = 8 * Math.tan(Math.PI / 12)
const TILE_GAP = 8
const HIT_RADIUS_FACTOR = 1.05
const LABEL_HEIGHT = 16
const LABEL_GAP = 8

type Tile = {
  config: PlanetVisual
  pixelLeft: number
  pixelWidth: number
  pixelHeight: number
  worldX: number
  worldY: number
  worldScale: number
}

type Layout = {
  tiles: Tile[]
  totalWidth: number
  tileHeight: number
  pxPerUnit: number
}

function computeLayout(planets: PlanetVisual[]): Layout {
  const tileHeight = planets.reduce((m, p) => Math.max(m, p.height), 0)
  const pxPerUnit = tileHeight / VIEWPORT_VERTICAL_EXTENT
  let cursorX = 0
  const stage1: { config: PlanetVisual; pixelLeft: number; pixelWidth: number }[] = []
  for (const p of planets) {
    const w = p.width ?? p.height
    stage1.push({ config: p, pixelLeft: cursorX, pixelWidth: w })
    cursorX += w + TILE_GAP
  }
  const totalWidth = cursorX - TILE_GAP
  const canvasCenterX = totalWidth / 2
  const canvasCenterY = tileHeight / 2
  const tiles: Tile[] = stage1.map((s) => {
    const pixelCenterX = s.pixelLeft + s.pixelWidth / 2
    const pixelCenterY = tileHeight - s.config.height / 2
    return {
      config: s.config,
      pixelLeft: s.pixelLeft,
      pixelWidth: s.pixelWidth,
      pixelHeight: s.config.height,
      worldX: (pixelCenterX - canvasCenterX) / pxPerUnit,
      // y is flipped: pixel-y down → world-y up.
      worldY: -(pixelCenterY - canvasCenterY) / pxPerUnit,
      // Tiles smaller than tileHeight scale their cluster down so they render
      // at the right pixel size despite a single shared zoom.
      worldScale: s.config.height / tileHeight,
    }
  })
  return { tiles, totalWidth, tileHeight, pxPerUnit }
}

function TileNode({
  tile,
  engaged,
  morphRef,
  bodyRef,
  ringRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  tile: Tile
  engaged: boolean
  morphRef: MorphRef
  bodyRef: PointsRef
  ringRef: PointsRef
  onPointerOver: () => void
  onPointerOut: () => void
  onClick: () => void
}) {
  useFrame((_, delta) => {
    morphRef.current = THREE.MathUtils.damp(
      morphRef.current,
      engaged ? 1 : 0,
      MORPH_LAMBDA,
      delta,
    )
  })
  return (
    <group position={[tile.worldX, tile.worldY, 0]} scale={tile.worldScale}>
      <PlanetCluster
        config={tile.config}
        morphRef={morphRef}
        bodyRef={bodyRef}
        ringRef={ringRef}
      />
      {/*
        Invisible hit-test sphere. visible+opacity-0 keeps R3F's raycaster
        eligible (visible={false} gets skipped). Slightly larger than the
        body for forgiving hover.
      */}
      <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <sphereGeometry args={[tile.config.bodyScale * HIT_RADIUS_FACTOR, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function PlanetField({
  planets,
  selectedName,
  onSelect,
}: {
  planets: PlanetVisual[]
  selectedName: string | null
  onSelect: (planet: PlanetVisual) => void
}) {
  const layout = useMemo(() => computeLayout(planets), [planets])
  const [hoveredName, setHoveredName] = useState<string | null>(null)

  // Stable per-tile refs — created once per planet list. WindDrift reads
  // matrixWorld through bodyRef/ringRef every frame; TileNode drives morphRef.
  const tileRefs = useMemo(
    () =>
      planets.map(() => ({
        morphRef: { current: 0 } as MorphRef,
        bodyRef: { current: null } as PointsRef,
        ringRef: { current: null } as PointsRef,
      })),
    [planets],
  )

  const windSources: WindSource[] = useMemo(
    () =>
      planets.map((p, i) => ({
        config: p,
        morphRef: tileRefs[i].morphRef,
        bodyRef: tileRefs[i].bodyRef,
        ringRef: tileRefs[i].ringRef,
      })),
    [planets, tileRefs],
  )

  return (
    <div className="overflow-x-auto">
      <div
        className="mx-auto py-12 px-8"
        style={{ width: layout.totalWidth + 64 }}
      >
        <div
          className="relative"
          style={{
            width: layout.totalWidth,
            height: layout.tileHeight,
            cursor: hoveredName ? 'pointer' : 'default',
          }}
        >
          <Canvas
            orthographic
            camera={{
              position: [0, 0, 10],
              zoom: layout.pxPerUnit,
              near: 0.1,
              far: 100,
            }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
          >
            {layout.tiles.map((tile, i) => (
              <TileNode
                key={tile.config.name}
                tile={tile}
                engaged={
                  hoveredName === tile.config.name ||
                  selectedName === tile.config.name
                }
                morphRef={tileRefs[i].morphRef}
                bodyRef={tileRefs[i].bodyRef}
                ringRef={tileRefs[i].ringRef}
                onPointerOver={() => setHoveredName(tile.config.name)}
                onPointerOut={() =>
                  setHoveredName((prev) =>
                    prev === tile.config.name ? null : prev,
                  )
                }
                onClick={() => onSelect(tile.config)}
              />
            ))}
            {WIND_ENABLED && <WindDrift sources={windSources} />}
          </Canvas>
        </div>
        <div
          className="relative"
          style={{
            width: layout.totalWidth,
            height: LABEL_HEIGHT,
            marginTop: LABEL_GAP,
          }}
        >
          {layout.tiles.map((tile) => (
            <div
              key={tile.config.name}
              className={`absolute text-[10px] uppercase tracking-widest transition-colors ${
                selectedName === tile.config.name
                  ? 'text-celestial-300'
                  : 'text-earth-500'
              }`}
              style={{
                left: tile.pixelLeft,
                width: tile.pixelWidth,
                textAlign: 'center',
              }}
            >
              {tile.config.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
