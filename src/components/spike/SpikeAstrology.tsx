import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, PlanetData, ZodiacSign } from '@/types'
import Text from '@/components/design-system/atoms/Text'
import { ZodiacSymbol } from '@/components/design-system/atoms/ZodiacSymbol'
import { RoutedListDetailLayout } from '@/components/design-system/layouts/ListDetailLayout'
import PlanetTile from '@/components/design-system/components/PlanetTile'
import InfoTile, {
  type InfoTileTone,
} from '@/components/design-system/components/InfoTile'
import { allPlanets, type PlanetVisual } from './planetConfig'

// Classical element → HMBS domain tone. Fire is the active/transcendent
// principle, water the relational/feeling one, air the cognitive one,
// earth the embodied one. Used to pick the InfoTile domain variant.
const ELEMENT_TONE: Record<string, InfoTileTone> = {
  fire: 'spirit',
  water: 'heart',
  air: 'mind',
  earth: 'body',
}

/**
 * Spike playground for porting the astrology area onto the new design
 * system. The parent owns the shared header (page title, Astro-Botanical
 * Chart and Planetary Timing quick links, Signs/Planets switch); each
 * sub-area is its own RoutedListDetailLayout.
 *
 *   /spike/astrology               → redirects to /signs
 *   /spike/astrology/signs         → list of ZodiacTiles + empty detail
 *   /spike/astrology/signs/:slug   → list + populated detail panel
 *   /spike/astrology/planets       → list of PlanetTiles + empty detail
 *   /spike/astrology/planets/:slug → list + populated detail panel
 */
export default function SpikeAstrology() {
  return (
    <div className="flex flex-col h-full">
      {/* Header — outside the list/detail layout so the switch + quick
          links stay visible while a detail is selected, even on mobile. */}
      <div className="px-8 pt-6 pb-4 shrink-0 border-b border-white/5">
        <Text.PageTitle>Astrology</Text.PageTitle>
        <p className="text-xs text-earth-500 mt-0.5">
          Celestial correspondences for plant medicine
        </p>

        {/* Quick links — same content as /astrology's top row, lifted as-is. */}
        <div className="grid grid-cols-2 gap-3 mt-4">
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

        {/* Signs / Planets switch — NavLink so the URL is the single
            source of truth and keyboard nav works. */}
        <div
          className="flex gap-2 mt-5"
          role="tablist"
          aria-label="Astrology view"
        >
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
      </div>

      {/* Sub-area: list/detail layout fills remaining viewport height. */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  )
}

// ─── Slug helpers ───────────────────────────────────────────────────────

const slug = (name: string) => name.toLowerCase()

// PlanetTile reserves a 180px icon slot, so the list column needs a
// floor wide enough to keep the text from getting squeezed. No explicit
// width — the column sizes to its content, capped only by the min.
const SPIKE_LIST_WIDTH = 'lg:min-w-[400px]'

// ─── Signs: list ────────────────────────────────────────────────────────

function SignsList({ signs }: { signs: ZodiacSign[] }) {
  return (
    <ul className="p-3 space-y-3">
      {signs.map((sign) => {
        // Sign names map 1:1 onto the ZodiacSymbol namespace ("Aries",
        // "Taurus", …). If the seed grows a sign that isn't drawn yet,
        // skip it rather than tofu.
        const IconComp =
          ZodiacSymbol[sign.name as keyof typeof ZodiacSymbol]
        if (!IconComp) return null
        const tone = ELEMENT_TONE[sign.element] ?? 'spirit'
        const tintHex = sign.power_colors[0]?.hex
        return (
          <li key={sign.id}>
            <InfoTile
              to={slug(sign.name)}
              tone={tone}
              tintHex={tintHex}
              icon={<IconComp />}
              sandIcon={IconComp.source}
              primary={sign.name}
              secondary={
                <span className="capitalize">
                  {sign.element} · {sign.modality}
                </span>
              }
              aria-label={`${sign.name} — ${sign.element} ${sign.modality}`}
            />
          </li>
        )
      })}
    </ul>
  )
}

function SignsEmpty() {
  return (
    <div className="h-full flex items-center justify-center px-6 py-16 text-center text-earth-500 text-sm">
      <div>
        <div className="text-4xl mb-3 opacity-20">{'☉'}</div>
        Select a zodiac sign to view its correspondences.
      </div>
    </div>
  )
}

export function SpikeAstrologySigns() {
  const [signs, setSigns] = useState<ZodiacSign[]>([])

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
  }, [])

  return (
    <RoutedListDetailLayout
      list={<SignsList signs={signs} />}
      emptyDetail={<SignsEmpty />}
      sidebarWidthClass={SPIKE_LIST_WIDTH}
    />
  )
}

