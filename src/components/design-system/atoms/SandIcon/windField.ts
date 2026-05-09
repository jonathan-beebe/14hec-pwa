// Wind-layer particle field: grains lift from upwind edges of the body
// silhouette and drift along a global wind vector, fading with age. Direct
// port of sand-headline's WindField, scaled down for InfoTile (smaller
// pool, lighter jitter, capped per-pixel alpha so wind never overwrites
// body pixels).
//
// Particle positions are canvas-local; respawn picks a mask-local source
// pixel and converts via (originX, originY).

import type { GlyphSample } from './glyphSampler'

const WIND = {
  // Pool size = body count * fraction, clamped.
  fraction: 0.8,
  min: 100,
  max: 2400,
  baseSpeedPx: 15,
  gust: {
    freq: 0.7,
    amp: 0.4,
    freq2: 1.31,
    amp2: 0.18,
    // Phase offset so the second oscillator doesn't align with the first.
    phase2: 1.7,
    // Floor on gust multiplier prevents a deep trough from reversing wind.
    floor: 0.2,
  },
  dir: { freq: 0.13, amp: 0.20 },
  // Phase offset decorrelates vertical drift from horizontal gusts.
  vertical: { freq: 0.09, amp: 0.07, phase: 1.3 },
  lifespan: { min: 1.5, max: 25.0 },
  // Per-particle velocity jitter in CSS px/sec, scaled by DPR at runtime.
  // Lighter than sand-headline's headline since the source silhouette is
  // ~10x smaller.
  jitter: { xPx: 14, yPx: 8 },
  // p ∈ [0, 1] is fraction of life elapsed. Fade in linearly until `in`,
  // then fade out as 1 − u^tailExp where u is the post-`in` progress.
  fade: { in: 0.10, tailExp: 0.55 },
  upwindBias: 0.7,
  // Wind blows in +x; mask split at this fraction is the upwind/downwind
  // boundary used to bias respawn picks toward the windward edge.
  upwindHalf: 0.5,
  maxRespawnAttempts: 4,
  // Cap on wind grain alpha (out of 255). Keeps body pixels dominant when
  // the two layers overlap.
  alphaScale: 200,
}

export type WindFrameCtx = {
  buf: Uint8ClampedArray
  canvasW: number
  canvasH: number
  originX: number
  originY: number
  color: [number, number, number]
}

type Kernel = {
  x: number
  y: number
  life: number
  lifespan: number
  jitterX: number
  jitterY: number
  alpha: number
}

export class WindField {
  readonly n: number
  private readonly dpr: number
  private readonly rng: () => number
  private readonly sample: GlyphSample
  private readonly posX: Float32Array
  private readonly posY: Float32Array
  private readonly life: Float32Array
  private readonly lifespan: Float32Array
  private readonly jitterX: Float32Array
  private readonly jitterY: Float32Array
  private readonly _kernelOut: Kernel = {
    x: 0, y: 0, life: 0, lifespan: 0, jitterX: 0, jitterY: 0, alpha: 0,
  }

  constructor(sample: GlyphSample, bodyN: number, rng: () => number = Math.random) {
    const n = clamp(Math.round(bodyN * WIND.fraction), WIND.min, WIND.max)
    this.n = n
    this.dpr = sample.dpr
    this.rng = rng
    this.sample = sample
    this.posX = new Float32Array(n)
    this.posY = new Float32Array(n)
    this.life = new Float32Array(n)
    this.lifespan = new Float32Array(n)
    this.jitterX = new Float32Array(n)
    this.jitterY = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      this.lifespan[i] = randLifespan(rng)
      // Negative life = startup delay, uniformly spread across lifespan.max.
      // Without it, every slot is "expired" on frame 1 and they all
      // respawn simultaneously — visible burst as the pool comes online.
      this.life[i] = -rng() * WIND.lifespan.max
      this.jitterX[i] = randJitter(WIND.jitter.xPx, sample.dpr, rng)
      this.jitterY[i] = randJitter(WIND.jitter.yPx, sample.dpr, rng)
    }
  }

  update(delta: number, t: number, ctx: WindFrameCtx): void {
    const buf = ctx.buf
    const cw = ctx.canvasW
    const ch = ctx.canvasH
    const ox = ctx.originX
    const oy = ctx.originY
    const r = ctx.color[0]
    const g = ctx.color[1]
    const b = ctx.color[2]

    const wind = computeWindVector(t, this.dpr)
    const wx = wind.wx
    const wy = wind.wy
    const out = this._kernelOut
    const rng = this.rng
    const sample = this.sample
    const dpr = this.dpr

    for (let i = 0; i < this.n; i++) {
      stepWindParticle(
        this.posX[i], this.posY[i],
        this.life[i], this.lifespan[i],
        this.jitterX[i], this.jitterY[i],
        delta, wx, wy, sample, ox, oy, dpr, rng, out,
      )
      this.posX[i] = out.x
      this.posY[i] = out.y
      this.life[i] = out.life
      this.lifespan[i] = out.lifespan
      this.jitterX[i] = out.jitterX
      this.jitterY[i] = out.jitterY

      if (out.alpha <= 0) continue
      const px = out.x | 0
      const py = out.y | 0
      if (px < 0 || px >= cw || py < 0 || py >= ch) continue
      const off = (py * cw + px) * 4
      const aa = (out.alpha * WIND.alphaScale) | 0
      // Max-blend: a faint wind grain never overwrites a stronger body pixel.
      if (buf[off + 3] < aa) {
        buf[off] = r
        buf[off + 1] = g
        buf[off + 2] = b
        buf[off + 3] = aa
      }
    }
  }
}

