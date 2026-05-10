const GLYPH_CANVAS_SIZE = 256
const GLYPH_FONT_RATIO = 0.78
const ALPHA_THRESHOLD = 80

export type GlyphProfile = {
  opaqueX: Int16Array
  opaqueY: Int16Array
  cx: number
  cy: number
  norm: number
  scale: number
}

export function prepareGlyphProfile(glyph: string, scale: number): GlyphProfile | null {
  const size = GLYPH_CANVAS_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${size * GLYPH_FONT_RATIO}px "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", serif`
  ctx.fillText(glyph, size / 2, size / 2)

  const data = ctx.getImageData(0, 0, size, size).data
  const xs: number[] = []
  const ys: number[] = []
  let minX = size
  let maxX = 0
  let minY = size
  let maxY = 0
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      if (data[(py * size + px) * 4 + 3] > ALPHA_THRESHOLD) {
        xs.push(px)
        ys.push(py)
        if (px < minX) minX = px
        if (px > maxX) maxX = px
        if (py < minY) minY = py
        if (py > maxY) maxY = py
      }
    }
  }

  if (xs.length === 0) return null

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const halfExtent = Math.max(maxX - minX, maxY - minY) / 2
  const norm = halfExtent > 0 ? scale / halfExtent : scale

  return {
    opaqueX: Int16Array.from(xs),
    opaqueY: Int16Array.from(ys),
    cx,
    cy,
    norm,
    scale,
  }
}

export function sampleFromProfile(
  profile: GlyphProfile | null,
  count: number,
  out: Float32Array = new Float32Array(count * 3),
): Float32Array {
  if (!profile) return fillCircle(out, count, 1)
  const { opaqueX, opaqueY, cx, cy, norm } = profile
  const len = opaqueX.length
  for (let i = 0; i < count; i++) {
    const idx = (Math.random() * len) | 0
    out[i * 3 + 0] = (opaqueX[idx] - cx) * norm
    out[i * 3 + 1] = -(opaqueY[idx] - cy) * norm
    out[i * 3 + 2] = 0
  }
  return out
}

export function sampleGlyph(
  glyph: string,
  count: number,
  scale: number,
): Float32Array {
  const profile = prepareGlyphProfile(glyph, scale)
  const out = new Float32Array(count * 3)
  if (!profile) return fillCircle(out, count, scale)
  return sampleFromProfile(profile, count, out)
}

function fillCircle(out: Float32Array, count: number, scale: number): Float32Array {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * scale
    out[i * 3 + 0] = Math.cos(angle) * r
    out[i * 3 + 1] = Math.sin(angle) * r
    out[i * 3 + 2] = 0
  }
  return out
}
