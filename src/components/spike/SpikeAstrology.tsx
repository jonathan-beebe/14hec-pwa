import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlanetData, ZodiacSign } from '@/types'
import Text from '@/components/design-system/atoms/Text'
import { Icon, type IconComponent } from '@/components/design-system/atoms/Icon'
import PlanetTile from '@/components/design-system/components/PlanetTile'
import ZodiacTile, {
  type ZodiacElement,
} from '@/components/design-system/components/ZodiacTile'
import { allPlanets, type PlanetVisual } from './planetConfig'

/**
 * Spike playground for porting the astrology area onto the new design
 * system. Header reproduces /astrology's current top section (page title,
 * Astro-Botanical Chart and Planetary Timing quick links) and adds a
 * Signs/Planets switch that drives URL-based list views below.
 *
 *   /spike/astrology          → redirects to /signs
 *   /spike/astrology/signs    → 12 ZodiacTiles, tinted by element
 *   /spike/astrology/planets  → 10 PlanetTiles, tinted per planet
 *
 * Detail views are intentionally not wired yet — the list cards are the
 * focus of this iteration. The tiles render as no-op buttons.
 */
export default function SpikeAstrology() {
  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <Text.PageTitle>Astrology</Text.PageTitle>
        <p className="text-xs text-earth-500 mt-0.5">
          Celestial correspondences for plant medicine
        </p>
      </div>

      {/* Quick links — same content as /astrology's top row, lifted as-is. */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link
          to="/natal-chart"
          className="card-glow-celestial text-left py-4 group block"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-200 ease-out-expo">
              {'⭐'}
            </span>
            <div>
              <div className="text-sm font-display font-medium text-celestial-400">
                Astro-Botanical Chart
              </div>
              <div className="text-xs text-earth-500">
                Input Sun/Moon/Rising for a personalized plant map
              </div>
            </div>
          </div>
        </Link>
        <Link
          to="/planetary-timing"
          className="card-glow-celestial text-left py-4 group block"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-200 ease-out-expo">
              {'⌚'}
            </span>
            <div>
              <div className="text-sm font-display font-medium text-celestial-400">
                Planetary Timing
              </div>
              <div className="text-xs text-earth-500">
                Optimal hours for harvesting and preparation
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Signs / Planets switch — NavLink so the URL is the single source
          of truth for which list is active and keyboard nav works. */}
      <div className="flex gap-2 mb-5" role="tablist" aria-label="Astrology view">
        <NavLink
          to="/spike/astrology/signs"
          className={({ isActive }) =>
            `btn-celestial ${
              isActive
                ? ''
                : '!bg-none !shadow-none bg-earth-800/40 !text-earth-400 hover:!text-earth-200'
            }`
          }
        >
          Zodiac Signs
        </NavLink>
        <NavLink
          to="/spike/astrology/planets"
          className={({ isActive }) =>
            `btn-celestial ${
              isActive
                ? ''
                : '!bg-none !shadow-none bg-earth-800/40 !text-earth-400 hover:!text-earth-200'
            }`
          }
        >
          Planets
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

// ─── Signs list ─────────────────────────────────────────────────────────

// Sign name → Icon entry. Uses the design-system Icon library so the
// SandIcon and any DOM consumers share the same character resolution.
const ZODIAC_ICONS: Record<string, IconComponent> = {
  Aries: Icon.Aries,
  Taurus: Icon.Taurus,
  Gemini: Icon.Gemini,
  Cancer: Icon.Cancer,
  Leo: Icon.Leo,
  Virgo: Icon.Virgo,
  Libra: Icon.Libra,
  Scorpio: Icon.Scorpio,
  Sagittarius: Icon.Sagittarius,
  Capricorn: Icon.Capricorn,
  Aquarius: Icon.Aquarius,
  Pisces: Icon.Pisces,
}

export function SpikeAstrologySigns() {
  const [signs, setSigns] = useState<ZodiacSign[]>([])

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signs.map((sign) => {
        const iconComp = ZODIAC_ICONS[sign.name]
        if (!iconComp) return null
        const secondary = (
          <span className="capitalize">
            {sign.element} · {sign.modality}
          </span>
        )
        return (
          <ZodiacTile
            key={sign.id}
            source={iconComp.source}
            element={sign.element as ZodiacElement}
            primary={sign.name}
            secondary={secondary}
            onClick={() => {}}
            aria-label={`${sign.name} — ${sign.element} ${sign.modality}`}
          />
        )
      })}
    </div>
  )
}

// ─── Planets list ───────────────────────────────────────────────────────

// Planet name → PlanetVisual config. The spike configs live alongside
// the tile, so list rendering can read them directly without going
// through the data layer.
const PLANET_CONFIG: Record<string, PlanetVisual> = Object.fromEntries(
  allPlanets.map((p) => [p.name, p]),
)

export function SpikeAstrologyPlanets() {
  const [planets, setPlanets] = useState<PlanetData[]>([])

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  // Order tiles by the visual config order (Sun, Moon, Mercury, …) so the
  // grid reads in classical sequence regardless of API ordering.
  const ordered = useMemo(() => {
    const byName = new Map(planets.map((p) => [p.name, p]))
    return allPlanets
      .map((cfg) => byName.get(cfg.name))
      .filter((p): p is PlanetData => p !== undefined)
  }, [planets])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ordered.map((planet) => {
        const config = PLANET_CONFIG[planet.name]
        if (!config) return null
        return (
          <PlanetTile
            key={planet.id}
            config={config}
            primary={planet.name}
            secondary={planet.associated_signs}
            onClick={() => {}}
            aria-label={`${planet.name} — ${planet.associated_signs}`}
          />
        )
      })}
    </div>
  )
}
