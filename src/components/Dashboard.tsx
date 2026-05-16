import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, Ailment, ZodiacSign, Collection } from '../types'
import DashboardHeader from '@/components/DashboardHeader'
import { Icon, glyphIcon } from '@/components/design-system/atoms/Icon'
import type { InfoTileTone } from '@/components/design-system/components/InfoTile'
import Type from '@/components/design-system/atoms/Type'
import InfoTile from '@/components/design-system/components/InfoTile'
import PlanetTile from '@/components/design-system/components/PlanetTile'
import { neptune } from '@/components/spike/planetConfig'

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

      {/* Astrology */}
      <div className="mb-8">
        <Type.Subheading className="mb-3">Astrology</Type.Subheading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoTile.Celestial to={viewToPath['natal-chart']} icon={<Icon.Star />} sandIcon={Icon.Star.source} primary="Astro-Botanical Chart" secondary="Personalized plant map from your birth chart" />
          <InfoTile.Celestial to={viewToPath['planetary-timing']} icon={<Icon.Watch />} sandIcon={Icon.Watch.source} tintHex="#c4b5fd" primary="Planetary Timing" secondary="Optimal hours for harvesting and preparation" />
          <PlanetTile to="/astrology/planets" config={neptune} primary="Planets" secondary="Celestial bodies and their plant correspondences" />
          <InfoTile.Celestial to={viewToPath.astrology} icon={<Icon.Sun />} sandIcon={Icon.Sun.source} primary="Signs" secondary="Zodiac signs and their plant correspondences" />
        </div>
      </div>

      {/* Wellness */}
      <div className="mb-8">
        <Type.Subheading className="mb-3">Wellness</Type.Subheading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoTile.Botanical to={viewToPath.wellness} icon={<Icon.Florette />} sandIcon={Icon.Florette.source} primary="Wellness Goals" secondary="Explore plants by what you want to improve — hair growth, immunity, sleep, cognition, and more" className="sm:col-span-2" />
          <InfoTile.Celestial to={viewToPath.entheogenic} icon={<Icon.Comet />} sandIcon={Icon.Comet.source} primary="Entheogenic Guide" secondary="Sacred plant medicine protocols" />
        </div>
      </div>

      {/* Botanical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <InfoTile.Botanical to={viewToPath.seasonal} icon={<Icon.FloretteOutlined />} sandIcon={Icon.FloretteOutlined.source} primary="Seasonal Guide" secondary="Plants aligned with the current season" />
        <InfoTile.Botanical to={viewToPath.doctrine} icon={<Icon.DharmaWheel />} sandIcon={Icon.DharmaWheel.source} primary="Doctrine Explorer" secondary="How plant form reveals function" />
        <InfoTile.Botanical to={viewToPath.preparations} icon={<Icon.Alembic />} sandIcon={Icon.Alembic.source} primary="Preparations" secondary="Methods for herbal extraction" />
        <InfoTile.Botanical to={viewToPath['body-systems']} icon={<Icon.Hexagon />} sandIcon={Icon.Hexagon.source} primary="Body Systems" secondary="Organs & systems mapped to plants and planets" />
      </div>

      {/* Journal */}
      <div className="mb-8">
        <Type.Subheading className="mb-3">Journal</Type.Subheading>
        <InfoTile.Gold to={viewToPath.journal} icon={<Icon.Pencil />} sandIcon={Icon.Pencil.source} primary="Plant Journal" secondary="Record your plant relationships, reflections, and consciousness exploration with guided prompts" />
      </div>

      {/* My Collections */}
      {collections.length > 0 && (
        <div className="mb-8">
          <Type.Subheading className="mb-3">My Collections</Type.Subheading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {collections.map((col) => {
              const ColIcon = glyphIcon('collection', col.icon || '\u2618')
              return (
                <InfoTile
                  key={col.id}
                  to={`/collections/${col.id}`}
                  tone={col.color as InfoTileTone}
                  icon={<ColIcon />}
                  sandIcon={ColIcon.source}
                  primary={col.name}
                  secondary={col.description || `${col.plant_count} ${col.plant_count === 1 ? 'plant' : 'plants'}`}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Access Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Type.Subheading className="mb-3">Recent Plants</Type.Subheading>
          <div className="space-y-1">
            {plants.slice(0, 5).map((plant) => (
              <button
                key={plant.id}
                onClick={() => navigate(`/plants/${plant.id}`)}
                className="w-full text-left cursor-pointer py-2 pr-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-earth-100 group-hover:text-botanical-400 transition-colors">{plant.common_name}</span>
                  <span className={`badge badge-${plant.category}`}>{plant.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Type.Subheading className="mb-3">Common Ailments</Type.Subheading>
          <div className="space-y-1">
            {ailments.slice(0, 5).map((ailment) => (
              <button
                key={ailment.id}
                onClick={() => navigate(`/ailments/${ailment.id}`)}
                className="w-full text-left cursor-pointer py-2 pr-3 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-earth-100 group-hover:text-botanical-400 transition-colors">{ailment.name}</span>
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
