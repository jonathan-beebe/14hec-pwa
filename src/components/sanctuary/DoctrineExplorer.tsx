import { useState, useEffect, useMemo } from 'react'
import { api } from '@/data/api'
import type { PlantTeachingWithPlant } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import FilterBar from '@/components/design-system/components/FilterBar'
import {
  useCollectionFilters,
  type CatalogFilter,
} from '@/components/design-system/hooks/useCollectionFilters'

type TeachingDomain = 'energetic' | 'mental' | 'physical' | 'spiritual'

const DOMAIN_CONFIG: Record<TeachingDomain, { label: string; color: string; bg: string; border: string; icon: string }> = {
  energetic: { label: 'Energetic', color: 'text-amber-400', bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.1)', icon: '\u2727' },
  mental: { label: 'Mental', color: 'text-blue-400', bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.1)', icon: '\u29BF' },
  physical: { label: 'Physical', color: 'text-botanical-400', bg: 'rgba(61, 138, 94, 0.06)', border: 'rgba(61, 138, 94, 0.1)', icon: '\u2618' },
  spiritual: { label: 'Spiritual', color: 'text-celestial-400', bg: 'rgba(168, 85, 247, 0.06)', border: 'rgba(168, 85, 247, 0.1)', icon: '\u2735' }
}

