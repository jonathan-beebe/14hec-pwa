import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { IconSource } from '../atoms/Icon'
import SandIcon, { useReducedMotion } from '../atoms/SandIcon'

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
   * Locks the row in its engaged appearance (stronger inner glow + the
   * left-edge accent bar). Use to mark the active list item in a
   * list/detail layout.
   */
  selected?: boolean
  /**
   * Hex color (e.g. `#dc2626`) that drives the icon color, the engaged
   * inner glow, and the selected left-edge bar. Without it the engaged
   * state falls back to a neutral white wash.
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
  const engaged = !!selected || hovered

  // Engaged state — three effects, all anchored to the left edge:
  //   1. A 3px tinted bar (rendered as its own absolute element below).
  //   2. A soft directional inner glow (inset box-shadow with positive
  //      offsetX so the blur paints on the LEFT side inside the row).
  //   3. A black-to-transparent linear-gradient bg that darkens the
  //      row's left side so the glow has dark space to pop against.
  // Effects 2 + 3 ride the same overlay's opacity (engagedOpacity), and
  // the bar uses the same value below — so rest, hover, and selected
  // animate as one. No top/bottom glow, no corner washes.
  const engagedBackground = 'linear-gradient(to right, black, transparent)'
  const engagedShadow = tinted
    ? `inset 32px 0 16px -16px ${tintHex}40`
    : 'inset 32px 0 16px -16px rgba(255,255,255,0.15)'
  const engagedOpacity = selected ? 1 : hovered ? 0.55 : 0

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative isolate flex items-center gap-4 px-6 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:[outline-offset:-2px]"
    >
      {/* Engaged corner-glow + left-edge bloom — fades in via opacity on hover/select. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          backgroundImage: engagedBackground,
          boxShadow: engagedShadow,
          opacity: engagedOpacity,
        }}
      />
      {/* Left-edge bar — fades in alongside the engaged overlay. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] z-20 transition-opacity duration-200 motion-reduce:transition-none"
        style={{
          background: tintHex || 'rgba(255,255,255,0.4)',
          opacity: engagedOpacity,
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
        // the icon above the engaged overlay so it doesn't get washed
        // out by the corner gradients.
        <div
          aria-hidden="true"
          className={`relative z-10 w-16 text-6xl flex items-center justify-center shrink-0 ${
            sandActive
              ? 'invisible'
              : 'transition-opacity duration-200 motion-reduce:transition-none'
          }`}
          style={{
            color: tinted ? tintHex : undefined,
            opacity: sandActive ? undefined : engaged ? 0.95 : 0.65,
          }}
        >
          {icon}
        </div>
      )}
      <div className="relative z-10 flex flex-col min-w-0">
        <div className="text-base font-system font-semibold tracking-tight text-earth-100">
          {primary}
        </div>
        {secondary !== undefined && (
          <div className="text-xs text-earth-400 leading-relaxed mt-0.5">
            {secondary}
          </div>
        )}
      </div>
    </Link>
  )
}
