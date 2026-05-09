// Body-layer particle field: drift inside the silhouette mask with
// wall-slide collision. Direct port of sand-headline's BodyField, scaled
// down to the 48px-class silhouettes that InfoTile uses (smaller min/max,
// higher density-per-pixel for visual thickness at small size).
//
// Particle positions live in canvas-local pixel coords so paint is a
// direct buffer write. Collision converts back to mask-local on the fly
// using (originX, originY).

import type { GlyphSample } from './glyphSampler'

const BODY = {
  // At density 1.0 every opaque source pixel gets one particle; values
  // > 1.0 add random extras for grainier thickness at small icon sizes.
  density: 1.5,
  min: 200,
  max: 1500,
  // Per-particle drift speed in CSS px/sec, multiplied by DPR at runtime
  // so visual speed stays consistent across DPRs.
  flowSpeed: { min: 0.5, max: 3.0 },
  // Seconds between random velocity re-rolls. Smaller → twitchier paths.
  reroll: { min: 0.8, max: 2.5 },
  alpha: 230,
}

export type BodyFrameCtx = {
  buf: Uint8ClampedArray
  canvasW: number
  canvasH: number
  originX: number
  originY: number
  color: [number, number, number]
}

type Kernel = { x: number; y: number; vx: number; vy: number; t: number; moved: boolean }
type StepKernel = Omit<Kernel, 't'>

export class BodyField {
  readonly n: number
  private readonly dpr: number
  private readonly rng: () => number
  private readonly sample: GlyphSample
  private readonly posX: Float32Array
  private readonly posY: Float32Array
  private readonly velX: Float32Array
  private readonly velY: Float32Array
  private readonly velTimer: Float32Array
  // Reused across the inner loop so the kernel allocates nothing per frame.
  private readonly _kernelOut: Kernel = { x: 0, y: 0, vx: 0, vy: 0, t: 0, moved: false }

  constructor(
    sample: GlyphSample,
    originX: number,
    originY: number,
    rng: () => number = Math.random,
  ) {
    const n = clamp(Math.round(sample.sourceLen * BODY.density), BODY.min, BODY.max)
    this.n = n
    this.dpr = sample.dpr
    this.rng = rng
    this.sample = sample
    this.posX = new Float32Array(n)
    this.posY = new Float32Array(n)
    this.velX = new Float32Array(n)
    this.velY = new Float32Array(n)
    this.velTimer = new Float32Array(n)

    // Shuffled seed order so the first min(n, sourceLen) particles land at
    // distinct, evenly-distributed source pixels — without it, scan-order
    // pushes seeds top-to-bottom and small detached glyph regions stay
    // sparse for the life of the page.
    const order = shuffledRange(sample.sourceLen, rng)
    for (let i = 0; i < n; i++) {
      const idx = i < sample.sourceLen ? order[i] : (rng() * sample.sourceLen) | 0
      this.posX[i] = sample.sourceX[idx] + 0.5 + originX
      this.posY[i] = sample.sourceY[idx] + 0.5 + originY
      const v = rerollBodyVelocity(sample.dpr, rng)
      this.velX[i] = v.vx
      this.velY[i] = v.vy
      this.velTimer[i] = v.timer
    }
  }

  update(delta: number, ctx: BodyFrameCtx): void {
    const { mask, maskW, maskH } = this.sample
    const out = this._kernelOut
    const rng = this.rng
    const dpr = this.dpr
    const r = ctx.color[0]
    const g = ctx.color[1]
    const b = ctx.color[2]
    const buf = ctx.buf
    const cw = ctx.canvasW
    const ch = ctx.canvasH
    const ox = ctx.originX
    const oy = ctx.originY
    for (let i = 0; i < this.n; i++) {
      stepBodyParticle(
        this.posX[i], this.posY[i],
        this.velX[i], this.velY[i],
        this.velTimer[i],
        delta, mask, maskW, maskH, ox, oy, dpr, rng, out,
      )
      this.posX[i] = out.x
      this.posY[i] = out.y
      this.velX[i] = out.vx
      this.velY[i] = out.vy
      this.velTimer[i] = out.t

      const px = out.x | 0
      const py = out.y | 0
      if (px < 0 || px >= cw || py < 0 || py >= ch) continue
      const off = (py * cw + px) * 4
      buf[off] = r
      buf[off + 1] = g
      buf[off + 2] = b
      buf[off + 3] = BODY.alpha
    }
  }
}

function stepBodyParticle(
  x: number, y: number, vx: number, vy: number, t: number,
  delta: number,
  mask: Uint8Array, maskW: number, maskH: number,
  ox: number, oy: number, dpr: number,
  rng: () => number,
  out: Kernel,
): void {
  let bvx = vx
  let bvy = vy
  let bt = t - delta

  // Periodic re-roll keeps motion meandering rather than locked to a single
  // direction for the whole life of the page.
  if (bt <= 0) {
    const v = rerollBodyVelocity(dpr, rng)
    bvx = v.vx
    bvy = v.vy
    bt = v.timer
  }

  tryStep(x, y, bvx, bvy, delta, mask, maskW, maskH, ox, oy, out)
  if (!out.moved) {
    const v = rerollBodyVelocity(dpr, rng)
    out.vx = v.vx
    out.vy = v.vy
    bt = v.timer
  }
  out.t = bt
}

// Advance one body particle by one timestep with wall-slide collision.
// Tries (in order): full diagonal step, x-only slide (flips vy as a soft
// bounce), y-only slide (flips vx). If all three are blocked, writes the
// original position with moved=false so the caller re-rolls velocity.
function tryStep(
  x: number, y: number, vx: number, vy: number, delta: number,
  mask: Uint8Array, maskW: number, maskH: number,
  ox: number, oy: number,
  out: StepKernel,
): void {
  const nx = x + vx * delta
  const ny = y + vy * delta
  // Convert to mask-local for collision lookup.
  const ix = (nx - ox) | 0
  const iy = (ny - oy) | 0
  const ixKeep = (x - ox) | 0
  const iyKeep = (y - oy) | 0

  if (ix >= 0 && ix < maskW && iy >= 0 && iy < maskH && mask[iy * maskW + ix]) {
    out.x = nx; out.y = ny; out.vx = vx; out.vy = vy; out.moved = true
    return
  }
  if (ix >= 0 && ix < maskW && iyKeep >= 0 && iyKeep < maskH && mask[iyKeep * maskW + ix]) {
    out.x = nx; out.y = y; out.vx = vx; out.vy = -vy; out.moved = true
    return
  }
  if (ixKeep >= 0 && ixKeep < maskW && iy >= 0 && iy < maskH && mask[iy * maskW + ixKeep]) {
    out.x = x; out.y = ny; out.vx = -vx; out.vy = vy; out.moved = true
    return
  }
  out.x = x; out.y = y; out.vx = vx; out.vy = vy; out.moved = false
}

function rerollBodyVelocity(speedScale: number, rng: () => number) {
  const angle = rng() * Math.PI * 2
  const speedRange = BODY.flowSpeed.max - BODY.flowSpeed.min
  const timerRange = BODY.reroll.max - BODY.reroll.min
  const speed = (BODY.flowSpeed.min + rng() * speedRange) * speedScale
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    timer: BODY.reroll.min + rng() * timerRange,
  }
}

function shuffledRange(n: number, rng: () => number): Int32Array {
  const order = new Int32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0
    const tmp = order[i]
    order[i] = order[j]
    order[j] = tmp
  }
  return order
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