export default function DoctrineExplorer() {
  const [teachings, setTeachings] = useState<PlantTeachingWithPlant[]>([])
  const [selected, setSelected] = useState<PlantTeachingWithPlant | null>(null)
  const [activeDomain, setActiveDomain] = useState<TeachingDomain>('energetic')

  useEffect(() => {
    api.getAllTeachings().then((data) => {
      setTeachings(data)
      if (data.length > 0) setSelected(data[0])
    })
  }, [])

  const categoryOptions = useMemo(() => {
    const cats = new Set(teachings.map((t) => t.category))
    return [
      { value: '', label: 'All categories' },
      ...Array.from(cats)
        .sort()
        .map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1),
        })),
    ]
  }, [teachings])

  const filterConfig = useMemo<CatalogFilter[]>(
    () => [
      { kind: 'search', key: 'q', placeholder: 'Search plants…', label: 'Search' },
      { kind: 'select', key: 'category', label: 'Category', options: categoryOptions },
    ],
    [categoryOptions],
  )
  const { values, setValue, clear, hasActiveFilters } =
    useCollectionFilters(filterConfig)
  const searchQuery = values.q ?? ''
  const categoryFilter = values.category ?? ''

  const filtered = useMemo(() => {
    return teachings.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.latin_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === '' || t.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [teachings, searchQuery, categoryFilter])

  const getTeachingText = (t: PlantTeachingWithPlant, domain: TeachingDomain): string => {
    switch (domain) {
      case 'energetic': return t.energetic_teaching
      case 'mental': return t.mental_teaching
      case 'physical': return t.physical_teaching
      case 'spiritual': return t.spiritual_teaching
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="hero-section mb-8"
           style={{
             background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(16, 15, 12, 0.85) 40%, rgba(20, 83, 45, 0.04) 100%)',
             border: '1px solid rgba(245, 158, 11, 0.08)'
           }}>
        <div className="hero-orb w-40 h-40 bg-amber-500 top-0 right-0" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-amber-400 to-botanical-500" />
            <div>
              <Text.PageTitle className="text-gradient-gold">
                Doctrine of Plant Teachings
              </Text.PageTitle>
              <p className="text-earth-400 text-sm mt-1">
                What each plant activates within you {'\u2014'} energetic, mental, physical, and spiritual teachings for all {teachings.length} plants
              </p>
            </div>
          </div>
          <p className="text-earth-500 text-xs mt-4 font-display italic max-w-2xl leading-relaxed">
            "Plants activate what is already within us. They are mirrors and catalysts, not additions." {'\u2014'} Every teaching here reflects the truth that your body, mind, and spirit already contain everything they need. Plants simply remind you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Panel: Plant List */}
        <div className="lg:col-span-1">
          <Text.SectionLabel className="mb-3">Plant Teachings ({filtered.length})</Text.SectionLabel>

          <div className="mb-3">
            <FilterBar
              filters={filterConfig}
              values={values}
              onChange={setValue}
              onClear={clear}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Plant List */}
          <div className="space-y-1.5 max-h-[calc(100vh-380px)] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className="w-full text-left p-3 rounded-xl transition-all duration-200 ease-out-expo"
                style={{
                  background: selected?.id === t.id ? 'rgba(245, 158, 11, 0.08)' : 'rgba(26, 25, 21, 0.5)',
                  border: selected?.id === t.id ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: selected?.id === t.id ? '0 0 24px rgba(245, 158, 11, 0.06)' : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm text-earth-200 font-display font-medium truncate">{t.common_name}</div>
                    <div className="text-xs text-earth-500 italic truncate">{t.latin_name}</div>
                  </div>
                  <span className={`badge badge-${t.category} ml-2 flex-shrink-0`}>{t.category}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-earth-500 text-sm text-center py-6">No plants match your search.</p>
            )}
          </div>
        </div>

        {/* Right Panel: Teaching Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="animate-fade-in">
              {/* Plant Header */}
              <div className="glass-panel p-6 mb-4"
                   style={{
                     background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(16, 15, 12, 0.85))',
                     border: '1px solid rgba(245, 158, 11, 0.08)'
                   }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Text.Heading className="text-amber-300">{selected.common_name}</Text.Heading>
                    <p className="text-sm text-earth-500 italic">{selected.latin_name}</p>
                  </div>
                  <Button.Ghost
                    route={`/plants/${selected.plant_id}`}
                    className="text-xs"
                  >
                    Full profile {'\u2192'}
                  </Button.Ghost>
                </div>

                {/* Activation Principle */}
                <div className="rounded-xl p-4 mb-4"
                     style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  <Text.SectionLabel className="mb-1.5 text-amber-400/70">{'\u2726'} Activation Principle</Text.SectionLabel>
                  <p className="text-sm text-earth-200 leading-relaxed font-display italic">
                    {selected.activation_principle}
                  </p>
                </div>

                {/* Domain Tabs */}
                <div className="flex gap-2 mb-4">
                  {(Object.entries(DOMAIN_CONFIG) as [TeachingDomain, typeof DOMAIN_CONFIG.energetic][]).map(([domain, config]) => (
                    <button
                      key={domain}
                      onClick={() => setActiveDomain(domain)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeDomain === domain ? config.color : 'text-earth-500 hover:text-earth-300'
                      }`}
                      style={{
                        background: activeDomain === domain ? config.bg : 'rgba(26, 25, 21, 0.4)',
                        border: activeDomain === domain ? `1px solid ${config.border}` : '1px solid rgba(255,255,255,0.03)'
                      }}
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>

                {/* Teaching Content */}
                <div className="rounded-xl p-5"
                     style={{
                       background: DOMAIN_CONFIG[activeDomain].bg,
                       border: `1px solid ${DOMAIN_CONFIG[activeDomain].border}`
                     }}>
                  <Text.SectionLabel className={`mb-2 ${DOMAIN_CONFIG[activeDomain].color}`}>
                    {DOMAIN_CONFIG[activeDomain].icon} {DOMAIN_CONFIG[activeDomain].label} Teaching
                  </Text.SectionLabel>
                  <p className="text-sm text-earth-300 leading-relaxed">
                    {getTeachingText(selected, activeDomain)}
                  </p>
                </div>
              </div>

              {/* All Teachings Overview */}
              <div className="card">
                <Text.SectionLabel className="mb-3">All Four Teachings</Text.SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.entries(DOMAIN_CONFIG) as [TeachingDomain, typeof DOMAIN_CONFIG.energetic][]).map(([domain, config]) => (
                    <button
                      key={domain}
                      onClick={() => setActiveDomain(domain)}
                      className="text-left rounded-xl p-3 transition-all hover:scale-[1.01]"
                      style={{
                        background: activeDomain === domain ? config.bg : 'rgba(26, 25, 21, 0.4)',
                        border: activeDomain === domain ? `1px solid ${config.border}` : '1px solid rgba(255,255,255,0.04)'
                      }}
                    >
                      <span className={`text-xs font-display font-medium ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                      <p className="text-xs text-earth-400 mt-1 line-clamp-2">
                        {getTeachingText(selected, domain)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16 text-earth-500">
              <div className="text-4xl mb-3 opacity-15 animate-pulse-slow">{'\u2638'}</div>
              <p className="text-lg font-display mb-2">Select a plant teaching</p>
              <p className="text-sm">Discover what each plant activates within you across four dimensions of being</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
