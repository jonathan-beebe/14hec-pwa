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
  /**
   * UI accent color in 8-bit RGB (0..255). Used by surfaces that frame
   * the planet (PlanetTile gradient, border, glow, primary text, static
   * fallback glyph) to give each planet its own visual identity.
   * Roughly the planet's brightest band-color, lifted to a Tailwind-300
   * lightness so it reads as text on dark surfaces.
   */
  tint: [number, number, number]
  /**
   * Optional override for PlanetTile sizing. Absolute scale where 1.0
   * means "the planet (including its ring) exactly fits the tile slot"
   * — values above 1.0 are allowed to bleed past the slot boundary.
   * When omitted, the tile derives a scale from `height` so smaller
   * planets read smaller; set this on planets where the auto-scale
   * undersells them (e.g. Saturn, whose ring shrinks the body).
   */
  tileScale?: number
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

const spot = (
  x: number,
  y: number,
  z: number,
  dir: [number, number, number],
  tightness = 6,
) => {
  const d = x * dir[0] + y * dir[1] + z * dir[2]
  return d > 0 ? Math.pow(d, tightness) : 0
}

const tint = (c: RGB, t: RGB, k: number): RGB => [
  c[0] + t[0] * k,
  c[1] + t[1] * k,
  c[2] + t[2] * k,
]

export const sun: PlanetVisual = {
  name: 'Sun',
  height: 200,
  bodyScale: 1.0,
  particleCount: 9000,
  pointSize: 1.5,
  axisTilt: 0.13,
  rotationSpeed: 0.06,
  glyph: '☉',
  tint: [252, 191, 88],
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 8)
    let base: RGB
    if (n > 0.5) base = [1.00, 0.94, 0.55]
    else if (n > 0.0) base = [1.00, 0.78, 0.28]
    else base = [0.96, 0.55, 0.16]
    const sunspot1 = spot(x, y, z, [0.55, 0.20, 0.75], 14)
    const sunspot2 = spot(x, y, z, [-0.45, 0.10, -0.85], 16)
    base = tint(base, [-0.55, -0.42, -0.20], (sunspot1 + sunspot2) * 0.8)
    return jitter(base, 0.06)
  },
}

export const mercury: PlanetVisual = {
  name: 'Mercury',
  height: 50,
  bodyScale: 1.0,
  particleCount: 1450,
  pointSize: 1.2,
  axisTilt: 0.04,
  rotationSpeed: 0.10,
  glyph: '☿',
  tint: [186, 172, 152],
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 6)
    let base: RGB
    if (n > 0.5) base = [0.62, 0.55, 0.46]
    else if (n > -0.2) base = [0.52, 0.47, 0.40]
    else base = [0.40, 0.36, 0.32]
    const caloris = spot(x, y, z, [0.7, 0.35, 0.6], 6)
    base = tint(base, [0.40, 0.28, 0.18], caloris * 0.7)
    return jitter(base, 0.06)
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
  tint: [245, 222, 165],
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
    const equator = Math.max(0, 1 - Math.abs(y) * 1.4)
    const base = tint(palette[band % palette.length], [0.10, -0.06, -0.18], equator * 0.30)
    return jitter(base, 0.05)
  },
}

