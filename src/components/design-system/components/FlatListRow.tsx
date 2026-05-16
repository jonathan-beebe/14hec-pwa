import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Type from '../atoms/Type'
import type { IconSource } from '../atoms/Icon'
import SandIcon from '../atoms/SandIcon'
import { useReducedMotion } from '../atoms/useReducedMotion'

export interface FlatListRowProps {
  /** Internal SPA route. Renders as `<Link>` so middle-click / cmd-click work. */
  to: string
  /** Left-side icon. Picks up `tintHex` via `currentColor`. */
  icon?: ReactNode
  /** Primary line — kept earth-100 for legibility regardless of tint. */
  primary: ReactNode
  /** Secondary line — earth-400. Optional. */
  secondary?: ReactNode
  /**
   * Locks the row in its selected appearance — left-edge bar at full
   * opacity, inner glow + black wash on the left. Use to mark the
   * active list item in a list/detail layout.
   */
  selected?: boolean
  /**
   * Hex color (e.g. `#dc2626`) that drives the icon color, the inner
   * glow when selected, and the left-edge bar. Without it the selected
   * appearance falls back to a neutral white wash.
   */
  tintHex?: string
  /**
   * Optional sand-particle rendering of the icon. When set AND the user
   * has not requested reduced motion, the icon slot is overlaid by a
   * canvas that animates the glyph as drifting sand with a wind tail
   * extending right behind the text. The `icon` prop is rendered as the
   * static fallback when reduced motion is on or the canvas can't
   * initialize. Pass `Icon.X.source` from the Icon library.
   */
  sandIcon?: IconSource
  'aria-label'?: string
}

// Sand silhouette geometry. The icon column starts at px-6 (24px) from
// the row's left edge and is w-16 (64px) wide — body center sits at
// 24 + 32 = 56px. Body diameter matches the static icon's text-6xl
// font-size so the silhouette aligns with the DOM glyph. The mask keeps
// the body fully opaque through ~icon-end (88px) and fades the wind
// tail to transparent before it reaches the secondary text — independent
// of row width.
const SAND_BODY_SIZE = 60
const SAND_BODY_OFFSET_X = 56
const SAND_MASK_GRADIENT = 'linear-gradient(to right, black 88px, transparent 130px)'

/**
 * Flat, edge-to-edge list row.
 *
 * Designed for list/sidebar surfaces where each item should read as
 * content-on-a-shared-surface rather than as a standalone card. At rest
 * the row is fully transparent and inherits whatever bg sits behind the
 * list. Hover and select fade in a left-edge bar, a soft directional
 * glow on the left, and a black-to-transparent wash that darkens the
 * left side so the glow pops — all anchored on the left, nothing on
 * the right.
 */
export default function FlatListRow({
  to,
  icon,
  primary,
  secondary,
  selected,
  tintHex,
  sandIcon,
  'aria-label': ariaLabel,
}: FlatListRowProps) {
  const tinted = typeof tintHex === 'string' && tintHex.length > 0
  const reducedMotion = useReducedMotion()
  const sandActive = sandIcon !== undefined && !reducedMotion
  const [hovered, setHovered] = useState(false)

  // Three effects, all anchored to the left edge:
  //   1. A 3px tinted bar (rendered as its own absolute element below) —
  //      fades in on hover (subtle) and selected (full).
  //   2. A soft directional inner glow (inset box-shadow with positive
  //      offsetX so the blur paints on the LEFT side inside the row) —
  //      shows only when selected.
  //   3. A black-to-transparent linear-gradient bg that darkens the
  //      row's left side so the glow has dark space to pop against —
  //      shows only when selected.
  const selectedBackground = 'linear-gradient(to right, black, transparent)'
  const selectedShadow = tinted
    ? `inset 32px 0 16px -16px ${tintHex}40`
    : 'inset 32px 0 16px -16px rgba(255,255,255,0.15)'
  const glowOpacity = selected ? 1 : 0
  const barOpacity = selected ? 1 : hovered ? 0.55 : 0

  const interactionHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  }
  const className =
    'relative isolate flex w-full items-center gap-4 px-6 py-4 text-left overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:[outline-offset:-2px]'

  const rowBody = (
    <>
      {/* Selected-only left-edge glow + black wash. Hover doesn't engage
          this — keeps the hover hint to just the bar. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          backgroundImage: selectedBackground,
          boxShadow: selectedShadow,
          opacity: glowOpacity,
        }}
      />
      {/* Left-edge bar — fades in on hover (subtle) and selected (full). */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] z-20 transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          background: tintHex || 'rgba(255,255,255,0.4)',
          opacity: barOpacity,
        }}
      />
      {sandActive && (
        // text-6xl matches the static icon's font-size so the canvas
        // rasterizer (which reads getComputedStyle().fontSize) draws the
        // silhouette at the same scale as the DOM glyph. Color tracks the
        // wrapper's text color — set inline for tinted, inherit otherwise.
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none text-6xl"
          style={{
            maskImage: SAND_MASK_GRADIENT,
            WebkitMaskImage: SAND_MASK_GRADIENT,
            ...(tinted ? { color: tintHex } : null),
          }}
        >
          <SandIcon
            source={sandIcon}
            bodySize={SAND_BODY_SIZE}
            bodyOffsetX={SAND_BODY_OFFSET_X}
          />
        </div>
      )}
      {icon !== undefined && (
        // When sand is active the static glyph stays in flex layout for
        // sizing but is `invisible` so it doesn't compete with the canvas
        // paint. w-16 + text-6xl gives a 64×60 icon slot that the sand
        // body geometry (above) is calibrated to. `relative z-10` lifts
        // the icon above the selected-state overlay so it doesn't get
        // washed out by the corner gradients.
        <div
          aria-hidden="true"
          className={`relative z-10 w-16 text-6xl flex items-center justify-center shrink-0 ${
            sandActive
              ? 'invisible'
              : 'transition-opacity duration-200 motion-reduce:transition-none'
          }`}
          style={{
            color: tinted ? tintHex : undefined,
            opacity: sandActive ? undefined : selected || hovered ? 0.95 : 0.65,
          }}
        >
          {icon}
        </div>
      )}
      <div className="relative z-10 flex flex-col min-w-0">
        <Type.CardTitle as="div">{primary}</Type.CardTitle>
        {secondary !== undefined && (
          <Type.Caption as="div" className="mt-0.5">
            {secondary}
          </Type.Caption>
        )}
      </div>
    </>
  )

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      {...interactionHandlers}
      className={className}
    >
      {rowBody}
    </Link>
  )
}
