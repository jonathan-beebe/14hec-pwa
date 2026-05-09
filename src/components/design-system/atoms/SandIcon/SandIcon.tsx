import { useEffect, useRef } from 'react'
import type { IconSource } from '../Icon'
import { SandController } from './sandController'

/**
 * Animated sand-particle rendering of an icon. Two layers paint into a
 * single canvas:
 *   body — particles drift inside the icon silhouette with wall-slide
 *     collision; reads as a "glyph made of sand."
 *   wind — particles lift from upwind edges of the silhouette and blow
 *     to the right, fading. Reads as wind-blown sand trailing the icon.
 *
 * Color tracks the canvas's inherited CSS `color` property by default —
 * set the parent's text color (or a CSS variable) to retint. Pass
 * `colorOverride` when the consumer needs a fixed RGB independent of
 * theme.
 *
 * The canvas is `aria-hidden`. Callers are responsible for putting
 * SandIcon inside a positioned wrapper (or sized parent) so the canvas
 * has dimensions to fill — the controller reads the canvas's
 * `getBoundingClientRect` and rasterizes at full DPR.
 *
 * Reduced motion: this component does NOT check `prefers-reduced-motion`.
 * The decision lives at the call site (use `useReducedMotion()` and
 * render a static fallback instead) so that the fallback can be whatever
 * the consumer prefers — typically the same Icon rendered as DOM.
 */
export interface SandIconProps {
  source: IconSource
  /** Body silhouette diameter in CSS px. Default 48. */
  bodySize?: number
  /**
   * Center x of the body silhouette in CSS px from the canvas's left
   * edge. Default = bodySize / 2 (silhouette flush against left).
   */
  bodyOffsetX?: number
  /** Optional [r,g,b] (0–255). When omitted, color tracks parent CSS. */
  colorOverride?: [number, number, number]
  className?: string
}

export default function SandIcon({
  source,
  bodySize = 48,
  bodyOffsetX,
  colorOverride,
  className,
}: SandIconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new SandController(canvas, {
      source,
      bodySize,
      bodyOffsetX,
      colorOverride,
    })
    void controller.start()
    return () => controller.destroy()
  }, [source, bodySize, bodyOffsetX, colorOverride])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full h-full${className ? ` ${className}` : ''}`}
    />
  )
}