// ─── Sign detail ────────────────────────────────────────────────────────

const ELEMENT_BADGE: Record<string, string> = {
  fire: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20',
  water: 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20',
  air: 'bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-500/20',
  earth: 'bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/20',
}

type SignDetail = ZodiacSign & { plants?: Plant[] }

export function SpikeAstrologySignDetail() {
  const { slug: signSlug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [detail, setDetail] = useState<SignDetail | null>(null)

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
  }, [])

  const target = useMemo(
    () => signs.find((s) => slug(s.name) === signSlug?.toLowerCase()),
    [signs, signSlug],
  )

  useEffect(() => {
    if (target === undefined) {
      setDetail(null)
      return
    }
    let cancelled = false
    api.getZodiacSignById(target.id).then((d) => {
      if (!cancelled) setDetail(d)
    })
    return () => {
      cancelled = true
    }
  }, [target])

  if (signSlug && signs.length > 0 && target === undefined) {
    return (
      <div className="p-6 text-earth-500 text-sm">
        Sign &ldquo;{signSlug}&rdquo; not found.
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="p-6 text-earth-500 text-sm">Loading…</div>
    )
  }

  const SignIcon = ZodiacSymbol[detail.name as keyof typeof ZodiacSymbol]

  return (
    <article className="p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-5">
        {SignIcon ? (
          <SignIcon className="text-5xl" />
        ) : (
          <span className="text-5xl font-symbol">{detail.symbol}</span>
        )}
        <div>
          <Text.PageTitle as="h2">{detail.name}</Text.PageTitle>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span
              className={`badge ${ELEMENT_BADGE[detail.element] || ''} capitalize`}
            >
              {detail.element}
            </span>
            <span className="badge bg-earth-800/50 text-earth-300 ring-1 ring-inset ring-earth-600/20 capitalize">
              {detail.modality}
            </span>
            {detail.power_colors.map((c) => (
              <ColorChip key={c.name} name={c.name} hex={c.hex} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <DetailFact label="Ruling Planet">
          {detail.ruling_planet_symbol} {detail.ruling_planet_name}
        </DetailFact>
        <DetailFact label="Date Range">
          {detail.date_range_start} to {detail.date_range_end}
        </DetailFact>
        <DetailFact label="Body Parts Ruled" className="col-span-2">
          {detail.body_parts_ruled}
        </DetailFact>
        {detail.power_colors.length > 0 && (
          <DetailFact label="Power Color" className="col-span-2">
            <div className="flex flex-wrap gap-4 mt-1">
              {detail.power_colors.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full ring-1 ring-inset ring-white/10 shadow-inner"
                    style={{ background: c.hex }}
                  />
                  <span className="text-earth-200">{c.name}</span>
                </div>
              ))}
            </div>
            {detail.power_color_meaning && (
              <p className="text-xs text-earth-400 mt-3 italic">
                {detail.power_color_meaning}
              </p>
            )}
          </DetailFact>
        )}
      </div>

      <p className="text-sm text-earth-400 mb-5 leading-relaxed">
        {detail.description}
      </p>

      {detail.plants && detail.plants.length > 0 && (
        <PlantList plants={detail.plants} onPick={(id) => navigate(`/plants/${id}`)} />
      )}
    </article>
  )
}

// ─── Planets: list ──────────────────────────────────────────────────────

// Planet name → PlanetVisual config. Spike configs live alongside the
// tile, so list rendering reads them directly without going through the
// data layer.
const PLANET_CONFIG: Record<string, PlanetVisual> = Object.fromEntries(
  allPlanets.map((p) => [p.name, p]),
)

function PlanetsList({ planets }: { planets: PlanetData[] }) {
  // Order tiles by the visual config order (Sun, Moon, Mercury, …) so
  // the column reads in classical sequence regardless of API ordering.
  const ordered = useMemo(() => {
    const byName = new Map(planets.map((p) => [p.name, p]))
    return allPlanets
      .map((cfg) => byName.get(cfg.name))
      .filter((p): p is PlanetData => p !== undefined)
  }, [planets])

  return (
    <ul className="p-3 space-y-3">
      {ordered.map((planet) => {
        const config = PLANET_CONFIG[planet.name]
        if (!config) return null
        return (
          <li key={planet.id}>
            <PlanetTile
              config={config}
              primary={planet.name}
              secondary={planet.associated_signs}
              to={slug(planet.name)}
              aria-label={`${planet.name} — ${planet.associated_signs}`}
            />
          </li>
        )
      })}
    </ul>
  )
}

