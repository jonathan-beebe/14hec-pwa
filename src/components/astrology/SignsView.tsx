import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, ZodiacSign } from '@/types'
import Text from '@/components/design-system/atoms/Text'
import { ZodiacSymbol } from '@/components/design-system/atoms/ZodiacSymbol'
import { RoutedListDetailLayout } from '@/components/design-system/layouts/ListDetailLayout'
import InfoTile, {
  type InfoTileTone,
} from '@/components/design-system/components/InfoTile'
import {
  ASTROLOGY_LIST_WIDTH,
  ASTROLOGY_TOP_INSET,
  AssociatedPlants,
  ColorChip,
  DetailFact,
  slug,
} from './AstrologyShared'

// Classical element → HMBS domain tone. Fire is the active/transcendent
// principle, water the relational/feeling one, air the cognitive one,
// earth the embodied one. Used to pick the InfoTile domain variant.
const ELEMENT_TONE: Record<string, InfoTileTone> = {
  fire: 'spirit',
  water: 'heart',
  air: 'mind',
  earth: 'body',
}

const ELEMENT_BADGE: Record<string, string> = {
  fire: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20',
  water: 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20',
  air: 'bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-500/20',
  earth: 'bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/20',
}

function SignsList({ signs }: { signs: ZodiacSign[] }) {
  // The list lives in the parent route's element, so :slug isn't on the
  // params hierarchy here — useMatch reads it off the child route pattern
  // directly so the tile can self-mark as selected at rest.
  const match = useMatch('/astrology/signs/:slug')
  const activeSlug = match?.params.slug?.toLowerCase()

  return (
    <ul className="p-3 space-y-3">
      {signs.map((sign) => {
        const IconComp =
          ZodiacSymbol[sign.name as keyof typeof ZodiacSymbol]
        if (!IconComp) return null
        const tone = ELEMENT_TONE[sign.element] ?? 'spirit'
        const tintHex = sign.power_colors[0]?.hex
        const tileSlug = slug(sign.name)
        return (
          <li key={sign.id}>
            <InfoTile
              to={tileSlug}
              tone={tone}
              tintHex={tintHex}
              selected={activeSlug === tileSlug}
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

export default function SignsView() {
  const [signs, setSigns] = useState<ZodiacSign[]>([])

  useEffect(() => {
    api.getZodiacSigns().then(setSigns)
  }, [])

  return (
    <RoutedListDetailLayout
      list={<SignsList signs={signs} />}
      emptyDetail={<SignsEmpty />}
      sidebarWidthClass={ASTROLOGY_LIST_WIDTH}
      topInset={ASTROLOGY_TOP_INSET}
    />
  )
}

type SignDetail = ZodiacSign & { plants?: Plant[] }

export function SignDetailView() {
  const { slug: signSlug } = useParams<{ slug: string }>()
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
    return <div className="p-6 text-earth-500 text-sm">Loading…</div>
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
        <AssociatedPlants plants={detail.plants} />
      )}
    </article>
  )
}
