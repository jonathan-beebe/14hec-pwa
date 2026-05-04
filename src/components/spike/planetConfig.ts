export type RGB = [number, number, number]

export interface RingConfig {
  inner: number
  outer: number
  particleCount: number
  color: RGB
  thickness?: number
}

export interface SatelliteConfig {
  body: PlanetVisual
  orbitRadius: number
  orbitSpeed: number
  /** Tilt of the orbit plane (radians); positive tips the near side downward. */
  inclination?: number
  phase?: number
}

export interface PlanetVisual {
  name: string
  height: number
  width?: number
  bodyScale: number
  particleCount: number
  pointSize: number
  axisTilt: number
  /** Additional Z-axis roll in radians (positive raises the right side). */
  axisRoll?: number
  rotationSpeed: number
  ringRotationSpeed?: number
  /** Per-particle color: returns RGB in 0..1. Inputs in unit-sphere local space. */
  colorAt: (x: number, y: number, z: number) => RGB
  /** Astrological glyph the particles morph into on hover/tap. */
  glyph: string
  ring?: RingConfig
  satellites?: SatelliteConfig[]
}

const jitter = (c: RGB, amount: number): RGB => {
  const j = (Math.random() - 0.5) * amount
  return [c[0] + j, c[1] + j, c[2] + j]
}

const noise3 = (x: number, y: number, z: number, freq = 5) =>
  Math.sin(x * freq + y * (freq + 1.5) + 1.3) *
    Math.cos(y * (freq - 0.9) - z * (freq + 0.4) + 0.7) +
  Math.sin(x * (freq - 2) - z * (freq + 1.3) + 2.1)

export const mercury: PlanetVisual = {
  name: 'Mercury',
  height: 50,
  bodyScale: 1.0,
  particleCount: 1450,
  pointSize: 1.2,
  axisTilt: 0.04,
  rotationSpeed: 0.10,
  glyph: '☿',
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 6)
    if (n > 0.5) return jitter([0.62, 0.55, 0.46], 0.06)
    if (n > -0.2) return jitter([0.52, 0.47, 0.40], 0.06)
    return jitter([0.40, 0.36, 0.32], 0.05)
  },
}

export const venus: PlanetVisual = {
  name: 'Venus',
  height: 68,
  bodyScale: 1.0,
  particleCount: 2150,
  pointSize: 1.2,
  axisTilt: 3.10, // ~177° — Venus rotates retrograde
  rotationSpeed: 0.05,
  glyph: '♀',
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * 5
    const band = Math.floor(bandPos)
    const palette: RGB[] = [
      [0.95, 0.84, 0.55],
      [0.90, 0.78, 0.50],
      [0.94, 0.82, 0.54],
      [0.88, 0.74, 0.46],
      [0.96, 0.86, 0.58],
      [0.92, 0.80, 0.52],
      [0.95, 0.84, 0.55],
      [0.90, 0.78, 0.50],
      [0.94, 0.82, 0.54],
      [0.88, 0.76, 0.48],
    ]
    return jitter(palette[band % palette.length], 0.05)
  },
}

export const moon: PlanetVisual = {
  name: 'Moon',
  height: 30,
  bodyScale: 0.27,
  particleCount: 450,
  pointSize: 1.0,
  axisTilt: 0.10,
  rotationSpeed: 0.04,
  glyph: '☽',
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 7)
    if (n > 0.4) return jitter([0.50, 0.49, 0.47], 0.05)
    if (n > -0.4) return jitter([0.78, 0.77, 0.74], 0.05)
    return jitter([0.65, 0.64, 0.61], 0.05)
  },
}

export const earth: PlanetVisual = {
  name: 'Earth',
  height: 70,
  width: 200,
  bodyScale: 1.0,
  particleCount: 2900,
  pointSize: 1.2,
  axisTilt: 0.41,
  rotationSpeed: 0.18,
  glyph: '♁',
  colorAt: (x, y, z) => {
    if (Math.abs(y) > 0.86) return jitter([0.88, 0.92, 0.96], 0.05)
    const n = noise3(x, y, z, 5)
    if (n > 0.55) return jitter([0.32, 0.55, 0.30], 0.08)
    if (n > 0.05) return jitter([0.55, 0.50, 0.32], 0.08)
    return jitter([0.18, 0.36, 0.62], 0.06)
  },
  satellites: [
    {
      body: moon,
      orbitRadius: 1.7,
      orbitSpeed: 0.55,
      inclination: 0.18,
    },
  ],
}

