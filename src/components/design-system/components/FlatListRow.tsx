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
 * the row is fully transparent — the surface tint comes from the
 * parent list container. Hover lifts a soft inner glow; selected makes
 * the glow tint-colored and adds a 3px left-edge accent bar.
 *
 * Pair with a tinted container (e.g. `<ul className="bg-earth-900/30">`)
 * so rest-state rows have something to sit on top of.
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

  // Inner glow = blurred inset shadow (the "bloom") + a thin inset ring
  // (the edge). Tinted variant uses tintHex for both layers; neutral
  // falls back to white. Selected is a notch stronger than hover so the
  // active row reads at rest. Hex alpha suffixes: 1F≈12%, 26≈15%,
  // 33≈20%, 40=25%.
  let boxShadow: string | undefined
  if (selected) {
    boxShadow = tinted
      ? `inset 0 0 24px ${tintHex}33, inset 0 0 0 1px ${tintHex}40`
      : 'inset 0 0 24px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.18)'
  } else if (hovered) {
    boxShadow = tinted
      ? `inset 0 0 16px ${tintHex}1F, inset 0 0 0 1px ${tintHex}26`
      : 'inset 0 0 16px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.08)'
  }

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{ boxShadow }}
      className="relative flex items-center gap-4 px-6 py-4 transition-shadow duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:[outline-offset:-2px]"
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
          style={{ background: tintHex || 'rgba(255,255,255,0.4)' }}
        />
      )}
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
        // body geometry (above) is calibrated to.
        <div
          aria-hidden="true"
          className={`w-16 text-6xl flex items-center justify-center shrink-0 ${
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