export const moon: PlanetVisual = {
  name: 'Moon',
  height: 44,
  bodyScale: 1.0,
  particleCount: 1300,
  pointSize: 1.2,
  axisTilt: 0.10,
  rotationSpeed: 0.04,
  glyph: '☽',
  tint: [222, 220, 213],
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 7)
    if (n > 0.4) return jitter([0.50, 0.49, 0.47], 0.05)
    if (n > -0.4) return jitter([0.78, 0.77, 0.74], 0.05)
    return jitter([0.65, 0.64, 0.61], 0.05)
  },
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
  tint: [232, 134, 92],
  colorAt: (x, y, z) => {
    if (Math.abs(y) > 0.88) return jitter([0.88, 0.94, 1.00], 0.05)
    const n = noise3(x, y, z, 6)
    let base: RGB
    if (n > 0.4) base = [0.58, 0.30, 0.20]
    else if (n > -0.3) base = [0.82, 0.44, 0.26]
    else base = [0.68, 0.36, 0.22]
    const tharsis = spot(x, y, z, [0.6, 0.2, 0.7], 5)
    base = tint(base, [0.30, 0.20, 0.05], tharsis * 0.75)
    const valles = spot(x, y, z, [-0.5, -0.05, 0.85], 14)
    base = tint(base, [-0.22, -0.12, -0.06], valles * 0.7)
    return jitter(base, 0.07)
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
  tint: [240, 215, 170],
  colorAt: (x, y, z) => {
    const bandPos = (y + 1) * (jupiterBands.length / 2)
    const band = Math.min(jupiterBands.length - 1, Math.floor(bandPos))
    let base: RGB = [...jupiterBands[band]] as RGB
    const grs = spot(x, y, z, [0.85, -0.34, 0.40], 14)
    base = tint(base, [0.10, -0.30, -0.40], grs * 0.95)
    return jitter(base, 0.07)
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
  tint: [238, 220, 165],
  // Larger than the height-derived auto-scale, and allowed to bleed past
  // the slot — Saturn's iconic ring earns a star turn in the picker, even
  // if it dusts the leading edge of the text.
  tileScale: 1.4,
  colorAt: (_x, y, _z) => {
    const bandPos = (y + 1) * (saturnBands.length / 2)
    const band = Math.min(saturnBands.length - 1, Math.floor(bandPos))
    let base: RGB = [...saturnBands[band]] as RGB
    if (y > 0.78) {
      base = tint(base, [-0.25, -0.05, 0.25], (y - 0.78) * 4)
    }
    return jitter(base, 0.06)
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
  tint: [150, 226, 240],
  colorAt: (x, y, z) => {
    const base: RGB = [0.55, 0.90, 0.96]
    const bandPos = (y + 1) * 4
    const band = Math.floor(bandPos)
    const shift = band % 2 === 0 ? 0 : -0.06
    let c: RGB = [base[0] + shift, base[1] + shift, base[2] + shift]
    const polar = spot(x, y, z, [0, 1, 0], 4) + spot(x, y, z, [0, -1, 0], 4)
    c = tint(c, [0.22, -0.12, 0.12], polar * 0.6)
    return jitter(c, 0.05)
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
  tint: [126, 162, 235],
  colorAt: (x, y, z) => {
    const bandPos = (y + 1) * (neptuneBands.length / 2)
    const band = Math.min(neptuneBands.length - 1, Math.floor(bandPos))
    let base: RGB = [...neptuneBands[band]] as RGB
    const dark = spot(x, y, z, [-0.5, -0.30, 0.80], 14)
    base = tint(base, [-0.18, -0.22, -0.22], dark * 0.7)
    const aurora = spot(x, y, z, [0, 0.90, 0.30], 5)
    base = tint(base, [-0.06, 0.32, 0.10], aurora * 0.85)
    return jitter(base, 0.06)
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
  tint: [200, 175, 145],
  colorAt: (x, y, z) => {
    const n = noise3(x, y, z, 5)
    let base: RGB
    if (n > 0.4) base = [0.78, 0.65, 0.50]
    else if (n > -0.2) base = [0.62, 0.54, 0.44]
    else base = [0.48, 0.42, 0.36]
    const tombaugh = spot(x, y, z, [0.4, -0.1, 0.9], 4)
    base = tint(base, [0.26, 0.18, 0.18], tombaugh * 0.75)
    const methane = spot(x, y, z, [-0.4, 0.3, -0.85], 8)
    base = tint(base, [-0.10, 0.0, 0.22], methane * 0.5)
    return jitter(base, 0.05)
  },
}

export const allPlanets: PlanetVisual[] = [
  sun,
  moon,
  mercury,
  venus,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto,
]