export const mars: PlanetVisual = {
  name: 'Mars',
  height: 56,
  bodyScale: 1.0,
  particleCount: 1700,
  pointSize: 1.2,
  axisTilt: 0.44,
  rotationSpeed: 0.16,
  glyph: '♂',
  colorAt: (x, y, z) => {
    if (Math.abs(y) > 0.88) return jitter([0.92, 0.92, 0.94], 0.05)
    const n = noise3(x, y, z, 6)
    if (n > 0.4) return jitter([0.58, 0.30, 0.20], 0.07)
    if (n > -0.3) return jitter([0.78, 0.42, 0.28], 0.06)
    return jitter([0.65, 0.36, 0.24], 0.06)
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
  particleCount: 7200,
  pointSize: 1.4,
  axisTilt: 0.05,
  rotationSpeed: 0.12,
  glyph: '♃',
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
  height: 140,
  width: 220,
  bodyScale: 0.62,
  particleCount: 4800,
  pointSize: 1.3,
  axisTilt: 0.22,
  axisRoll: 0.18,
  rotationSpeed: 0.09,
  ringRotationSpeed: 0.04,
  glyph: '♄',
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * (saturnBands.length / 2)
    const band = Math.min(saturnBands.length - 1, Math.floor(bandPos))
    return jitter(saturnBands[band], 0.05)
  },
  ring: {
    inner: 1.40,
    outer: 2.20,
    particleCount: 2900,
    color: [0.86, 0.78, 0.62],
    thickness: 0.02,
  },
}

export const uranus: PlanetVisual = {
  name: 'Uranus',
  height: 110,
  bodyScale: 1.0,
  particleCount: 3600,
  pointSize: 1.3,
  axisTilt: 1.71,
  rotationSpeed: 0.14,
  glyph: '♅',
  colorAt: (_x, y, _z) => {
    const base: RGB = [0.62, 0.86, 0.92]
    const bandPos = (y + 1) * 4
    const band = Math.floor(bandPos)
    const shift = band % 2 === 0 ? 0 : -0.05
    return jitter([base[0] + shift, base[1] + shift, base[2] + shift], 0.04)
  },
}

const neptuneBands: RGB[] = [
  [0.30, 0.42, 0.78],
  [0.22, 0.34, 0.70],
  [0.36, 0.48, 0.84],
  [0.26, 0.38, 0.74],
  [0.32, 0.44, 0.80],
  [0.24, 0.36, 0.72],
  [0.34, 0.46, 0.82],
  [0.28, 0.40, 0.76],
]

export const neptune: PlanetVisual = {
  name: 'Neptune',
  height: 105,
  bodyScale: 1.0,
  particleCount: 3600,
  pointSize: 1.3,
  axisTilt: 0.49,
  rotationSpeed: 0.13,
  glyph: '♆',
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * (neptuneBands.length / 2)
    const band = Math.min(neptuneBands.length - 1, Math.floor(bandPos))
    return jitter(neptuneBands[band], 0.05)
  },
}

export const pluto: PlanetVisual = {
  name: 'Pluto',
  height: 40,
  bodyScale: 1.0,
  particleCount: 1100,
  pointSize: 1.2,
  axisTilt: 2.10, // ~120° — Pluto's odd tilt
  rotationSpeed: 0.08,
  glyph: '♇',
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 5)
    if (n > 0.4) return jitter([0.78, 0.65, 0.50], 0.06)
    if (n > -0.2) return jitter([0.62, 0.54, 0.44], 0.06)
    return jitter([0.48, 0.42, 0.36], 0.05)
  },
}

export const allPlanets: PlanetVisual[] = [
  mercury,
  venus,
  earth,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto,
]
