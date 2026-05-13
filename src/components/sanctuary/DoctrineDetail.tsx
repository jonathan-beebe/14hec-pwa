import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlantTeachingWithPlant } from '@/types'
import Button from '@/components/design-system/atoms/Button'
import Type from '@/components/design-system/atoms/Type'
import Notice from '@/components/design-system/components/Notice'

export type TeachingDomain = 'energetic' | 'mental' | 'physical' | 'spiritual'

const DOMAINS: TeachingDomain[] = ['energetic', 'mental', 'physical', 'spiritual']

const DOMAIN_LABEL: Record<TeachingDomain, string> = {
  energetic: 'Energetic',
  mental: 'Mental',
  physical: 'Physical',
  spiritual: 'Spiritual',
}

const DOMAIN_ICON: Record<TeachingDomain, string> = {
  energetic: '✧',
  mental: '⦿',
  physical: '☘',
  spiritual: '✵',
}

const DOMAIN_TINT: Record<
  TeachingDomain,
  { text: string; panel: string; border: string }
> = {
  energetic: {
    text: 'text-amber-400',
    panel: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/10',
  },
  mental: {
    text: 'text-blue-400',
    panel: 'bg-blue-500/[0.06]',
    border: 'border-blue-500/10',
  },
  physical: {
    text: 'text-botanical-400',
    panel: 'bg-botanical-500/[0.06]',
    border: 'border-botanical-500/10',
  },
  spiritual: {
    text: 'text-celestial-400',
    panel: 'bg-celestial-500/[0.06]',
    border: 'border-celestial-500/10',
  },
}

function isDomain(value: string | null): value is TeachingDomain {
  return (
    value === 'energetic' ||
    value === 'mental' ||
    value === 'physical' ||
    value === 'spiritual'
  )
}

function getTeachingText(
  teaching: PlantTeachingWithPlant,
  domain: TeachingDomain,
): string {
  switch (domain) {
    case 'energetic':
      return teaching.energetic_teaching
    case 'mental':
      return teaching.mental_teaching
    case 'physical':
      return teaching.physical_teaching
    case 'spiritual':
      return teaching.spiritual_teaching
  }
}

export default function DoctrineDetail() {
  const { plantId } = useParams<{ plantId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [teaching, setTeaching] = useState<PlantTeachingWithPlant | null>(null)

  const domainParam = searchParams.get('domain')
  const activeDomain: TeachingDomain = isDomain(domainParam)
    ? domainParam
    : 'energetic'

  function setActiveDomain(domain: TeachingDomain) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('domain', domain)
        return next
      },
      { replace: true },
    )
  }

  useEffect(() => {
    if (plantId === undefined) return
    let cancelled = false
    api.getAllTeachings().then((all) => {
      if (cancelled) return
      const t = all.find((x) => String(x.plant_id) === plantId) ?? null
      setTeaching(t)
    })
    return () => {
      cancelled = true
    }
  }, [plantId])

  if (!teaching) {
    return (
      <div className="p-8 lg:pl-2">
        <div className="skeleton h-12 w-72 mb-4" />
        <div className="skeleton h-24 w-full rounded-2xl mb-4" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    )
  }

  const activeTint = DOMAIN_TINT[activeDomain]
  const tabPanelId = `doctrine-panel-${activeDomain}`
  const activeTabId = `doctrine-tab-${activeDomain}`

  return (
    <article className="p-8 lg:pl-2 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Type.Heading className="text-amber-300">
              {teaching.common_name}
            </Type.Heading>
            <Type.Caption className="italic mt-0.5">
              {teaching.latin_name}
            </Type.Caption>
          </div>
          <Button.Ghost
            route={`/plants/${teaching.plant_id}`}
            className="text-xs shrink-0"
          >
            Full profile →
          </Button.Ghost>
        </div>
      </header>

      <Notice title="Activation Principle" tone="info" icon="✦">
        <em className="not-italic">{teaching.activation_principle}</em>
      </Notice>

      <div
        role="tablist"
        aria-label="Teaching domains"
        className="flex flex-wrap gap-2 mt-6 mb-3"
      >
        {DOMAINS.map((domain) => {
          const tint = DOMAIN_TINT[domain]
          const isActive = domain === activeDomain
          return (
            <button
              key={domain}
              id={`doctrine-tab-${domain}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`doctrine-panel-${domain}`}
              type="button"
              onClick={() => setActiveDomain(domain)}
              className={
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                (isActive
                  ? `${tint.text} ${tint.panel} border ${tint.border}`
                  : 'text-earth-500 hover:text-earth-300 bg-earth-900/40 border border-white/[0.03]')
              }
            >
              <span aria-hidden>{DOMAIN_ICON[domain]}</span>
              {DOMAIN_LABEL[domain]}
            </button>
          )
        })}
      </div>

      <section
        id={tabPanelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
        className={`rounded-xl p-5 border ${activeTint.panel} ${activeTint.border}`}
      >
        <Type.SectionLabel className={`mb-2 ${activeTint.text}`}>
          <span aria-hidden>{DOMAIN_ICON[activeDomain]}</span>{' '}
          {DOMAIN_LABEL[activeDomain]} Teaching
        </Type.SectionLabel>
        <Type.Body className="text-earth-300">
          {getTeachingText(teaching, activeDomain)}
        </Type.Body>
      </section>

      <div className="mt-6">
        <Type.SectionLabel as="h3" className="mb-3">
          All Four Teachings
        </Type.SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOMAINS.map((domain) => {
            const tint = DOMAIN_TINT[domain]
            const isActive = domain === activeDomain
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setActiveDomain(domain)}
                className={
                  'text-left rounded-xl p-3 transition-all hover:scale-[1.01] motion-reduce:hover:scale-100 border ' +
                  (isActive
                    ? `${tint.panel} ${tint.border}`
                    : 'bg-earth-900/40 border-white/[0.04]')
                }
                aria-label={`Show ${DOMAIN_LABEL[domain]} teaching`}
              >
                <Type.Caption className={`font-medium ${tint.text}`}>
                  <span aria-hidden>{DOMAIN_ICON[domain]}</span>{' '}
                  {DOMAIN_LABEL[domain]}
                </Type.Caption>
                <Type.Caption as="p" className="mt-1 line-clamp-2">
                  {getTeachingText(teaching, domain)}
                </Type.Caption>
              </button>
            )
          })}
        </div>
      </div>
    </article>
  )
}