function PlanetsEmpty() {
  return (
    <div className="h-full flex items-center justify-center px-6 py-16 text-center text-earth-500 text-sm">
      <div>
        <div className="text-4xl mb-3 opacity-20">{'☉'}</div>
        Select a planet to view its correspondences.
      </div>
    </div>
  )
}

export function SpikeAstrologyPlanets() {
  const [planets, setPlanets] = useState<PlanetData[]>([])

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  return (
    <RoutedListDetailLayout
      list={<PlanetsList planets={planets} />}
      emptyDetail={<PlanetsEmpty />}
      sidebarWidthClass={SPIKE_LIST_WIDTH}
    />
  )
}

// ─── Planet detail ──────────────────────────────────────────────────────

type PlanetFullDetail = PlanetData & { plants?: Plant[] }

export function SpikeAstrologyPlanetDetail() {
  const { slug: planetSlug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [detail, setDetail] = useState<PlanetFullDetail | null>(null)

  useEffect(() => {
    api.getPlanets().then(setPlanets)
  }, [])

  const target = useMemo(
    () => planets.find((p) => slug(p.name) === planetSlug?.toLowerCase()),
    [planets, planetSlug],
  )

  useEffect(() => {
    if (target === undefined) {
      setDetail(null)
      return
    }
    let cancelled = false
    api.getPlanetById(target.id).then((d) => {
      if (!cancelled) setDetail(d)
    })
    return () => {
      cancelled = true
    }
  }, [target])

  if (planetSlug && planets.length > 0 && target === undefined) {
    return (
      <div className="p-6 text-earth-500 text-sm">
        Planet &ldquo;{planetSlug}&rdquo; not found.
      </div>
    )
  }

  if (!detail) {
    return <div className="p-6 text-earth-500 text-sm">Loading…</div>
  }

  return (
    <article className="p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl">{detail.symbol}</span>
        <div>
          <Text.PageTitle as="h2">{detail.name}</Text.PageTitle>
          <p className="text-sm text-earth-500">{detail.associated_signs}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <DetailFact label="Body Systems">{detail.body_systems}</DetailFact>
        <DetailFact label="Energetic Quality">
          {detail.energetic_quality}
        </DetailFact>
      </div>

      <p className="text-sm text-earth-400 mb-5 leading-relaxed">
        {detail.description}
      </p>

      {detail.plants && detail.plants.length > 0 && (
        <PlantList plants={detail.plants} onPick={(id) => navigate(`/plants/${id}`)} />
      )}
    </article>
  )
}

// ─── Shared detail bits ─────────────────────────────────────────────────

function ColorChip({ name, hex }: { name: string; hex: string }) {
  // Inline boxShadow overrides .badge's ring-1 inset; bg + ring tint with
  // 8-digit hex (10% / 25% alpha) for a chip that reads as the color
  // without overpowering the dark surface. The dot is the only fully-
  // saturated swatch, so even Black/Deep Red read clearly.
  return (
    <span
      className="badge"
      style={{
        background: `${hex}1A`,
        boxShadow: `inset 0 0 0 1px ${hex}40`,
        color: '#e7e5e4',
      }}
    >
      <span
        aria-hidden="true"
        className="w-2 h-2 rounded-full mr-1.5 inline-block ring-1 ring-inset ring-white/20"
        style={{ background: hex }}
      />
      {name}
    </span>
  )
}

function DetailFact({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl p-3 ${className ?? ''}`}
      style={{
        background: 'rgba(36, 34, 30, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Text.SectionLabel>{label}</Text.SectionLabel>
      <div className="text-earth-200 text-sm">{children}</div>
    </div>
  )
}

function PlantList({
  plants,
  onPick,
}: {
  plants: Plant[]
  onPick: (id: number) => void
}) {
  return (
    <div>
      <Text.SectionLabel>Associated Plants</Text.SectionLabel>
      <div className="space-y-2">
        {plants.map((plant) => (
          <button
            key={plant.id}
            onClick={() => onPick(plant.id)}
            className="w-full text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
            style={{
              background: 'rgba(36, 34, 30, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background =
                'rgba(36, 34, 30, 0.65)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background =
                'rgba(36, 34, 30, 0.4)'
            }}
          >
            <span className="text-botanical-400 group-hover:text-botanical-300 transition-colors">
              {plant.common_name}
            </span>
            <span className="text-earth-500 text-sm ml-2 italic">
              {plant.latin_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
