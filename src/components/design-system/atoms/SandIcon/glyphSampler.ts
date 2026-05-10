// Rasterize an IconSource (glyph or SVG) into an offscreen canvas, then
// extract a 1-byte-per-pixel silhouette mask plus parallel arrays of the
// (x, y) coords of every opaque pixel ("source pixels"). The body layer
// flows within `mask`; the wind layer respawns from the source list.
//
// Glyph path is sync (fillText). SVG path is async — react-dom/server is
// lazy-loaded the first time an SVG icon is sampled, so glyph-only callers
// don't pay its bundle cost. Both paths return a single Promise type so
// callers don't branch on source.kind.

import type { ReactNode } from 'react'
import type { IconSource } from '../Icon'

const ALPHA_THRESHOLD = 80
// Symbol-rich families appended to the caller's font chain (or used
// standalone when the caller passes no font). Many of our glyphs —
// zodiac signs (♈–♓), the Aesculapius staff (⚕), planet symbols —
// aren't present in Inter or in what generic `sans-serif` resolves to,
// so without this fallback the canvas would rasterize a tofu square.
// Ordered by platform: Apple Symbols (macOS) → Segoe UI Symbol
// (Windows) → Noto Sans Symbols (Linux/PWA), with `serif` terminating
// the chain so something always renders.
const DEFAULT_GLYPH_FONT_RATIO = 0.78
const SYMBOL_FALLBACK_FAMILIES =
  '"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "Noto Sans Symbols", serif'

export type GlyphSample = {
  /** 1-byte-per-pixel silhouette, indexed [y * maskW + x]. */
  mask: Uint8Array
  /** Mask-local coords of every opaque pixel. */
  sourceX: Int16Array
  sourceY: Int16Array
  sourceLen: number
  /** Mask dimensions in canvas pixels (= bodySizeCss * dpr). */
  maskW: number
  maskH: number
  dpr: number
}

export type SampleOptions = {
  /**
   * CSS font shorthand applied to the canvas before fillText. Use the
   * caller's *resolved* font (typically read from
   * `getComputedStyle(targetEl).font` or constructed from
   * fontStyle/Weight/Size/Family) so canvas falls through the same
   * character-resolution chain as CSS — matching what the static DOM
   * glyph would render. Only used by the glyph path. Sized in canvas
   * pixels (multiply CSS px by DPR).
   */
  font?: string
}

export async function sampleSource(
  source: IconSource,
  bodySizeCss: number,
  dpr: number,
  options: SampleOptions = {},
): Promise<GlyphSample | null> {
  const w = Math.max(1, Math.round(bodySizeCss * dpr))
  const h = w
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.clearRect(0, 0, w, h)

  if (source.kind === 'glyph') {
    paintGlyph(ctx, source.glyph, w, h, options.font)
  } else {
    const ok = await paintSvg(ctx, source.viewBox, source.children, w, h)
    if (!ok) return null
  }

  const rgba = ctx.getImageData(0, 0, w, h).data
  return extractMaskAndSources(rgba, w, h, dpr, ALPHA_THRESHOLD)
}

function paintGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: string,
  w: number,
  h: number,
  font: string | undefined,
): void {
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = font
    ? appendSymbolFallback(font)
    : `${Math.round(w * DEFAULT_GLYPH_FONT_RATIO)}px ${SYMBOL_FALLBACK_FAMILIES}`
  // Match the static DOM glyph's vertical position. The static icon slot
  // is `text-8xl` (line-height: 1) flex-centered in the card, so the
  // alphabetic baseline sits at `ascent + (lineHeight - ascent - descent) / 2`
  // — half-leading distributed evenly above and below the font box.
  // Canvas's textBaseline='middle' uses the em-square center as the
  // reference instead, painting ~5–10px higher for symbol fonts where
  // ascent + descent ≠ em-size; that is what produced the visible
  // misalignment between the sand and static glyphs.
  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(glyph)
  const ascent = m.fontBoundingBoxAscent
  const descent = m.fontBoundingBoxDescent
  const baselineY =
    Number.isFinite(ascent) && Number.isFinite(descent)
      ? ascent + (h - ascent - descent) / 2
      : h * 0.82
  ctx.fillText(glyph, w / 2, baselineY)
}

// Append the symbol-rich fallback families to the caller's font
// shorthand. CSS font-family chains continue past generic terminators
// like `sans-serif` for codepoints the resolved font lacks, so adding
// the symbol families after the caller's chain reliably catches glyphs
// (zodiac, alchemical symbols, etc.) without disturbing per-codepoint
// resolution for anything Inter or system-ui already covers.
// Idempotent: if the caller's chain already names Apple Symbols, leave
// it alone.
function appendSymbolFallback(font: string): string {
  if (font.includes('Apple Symbols')) return font
  return `${font}, ${SYMBOL_FALLBACK_FAMILIES}`
}

async function paintSvg(
  ctx: CanvasRenderingContext2D,
  viewBox: string,
  children: ReactNode,
  w: number,
  h: number,
): Promise<boolean> {
  // Lazy-load: react-dom/server only enters the bundle when an SVG icon is
  // actually rasterized. Glyph-only callers stay light.
  const { renderToStaticMarkup } = await import('react-dom/server')
  // Replace currentColor: rasterized images have no inherited styles, so
  // any unresolved color renders black and falls below the alpha threshold.
  const inner = renderToStaticMarkup(children).replace(/currentColor/g, '#fff')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">` +
    `<g fill="none" stroke="#fff" stroke-width="1.5" ` +
    `stroke-linecap="round" stroke-linejoin="round">${inner}</g>` +
    `</svg>`
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  const img = new Image()
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG sample load failed'))
      img.src = dataUrl
    })
  } catch {
    return false
  }
  ctx.drawImage(img, 0, 0, w, h)
  return true
}

function extractMaskAndSources(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  dpr: number,
  threshold: number,
): GlyphSample | null {
  const mask = new Uint8Array(w * h)
  const xs: number[] = []
  const ys: number[] = []
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const idx = py * w + px
      if (rgba[idx * 4 + 3] > threshold) {
        mask[idx] = 1
        xs.push(px)
        ys.push(py)
      }
    }
  }
  if (xs.length === 0) return null
  return {
    mask,
    sourceX: Int16Array.from(xs),
    sourceY: Int16Array.from(ys),
    sourceLen: xs.length,
    maskW: w,
    maskH: h,
    dpr,
  }
}