// Pure single-particle kernel. Three life phases collapse here:
//   - dead (li >= lifespan)               → respawn at an upwind source
//   - delayed (li < 0)                    → still hidden; tick life only
//   - just emerged (life < 0 ≤ li)        → respawn (treat as fresh birth)
//   - alive (0 ≤ li < lifespan)           → drift, fade, paint
function stepWindParticle(
  x: number, y: number, life: number, lifespan: number,
  jx: number, jy: number,
  delta: number, wx: number, wy: number,
  sample: GlyphSample, ox: number, oy: number, dpr: number,
  rng: () => number,
  out: Kernel,
): void {
  const li = life + delta
  if (li >= lifespan) {
    respawnWindParticle(sample, ox, oy, dpr, rng, out)
    return
  }
  if (li < 0) {
    out.x = x; out.y = y; out.life = li; out.lifespan = lifespan
    out.jitterX = jx; out.jitterY = jy; out.alpha = 0
    return
  }
  if (life < 0) {
    respawnWindParticle(sample, ox, oy, dpr, rng, out)
    return
  }
  out.x = x + (wx + jx) * delta
  out.y = y + (wy + jy) * delta
  out.life = li
  out.lifespan = lifespan
  out.jitterX = jx
  out.jitterY = jy
  out.alpha = fade(li / lifespan)
}

// Pick a respawn position biased toward the upwind half of the silhouette
// and write a fresh-life slot to `out`. Rejection-samples up to
// maxRespawnAttempts: a downwind pick is rejected with probability
// upwindBias so most respawns land on the windward edge.
function respawnWindParticle(
  sample: GlyphSample, ox: number, oy: number, dpr: number,
  rng: () => number,
  out: Kernel,
): void {
  const { sourceX, sourceY, sourceLen, maskW } = sample
  let mx = 0
  let my = 0
  for (let attempt = 0; attempt < WIND.maxRespawnAttempts; attempt++) {
    const idx = (rng() * sourceLen) | 0
    mx = sourceX[idx]
    my = sourceY[idx]
    if (mx > maskW * WIND.upwindHalf && rng() < WIND.upwindBias) continue
    break
  }
  out.x = mx + ox
  out.y = my + oy
  out.life = 0
  out.lifespan = randLifespan(rng)
  out.jitterX = randJitter(WIND.jitter.xPx, dpr, rng)
  out.jitterY = randJitter(WIND.jitter.yPx, dpr, rng)
  out.alpha = 0
}

const _windVectorOut = { wx: 0, wy: 0 }
// Pure: global wind velocity at time t (in seconds). Two summed sine
// oscillators give the gust magnitude; a slower sine of `t` rotates the
// direction; an independent sine drives vertical drift. Returned in
// canvas px/sec (already DPR-scaled).
function computeWindVector(t: number, dpr: number) {
  const dirAngle = Math.sin(t * WIND.dir.freq) * WIND.dir.amp
  const gust =
    1 +
    WIND.gust.amp * Math.sin(t * WIND.gust.freq) +
    WIND.gust.amp2 * Math.sin(t * WIND.gust.freq2 + WIND.gust.phase2)
  const vertical = Math.sin(t * WIND.vertical.freq + WIND.vertical.phase) * WIND.vertical.amp
  const speed = WIND.baseSpeedPx * dpr * Math.max(WIND.gust.floor, gust)
  _windVectorOut.wx = Math.cos(dirAngle) * speed
  _windVectorOut.wy = vertical * speed
  return _windVectorOut
}

function fade(p: number): number {
  if (p < WIND.fade.in) return p / WIND.fade.in
  const u = (p - WIND.fade.in) / (1 - WIND.fade.in)
  return Math.max(0, 1 - Math.pow(u, WIND.fade.tailExp))
}

function randLifespan(rng: () => number): number {
  return WIND.lifespan.min + rng() * (WIND.lifespan.max - WIND.lifespan.min)
}

function randJitter(amplitudePx: number, dpr: number, rng: () => number): number {
  return (rng() - 0.5) * amplitudePx * dpr
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
