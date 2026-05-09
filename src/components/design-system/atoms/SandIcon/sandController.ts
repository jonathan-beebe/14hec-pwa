// Per-instance lifecycle owner for one SandIcon canvas. Ports
// SandController from sand-headline; receives the canvas from React
// rather than creating one against a target element.
//
// Owns: ResizeObserver (debounced resample), IntersectionObserver
// (pause when offscreen), prefers-color-scheme listener (refresh color),
// RAF loop with capped delta. Defers all per-particle math to BodyField
// and WindField; defers rasterization to sampleSource.

import { BodyField } from './bodyField'
import { WindField } from './windField'
import { sampleSource, type GlyphSample } from './glyphSampler'
import type { IconSource } from '../Icon'

const RESIZE_DEBOUNCE_MS = 150
// Cap per-frame delta so a tab-restore or stalled RAF doesn't fast-forward
// every particle by seconds and snap the simulation.
const MAX_FRAME_DELTA = 0.05

export type SandControllerOptions = {
  source: IconSource
  /** Body silhouette diameter in CSS px. */
  bodySize: number
  /**
   * Center x of the body silhouette within the canvas, in CSS px from the
   * canvas's left edge. Defaults to bodySize / 2 (silhouette flush left).
   */
  bodyOffsetX?: number
  /**
   * Optional [r, g, b] override (0–255). When omitted, the controller
   * reads `getComputedStyle(canvas).color` so the canvas tracks whatever
   * color is inherited from the parent (theme tokens, tone classes, etc.).
   */
  colorOverride?: [number, number, number]
}

export class SandController {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private options: SandControllerOptions
  private color: [number, number, number] = [255, 255, 255]
  private sample: GlyphSample | null = null
  private body: BodyField | null = null
  private wind: WindField | null = null
  private imgData: ImageData | null = null
  private buf: Uint8ClampedArray | null = null
  private originX = 0
  private originY = 0
  private canvasW = 0
  private canvasH = 0
  private running = false
  private rafId = 0
  private lastT = 0
  private resizeTimer = 0
  private lastCssW = 0
  private lastCssH = 0
  private destroyed = false
  // Cache key so we only resample when bodySize or DPR actually changed.
  private lastSampleKey = ''
  private resampleSeq = 0

  private readonly resizeObs: ResizeObserver
  private readonly intersectObs: IntersectionObserver
  private readonly mqColor: MediaQueryList
  private readonly onColorChange: () => void

  constructor(canvas: HTMLCanvasElement, options: SandControllerOptions) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('SandController: 2D context unavailable')
    this.ctx = ctx
    this.options = options
    this.frame = this.frame.bind(this)

    this.resizeObs = new ResizeObserver(() => {
      window.clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => {
        if (this.destroyed) return
        void this.resample()
      }, RESIZE_DEBOUNCE_MS)
    })
    this.resizeObs.observe(canvas)

    this.intersectObs = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting)
      if (visible && !this.running) this.startLoop()
      else if (!visible && this.running) this.stopLoop()
    })
    this.intersectObs.observe(canvas)

    this.mqColor = matchMedia('(prefers-color-scheme: dark)')
    this.onColorChange = () => this.refreshColor()
    this.mqColor.addEventListener('change', this.onColorChange)
  }

  async start(): Promise<void> {
    await this.resample()
    if (this.destroyed) return
    if (!this.body) return
    // Paint the silhouette into the canvas before kicking off RAF so the
    // first composited frame already has visible sand — no blank flash.
    this.renderFrame(0, 0)
    this.startLoop()
  }

  destroy(): void {
    this.destroyed = true
    this.stopLoop()
    window.clearTimeout(this.resizeTimer)
    this.resizeObs.disconnect()
    this.intersectObs.disconnect()
    this.mqColor.removeEventListener('change', this.onColorChange)
  }

  private refreshColor(): void {
    if (this.options.colorOverride) {
      this.color = this.options.colorOverride
      return
    }
    const cs = getComputedStyle(this.canvas).color
    this.color = parseColor(cs)
  }

  private async resample(): Promise<void> {
    const rect = this.canvas.getBoundingClientRect()
    const cssW = Math.ceil(rect.width)
    const cssH = Math.ceil(rect.height)
    if (cssW === 0 || cssH === 0) return

    const dpr = window.devicePixelRatio || 1
    const w = Math.ceil(cssW * dpr)
    const h = Math.ceil(cssH * dpr)
    const sampleKey = `${this.options.bodySize}|${dpr}`

    const sizeChanged = cssW !== this.lastCssW || cssH !== this.lastCssH
    const sampleChanged = sampleKey !== this.lastSampleKey

    if (sampleChanged) {
      // Tag this resample so a later one supersedes if both are in flight.
      const seq = ++this.resampleSeq
      const sample = await sampleSource(this.options.source, this.options.bodySize, dpr)
      if (this.destroyed || seq !== this.resampleSeq) return
      this.sample = sample
      this.lastSampleKey = sampleKey
    } else if (!sizeChanged && this.body) {
      return
    }

    if (!this.sample) return

    this.canvas.style.width = cssW + 'px'
    this.canvas.style.height = cssH + 'px'
    this.canvas.width = w
    this.canvas.height = h
    this.canvasW = w
    this.canvasH = h
    this.lastCssW = cssW
    this.lastCssH = cssH

    const bodyOffsetXCss = this.options.bodyOffsetX ?? this.options.bodySize / 2
    this.originX = Math.round(bodyOffsetXCss * dpr - this.sample.maskW / 2)
    this.originY = Math.round((cssH / 2) * dpr - this.sample.maskH / 2)

    this.body = new BodyField(this.sample, this.originX, this.originY)
    this.wind = new WindField(this.sample, this.body.n)

    this.imgData = this.ctx.createImageData(w, h)
    this.buf = this.imgData.data

    this.refreshColor()
  }

  private startLoop(): void {
    if (this.running || this.destroyed) return
    this.running = true
    this.lastT = 0
    this.rafId = requestAnimationFrame(this.frame)
  }

  private stopLoop(): void {
    this.running = false
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  private frame(now: number): void {
    if (!this.running) return
    if (!this.body || !this.wind || !this.buf || !this.sample) {
      this.rafId = requestAnimationFrame(this.frame)
      return
    }
    const t = now / 1000
    let delta = this.lastT === 0 ? 0 : t - this.lastT
    this.lastT = t
    if (delta > MAX_FRAME_DELTA) delta = MAX_FRAME_DELTA
    this.renderFrame(delta, t)
    this.rafId = requestAnimationFrame(this.frame)
  }

  private renderFrame(delta: number, t: number): void {
    if (!this.body || !this.wind || !this.buf || !this.imgData || !this.sample) return
    this.buf.fill(0)
    const baseCtx = {
      buf: this.buf,
      canvasW: this.canvasW,
      canvasH: this.canvasH,
      originX: this.originX,
      originY: this.originY,
      color: this.color,
    }
    this.body.update(delta, baseCtx)
    this.wind.update(delta, t, baseCtx)
    this.ctx.putImageData(this.imgData, 0, 0)
  }
}

function parseColor(s: string): [number, number, number] {
  const m = s.match(/-?\d+(\.\d+)?/g)
  if (!m || m.length < 3) return [255, 255, 255]
  return [(+m[0]) | 0, (+m[1]) | 0, (+m[2]) | 0]
}
