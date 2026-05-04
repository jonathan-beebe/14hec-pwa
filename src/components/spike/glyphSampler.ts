const GLYPH_CANVAS_SIZE = 256
const GLYPH_FONT_RATIO = 0.78
const ALPHA_THRESHOLD = 80

export function sampleGlyph(
  glyph: string,
  count: number,
  scale: number,
): Float32Array {
  const out = new Float32Array(count * 3)
  const size = GLYPH_CANVAS_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return fillCircle(out, count, scale)

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${size * GLYPH_FONT_RATIO}px "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", serif`
  ctx.fillText(glyph, size / 2, size / 2)

  const data = ctx.getImageData(0, 0, size, size).data
  const opaqueX: number[] = []
  const opaqueY: number[] = []
  let minX = size
  let maxX = 0
  let minY = size
  let maxY = 0
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      if (data[(py * size + px) * 4 + 3] > ALPHA_THRESHOLD) {
        opaqueX.push(px)
        opaqueY.push(py)
        if (px < minX) minX = px
        if (px > maxX) maxX = px
        if (py < minY) minY = py
        if (py > maxY) maxY = py
      }
    }
  }

  if (opaqueX.length === 0) return fillCircle(out, count, scale)

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const halfExtent = Math.max(maxX - minX, maxY - minY) / 2
  const norm = halfExtent > 0 ? scale / halfExtent : scale

  for (let i = 0; i < count; i++) {
    const idx = (Math.random() * opaqueX.length) | 0
    out[i * 3 + 0] = (opaqueX[idx] - cx) * norm
    out[i * 3 + 1] = -(opaqueY[idx] - cy) * norm
    out[i * 3 + 2] = 0
  }
  return out
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

/**
 * Re-orders glyph points so that paired[i] is the target for sphere particle i.
 * Pairs by polar angle (XY projection) so the morph reads as a swirl into shape
 * rather than chaos. O(n log n) — cheap at the particle counts in use.
 */
export function pairByAngle(
  dirs: Float32Array,
  glyphPoints: Float32Array,
  n: number,
): Float32Array {
  const sphereOrder = new Array<number>(n)
  const glyphOrder = new Array<number>(n)
  const sphereAngle = new Float32Array(n)
  const glyphAngle = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    sphereOrder[i] = i
    glyphOrder[i] = i
    sphereAngle[i] = Math.atan2(dirs[i * 3 + 1], dirs[i * 3 + 0])
    glyphAngle[i] = Math.atan2(glyphPoints[i * 3 + 1], glyphPoints[i * 3 + 0])
  }
  sphereOrder.sort((a, b) => sphereAngle[a] - sphereAngle[b])
  glyphOrder.sort((a, b) => glyphAngle[a] - glyphAngle[b])

  const paired = new Float32Array(n * 3)
  for (let k = 0; k < n; k++) {
    const sIdx = sphereOrder[k]
    const gIdx = glyphOrder[k]
    paired[sIdx * 3 + 0] = glyphPoints[gIdx * 3 + 0]
    paired[sIdx * 3 + 1] = glyphPoints[gIdx * 3 + 1]
    paired[sIdx * 3 + 2] = glyphPoints[gIdx * 3 + 2]
  }
  return paired
}
