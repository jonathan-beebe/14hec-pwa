import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, Ailment, ZodiacSign, Collection } from '../types'
import DashboardHeader from '@/components/DashboardHeader'
import { Icon } from '@/components/design-system/atoms/Icon'
import Type from '@/components/design-system/atoms/Type'
import Button from '@/components/design-system/atoms/Button'
import LinkCard from '@/components/design-system/components/LinkCard'
import InfoTile from '@/components/design-system/components/InfoTile'
import Text from '@/components/design-system/atoms/Text'

const viewToPath: Record<string, string> = {
  dashboard: '/',
  plants: '/plants',
  ailments: '/ailments',
  wellness: '/wellness',
  preparations: '/preparations',
  entheogenic: '/entheogens',
  'body-systems': '/body-systems',
  astrology: '/astrology/signs',
  'natal-chart': '/astrology/natal-chart',
  'planetary-timing': '/astrology/planetary-timing',
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
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        filteredPlants={filteredPlants}
      />

      {/* Bento Grid — Stats + HMBS combined */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <InfoTile.Botanical to={viewToPath.plants} icon={<Icon.Shamrock />} sandIcon={Icon.Shamrock.source} primary={plants.length} secondary="Plants" />
        <InfoTile.Celestial to={viewToPath.ailments} icon={<Icon.Aesculapius />} sandIcon={Icon.Aesculapius.source} primary={ailments.length} secondary="Ailments" />
        <InfoTile.Gold to={viewToPath.astrology} icon={<Icon.Sun />} sandIcon={Icon.Sun.source} primary={signs.length} secondary="Zodiac Signs" />
      </div>

      {/* HMBS Domains */}
      <div className="mb-8">
        <Type.Subheading className="mb-3">Sanctuary Domains</Type.Subheading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoTile.Heart to="/hmbs" icon={<Icon.Heart />} sandIcon={Icon.Heart.source} primary="Heart" secondary="Love, connection, empathy" />
          <InfoTile.Mind to="/hmbs" icon={<Icon.Atom />} sandIcon={Icon.Atom.source} primary="Mind" secondary="Clarity, focus, cognition" />
          <InfoTile.Body to="/hmbs" icon={<Icon.Shamrock />} sandIcon={Icon.Shamrock.source} primary="Body" secondary="Vitality, strength, healing" />
          <InfoTile.Spirit to="/hmbs" icon={<Icon.Lotus />} sandIcon={Icon.Lotus.source} primary="Spirit" secondary="Transcendence, intuition" />
        </div>
      </div>

      {/* Featured Plant + Cross-Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {featuredPlant ? (
          <InfoTile.Botanical
            to={`/plants/${featuredPlant.id}`}
            icon={<Icon.PalmBranch />}
            sandIcon={Icon.PalmBranch.source}
            primary={featuredPlant.common_name}
            className="sm:col-span-2"
          >
            <Type.SectionLabel>Plant of the Day</Type.SectionLabel>
            <Type.Heading as="div" className="text-botanical-300 mt-1">
              {featuredPlant.common_name}
            </Type.Heading>
            <Type.Caption as="p" className="italic mt-0.5">{featuredPlant.latin_name}</Type.Caption>
            <Type.BodySmall as="p" className="mt-1.5 line-clamp-2">{featuredPlant.description}</Type.BodySmall>
          </InfoTile.Botanical>
        ) : (
          <div className="sm:col-span-2" />
        )}
        <InfoTile.Gold
          to={viewToPath.crossref}
          icon={<Icon.Hourglass />}
          sandIcon={Icon.Hourglass.source}
          primary="Cross-Reference"
          secondary="Multi-axis query engine"
        />
      </div>

      {/* Feature Cards — Celestial */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
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
            <Text.SectionTitle className="mb-0">My Collections</Text.SectionTitle>
            <Button.Ghost route="/collections" className="text-xs">
              View all {'\u2192'}
            </Button.Ghost>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Text.SectionTitle as="h3">Recent Plants</Text.SectionTitle>
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
          <Text.SectionTitle as="h3">Common Ailments</Text.SectionTitle>
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
