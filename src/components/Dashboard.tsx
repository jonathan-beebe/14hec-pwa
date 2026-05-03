import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, Ailment, ZodiacSign, Collection } from '../types'
import Button from '@/components/design-system/atoms/Button'
import LinkCard from '@/components/design-system/components/LinkCard'

const viewToPath: Record<string, string> = {
  dashboard: '/',
  plants: '/plants',
  ailments: '/ailments',
  wellness: '/wellness',
  preparations: '/preparations',
  entheogenic: '/entheogens',
  'body-systems': '/body-systems',
  astrology: '/astrology',
  'natal-chart': '/natal-chart',
  'planetary-timing': '/planetary-timing',
  hmbs: '/hmbs',
  seasonal: '/seasonal',
  doctrine: '/doctrine',
  journal: '/journal',
  crossref: '/crossref',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [plants, setPlants] = useState<Plant[]>([])
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getPlants().then(setPlants)
    api.getAilments().then(setAilments)
    api.getZodiacSigns().then(setSigns)
    api.getCollections().then(setCollections).catch(() => {})
  }, [])

  const filteredPlants = search
    ? plants.filter(
        (p) =>
          p.common_name.toLowerCase().includes(search.toLowerCase()) ||
          p.latin_name.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const featuredPlant = plants.length > 0
    ? plants[new Date().getDate() % plants.length]
    : null

  return (
    <div className="max-w-6xl">
      {/* Hero Section */}
      <div className="hero-section mb-8">
        <div className="hero-orb w-96 h-96 -top-48 right-0 bg-botanical-500" />
        <div className="hero-orb w-72 h-72 -bottom-36 -left-24 bg-celestial-500" style={{ opacity: 0.1 }} />

        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-1 h-12 rounded-full"
                 style={{ background: 'linear-gradient(to bottom, #5da87e, #7c5eed)' }} />
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient-botanical tracking-tight">
                14 HEC Plant Intelligence
              </h1>
              <p className="text-earth-400 text-sm mt-1">
                Herbal {'\u00b7'} Energetic {'\u00b7'} Celestial {'\u2014'} Cross-reference plants, ailments, and astrology
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search plants, ailments, or conditions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11 py-3"
          />
          {search && filteredPlants.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-glass-dense rounded-2xl overflow-hidden shadow-depth-xl z-20 animate-fade-in-down"
                 style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {filteredPlants.slice(0, 5).map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => navigate(`/plants/${plant.id}`)}
                  className="w-full text-left px-5 py-3 flex justify-between items-center group transition-colors duration-100"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div>
                    <span className="text-earth-100 group-hover:text-botanical-400 transition-colors text-sm">{plant.common_name}</span>
                    <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                  </div>
                  <span className={`badge badge-${plant.category}`}>{plant.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid — Stats + HMBS combined */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {/* Stats */}
        {[
          { label: 'Plants', count: plants.length, color: 'botanical', view: 'plants' as const, icon: '\u2618' },
          { label: 'Ailments', count: ailments.length, color: 'celestial', view: 'ailments' as const, icon: '\u2695' },
          { label: 'Zodiac Signs', count: signs.length, color: 'gold', view: 'astrology' as const, icon: '\u2609' },
          { label: 'Cross-Ref', count: null, color: 'botanical', view: 'crossref' as const, icon: '\u29D6' }
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(viewToPath[stat.view])}
            className="card text-center cursor-pointer group"
          >
            <div className="text-xl mb-2 opacity-40 group-hover:opacity-70 transition-opacity duration-200">{stat.icon}</div>
            <div className={`stat-number ${
              stat.color === 'botanical' ? 'text-botanical-400' :
              stat.color === 'celestial' ? 'text-celestial-400' :
              'text-gold-400'
            }`}>
              {stat.count !== null ? stat.count : '\u29D6'}
            </div>
            <div className="text-[10px] text-earth-500 mt-1.5 tracking-[0.1em] uppercase">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* HMBS Domains */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Sanctuary Domains</h2>
          <Button.Ghost route="/hmbs" className="text-xs">
            Explore all {'\u2192'}
          </Button.Ghost>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { domain: 'Heart', icon: '\u2661', color: 'heart', textColor: 'text-rose-300', desc: 'Love, connection, empathy' },
            { domain: 'Mind', icon: '\u2609', color: 'mind', textColor: 'text-blue-300', desc: 'Clarity, focus, cognition' },
            { domain: 'Body', icon: '\u2618', color: 'body', textColor: 'text-green-300', desc: 'Vitality, strength, healing' },
            { domain: 'Spirit', icon: '\u2726', color: 'spirit', textColor: 'text-purple-300', desc: 'Transcendence, intuition' }
          ].map((d) => (
            <button
              key={d.domain}
              onClick={() => navigate('/hmbs')}
              className={`hmbs-${d.color} hmbs-card`}
            >
              <div className="text-2xl mb-2 opacity-50">{d.icon}</div>
              <div className={`text-sm font-display font-semibold ${d.textColor}`}>
                {d.domain}
              </div>
              <p className="text-[10px] text-earth-500 mt-1 leading-relaxed">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Plant + Feature Cards — Bento layout */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Featured Plant — spans 2 cols */}
        {featuredPlant && (
          <button
            onClick={() => navigate(`/plants/${featuredPlant.id}`)}
            className="col-span-2 card-glow-botanical text-left cursor-pointer group"
          >
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 animate-float"
                   style={{
                     background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.1), rgba(93, 168, 126, 0.02))',
                     border: '1px solid rgba(93, 168, 126, 0.1)'
                   }}>
                {'\u2618'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-earth-500 uppercase tracking-[0.2em] mb-1">Plant of the Day</div>
                <h3 className="text-lg font-display font-semibold text-botanical-400 group-hover:text-botanical-300 transition-colors">
                  {featuredPlant.common_name}
                </h3>
                <p className="text-xs text-earth-500 italic mb-2">{featuredPlant.latin_name}</p>
                <p className="text-earth-300 text-sm leading-relaxed line-clamp-2">{featuredPlant.description}</p>
              </div>
            </div>
          </button>
        )}
        {!featuredPlant && <div className="col-span-2" />}

        {/* Quick action */}
        <button
          onClick={() => navigate('/crossref')}
          className="card-glow-celestial text-left cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="text-xl mb-2 opacity-40 group-hover:opacity-70 transition-opacity">{'\u29D6'}</div>
            <div className="text-sm font-display font-medium text-celestial-400 group-hover:text-celestial-300 transition-colors">
              Cross-Reference
            </div>
            <p className="text-[10px] text-earth-500 mt-1.5 leading-relaxed">Multi-axis query builder across all dimensions</p>
          </div>
          <div className="text-[10px] text-celestial-500/50 mt-3 flex items-center gap-1 group-hover:text-celestial-400/70 transition-colors">
            Open engine {'\u2192'}
          </div>
        </button>
      </div>

      {/* Feature Cards — Celestial */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { view: 'natal-chart' as const, icon: '\u2B50', title: 'Astro-Botanical Chart', desc: 'Personalized plant map from your birth chart' },
          { view: 'planetary-timing' as const, icon: '\u231A', title: 'Planetary Timing', desc: 'Optimal hours for harvesting and preparation' },
          { view: 'entheogenic' as const, icon: '\u2604', title: 'Entheogenic Guide', desc: 'Sacred plant medicine protocols and integration' }
        ].map((feature) => (
          <LinkCard.Celestial
            key={feature.view}
            to={viewToPath[feature.view]}
            icon={feature.icon}
            title={feature.title}
            caption={feature.desc}
          />
        ))}
      </div>

      {/* Wellness Goals Card */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/wellness')}
          className="w-full text-left cursor-pointer group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-out-expo"
          style={{
            background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.05) 0%, rgba(16, 15, 12, 0.85) 40%, rgba(61, 138, 94, 0.03) 100%)',
            border: '1px solid rgba(93, 168, 126, 0.08)',
            boxShadow: 'inset 0 1px 0 0 rgba(93, 168, 126, 0.04), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(93, 168, 126, 0.15)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(93, 168, 126, 0.08)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
               style={{ background: 'rgba(93, 168, 126, 0.04)', filter: 'blur(60px)' }} />
          <div className="relative flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                 style={{
                   background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.1), rgba(93, 168, 126, 0.02))',
                   border: '1px solid rgba(93, 168, 126, 0.1)'
                 }}>
              {'\u2740'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-semibold text-gradient-botanical group-hover:opacity-90 transition-opacity">
                Wellness Goals
              </div>
              <p className="text-[11px] text-earth-400 mt-1 leading-relaxed">
                Explore plants by what you want to improve {'\u2014'} hair growth, immunity, sleep, cognition, and more
              </p>
            </div>
            <div className="text-earth-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {'\u2192'}
            </div>
          </div>
        </button>
      </div>

      {/* Feature Cards — Botanical */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { view: 'seasonal' as const, icon: '\u2741', title: 'Seasonal Guide', desc: 'Plants aligned with the current season' },
          { view: 'doctrine' as const, icon: '\u2638', title: 'Doctrine Explorer', desc: 'How plant form reveals function' },
          { view: 'preparations' as const, icon: '\u2697', title: 'Preparations', desc: 'Methods for herbal extraction' },
          { view: 'body-systems' as const, icon: '\u2B22', title: 'Body Systems', desc: 'Organs & systems mapped to plants and planets' }
        ].map((feature) => (
          <LinkCard.Botanical
            key={feature.view}
            to={viewToPath[feature.view]}
            icon={feature.icon}
            title={feature.title}
            caption={feature.desc}
          />
        ))}
      </div>

      {/* Plant Journal Card */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/journal')}
          className="w-full text-left cursor-pointer group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-out-expo"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(16, 15, 12, 0.85) 40%, rgba(124, 94, 237, 0.03) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.08)',
            boxShadow: 'inset 0 1px 0 0 rgba(245, 158, 11, 0.04), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.15)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245, 158, 11, 0.08)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
               style={{ background: 'rgba(245, 158, 11, 0.04)', filter: 'blur(60px)' }} />
          <div className="relative flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                 style={{
                   background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))',
                   border: '1px solid rgba(245, 158, 11, 0.1)'
                 }}>
              {'\u270E'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-semibold text-gradient-gold group-hover:opacity-90 transition-opacity">
                Plant Journal
              </div>
              <p className="text-[11px] text-earth-400 mt-1 leading-relaxed">
                Record your plant relationships, reflections, and consciousness exploration with guided prompts
              </p>
            </div>
            <div className="text-earth-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {'\u2192'}
            </div>
          </div>
        </button>
      </div>

      {/* My Collections */}
      {collections.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">My Collections</h2>
            <Button.Ghost route="/collections" className="text-xs">
              View all {'\u2192'}
            </Button.Ghost>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {collections.slice(0, 4).map((col) => (
              <LinkCard.Plain
                key={col.id}
                to={`/collections/${col.id}`}
                icon={col.icon || '\u2618'}
                title={col.name}
                caption={`${col.plant_count} ${col.plant_count === 1 ? 'plant' : 'plants'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Lists */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="section-title">Recent Plants</h3>
          <div className="space-y-1.5">
            {plants.slice(0, 5).map((plant, i) => (
              <button
                key={plant.id}
                onClick={() => navigate(`/plants/${plant.id}`)}
                className="card w-full text-left cursor-pointer py-3 px-4 animate-fade-in-up group"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-earth-200 group-hover:text-botanical-400 transition-colors">{plant.common_name}</span>
                  <span className={`badge badge-${plant.category}`}>{plant.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="section-title">Common Ailments</h3>
          <div className="space-y-1.5">
            {ailments.slice(0, 5).map((ailment, i) => (
              <button
                key={ailment.id}
                onClick={() => navigate(`/ailments/${ailment.id}`)}
                className="card w-full text-left cursor-pointer py-3 px-4 animate-fade-in-up group"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-earth-200 group-hover:text-botanical-400 transition-colors">{ailment.name}</span>
                  <span className={`badge badge-${ailment.category === 'physical' ? 'earth' : ailment.category === 'emotional' ? 'water' : 'air'}`}>
                    {ailment.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
