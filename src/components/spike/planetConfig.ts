export type RGB = [number, number, number]

export interface RingConfig {
  inner: number
  outer: number
  particleCount: number
  color: RGB
  thickness?: number
}

export interface PlanetVisual {
  name: string
  height: number
  width?: number
  bodyScale: number
  particleCount: number
  pointSize: number
  axisTilt: number
  rotationSpeed: number
  ringRotationSpeed?: number
  /** Per-particle color: returns RGB in 0..1. Inputs in unit-sphere local space. */
  colorAt: (x: number, y: number, z: number) => RGB
  ring?: RingConfig
}

const jitter = (c: RGB, amount: number): RGB => {
  const j = (Math.random() - 0.5) * amount
  return [c[0] + j, c[1] + j, c[2] + j]
}

export const earth: PlanetVisual = {
  name: 'Earth',
  height: 40,
  bodyScale: 1.0,
  particleCount: 1200,
  pointSize: 1.2,
  axisTilt: 0.41,
  rotationSpeed: 0.18,
  colorAt: (x, y, z) => {
    if (Math.abs(y) > 0.86) return jitter([0.88, 0.92, 0.96], 0.05)
    const n =
      Math.sin(x * 5.2 + y * 6.7 + 1.3) *
        Math.cos(y * 4.1 - z * 5.4 + 0.7) +
      Math.sin(x * 3.1 - z * 4.3 + 2.1)
    if (n > 0.55) return jitter([0.32, 0.55, 0.30], 0.08)
    if (n > 0.05) return jitter([0.55, 0.50, 0.32], 0.08)
    return jitter([0.18, 0.36, 0.62], 0.06)
  },
}

const jupiterBands: RGB[] = [
  [0.94, 0.86, 0.68],
  [0.74, 0.54, 0.38],
  [0.88, 0.78, 0.58],
  [0.68, 0.46, 0.30],
  [0.95, 0.88, 0.70],
  [0.76, 0.58, 0.42],
  [0.85, 0.74, 0.54],
  [0.66, 0.42, 0.32],
  [0.86, 0.76, 0.56],
  [0.78, 0.60, 0.44],
  [0.92, 0.84, 0.66],
  [0.72, 0.52, 0.38],
  [0.90, 0.80, 0.62],
  [0.96, 0.88, 0.72],
]

export const jupiter: PlanetVisual = {
  name: 'Jupiter',
  height: 150,
  bodyScale: 1.0,
  particleCount: 6000,
  pointSize: 1.4,
  axisTilt: 0.05,
  rotationSpeed: 0.12,
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * (jupiterBands.length / 2)
    const band = Math.min(jupiterBands.length - 1, Math.floor(bandPos))
    return jitter(jupiterBands[band], 0.07)
  },
}

const saturnBands: RGB[] = [
  [0.92, 0.84, 0.62],
  [0.85, 0.75, 0.55],
  [0.95, 0.88, 0.70],
  [0.88, 0.78, 0.58],
  [0.92, 0.82, 0.62],
  [0.86, 0.76, 0.56],
  [0.94, 0.86, 0.66],
  [0.90, 0.80, 0.60],
]

export const saturn: PlanetVisual = {
  name: 'Saturn',
  height: 150,
  width: 220,
  bodyScale: 0.62,
  particleCount: 4000,
  pointSize: 1.3,
  axisTilt: 0.47,
  rotationSpeed: 0.09,
  ringRotationSpeed: 0.04,
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * (saturnBands.length / 2)
    const band = Math.min(saturnBands.length - 1, Math.floor(bandPos))
    return jitter(saturnBands[band], 0.05)
  },
  ring: {
    inner: 0.85,
    outer: 1.32,
    particleCount: 2400,
    color: [0.86, 0.78, 0.62],
    thickness: 0.015,
  },
}

export const uranus: PlanetVisual = {
  name: 'Uranus',
  height: 90,
  bodyScale: 1.0,
  particleCount: 2400,
  pointSize: 1.3,
  axisTilt: 1.71,
  rotationSpeed: 0.14,
  colorAt: (_x, y, _z) => {
    const base: RGB = [0.62, 0.86, 0.92]
    const bandPos = (y + 1) * 4
    const band = Math.floor(bandPos)
    const shift = band % 2 === 0 ? 0 : -0.05
    return jitter([base[0] + shift, base[1] + shift, base[2] + shift], 0.04)
  },
}
