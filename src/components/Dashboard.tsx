import { useState, useEffect, useMemo } from 'react'
import { api } from '@/data/api'
import { recentPlantsStore } from '@/data/recent-plants-store'
import { routes } from '@/routes'
import type { Plant, Ailment, ZodiacSign, Collection } from '../types'
import DashboardHeader from '@/components/DashboardHeader'
import { Icon, glyphIcon } from '@/components/design-system/atoms/Icon'
import type { InfoTileTone } from '@/components/design-system/components/InfoTile'
import Type from '@/components/design-system/atoms/Type'
import InfoTile from '@/components/design-system/components/InfoTile'
import { List, ListItem } from '@/components/design-system/components/List'
import type { ListItemViewModel } from '@/components/design-system/components/List'
import Badge from '@/components/design-system/atoms/Badge'
import PlanetTile from '@/components/design-system/components/PlanetTile'
import { DashboardSection } from '@/components/design-system/layouts/DashboardSection'
import { neptune } from '@/components/design-system/components/planet/planetConfig'

interface PlantListItem extends ListItemViewModel {
  name: string
  category: 'conventional' | 'entheogenic' | 'both'
}

function toPlantListItem(plant: Plant): PlantListItem {
  return { id: plant.id, to: `/plants/${plant.id}`, name: plant.common_name, category: plant.category }
}

function PlantListItemRow(item: PlantListItem) {
  return (
    <ListItem to={item.to} trailing={<Badge variant={item.category}>{item.category}</Badge>}>
      {item.name}
    </ListItem>
  )
}

const ailmentBadgeVariant = {
  physical: 'earth',
  emotional: 'water',
  spiritual: 'air',
} as const

interface AilmentListItem extends ListItemViewModel {
  name: string
  category: 'physical' | 'emotional' | 'spiritual'
}

function toAilmentListItem(ailment: Ailment): AilmentListItem {
  return { id: ailment.id, to: `/ailments/${ailment.id}`, name: ailment.name, category: ailment.category }
}

function AilmentListItemRow(item: AilmentListItem) {
  return (
    <ListItem to={item.to} trailing={<Badge variant={ailmentBadgeVariant[item.category]}>{item.category}</Badge>}>
      {item.name}
    </ListItem>
  )
}

export default function Dashboard() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [ailments, setAilments] = useState<Ailment[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [recentPlants, setRecentPlants] = useState<Plant[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getPlants().then(setPlants)
    api.getAilments().then(setAilments)
    api.getZodiacSigns().then(setSigns)
    api.getCollections().then(setCollections).catch(() => {})

    const recentIds = recentPlantsStore.getRecentPlantIds()
    if (recentIds.length > 0) {
      Promise.all(recentIds.map(id => api.getPlantById(id)))
        .then(results => {
          const valid = results.filter(p => p != null) as Plant[]
          setRecentPlants(valid)
        })
    }
  }, [])

  const filteredPlants = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return plants.filter(
      (p) =>
        p.common_name.toLowerCase().includes(q) ||
        p.latin_name.toLowerCase().includes(q)
    )
  }, [search, plants])

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
      <DashboardSection columns={3}>
        <InfoTile.Botanical to={routes.plants} icon={<Icon.Shamrock />} sandIcon={Icon.Shamrock.source} primary={plants.length} secondary="Plants" />
        <InfoTile.Celestial to={routes.ailments} icon={<Icon.Aesculapius />} sandIcon={Icon.Aesculapius.source} primary={ailments.length} secondary="Ailments" />
        <InfoTile.Gold to={routes.astrology} icon={<Icon.Sun />} sandIcon={Icon.Sun.source} primary={signs.length} secondary="Zodiac Signs" />
      </DashboardSection>

      {/* HMBS Domains */}
      <DashboardSection title="Sanctuary Domains">
        <InfoTile.Heart to="/hmbs" icon={<Icon.Heart />} sandIcon={Icon.Heart.source} primary="Heart" secondary="Love, connection, empathy" />
        <InfoTile.Mind to="/hmbs" icon={<Icon.Atom />} sandIcon={Icon.Atom.source} primary="Mind" secondary="Clarity, focus, cognition" />
        <InfoTile.Body to="/hmbs" icon={<Icon.Shamrock />} sandIcon={Icon.Shamrock.source} primary="Body" secondary="Vitality, strength, healing" />
        <InfoTile.Spirit to="/hmbs" icon={<Icon.Lotus />} sandIcon={Icon.Lotus.source} primary="Spirit" secondary="Transcendence, intuition" />
      </DashboardSection>

      {/* Featured Plant + Cross-Reference */}
      <DashboardSection columns={3}>
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
          to={routes.crossref}
          icon={<Icon.Hourglass />}
          sandIcon={Icon.Hourglass.source}
          primary="Cross-Reference"
          secondary="Multi-axis query engine"
        />
      </DashboardSection>

      {/* Astrology */}
      <DashboardSection title="Astrology">
        <InfoTile.Celestial to={routes['natal-chart']} icon={<Icon.Star />} sandIcon={Icon.Star.source} primary="Astro-Botanical Chart" secondary="Personalized plant map from your birth chart" />
        <InfoTile.Celestial to={routes['planetary-timing']} icon={<Icon.Watch />} sandIcon={Icon.Watch.source} tintHex="#c4b5fd" primary="Planetary Timing" secondary="Optimal hours for harvesting and preparation" />
        <PlanetTile to="/astrology/planets" config={neptune} primary="Planets" secondary="Celestial bodies and their plant correspondences" />
        <InfoTile.Celestial to={routes.astrology} icon={<Icon.Sun />} sandIcon={Icon.Sun.source} primary="Signs" secondary="Zodiac signs and their plant correspondences" />
      </DashboardSection>

      {/* Wellness */}
      <DashboardSection title="Wellness" columns={3}>
        <InfoTile.Botanical to={routes.wellness} icon={<Icon.Florette />} sandIcon={Icon.Florette.source} primary="Wellness Goals" secondary="Explore plants by what you want to improve — hair growth, immunity, sleep, cognition, and more" className="sm:col-span-2" />
        <InfoTile.Celestial to={routes.entheogenic} icon={<Icon.Comet />} sandIcon={Icon.Comet.source} primary="Entheogenic Guide" secondary="Sacred plant medicine protocols" />
      </DashboardSection>

      {/* Botanical */}
      <DashboardSection>
        <InfoTile.Botanical to={routes.seasonal} icon={<Icon.FloretteOutlined />} sandIcon={Icon.FloretteOutlined.source} primary="Seasonal Guide" secondary="Plants aligned with the current season" />
        <InfoTile.Botanical to={routes.doctrine} icon={<Icon.DharmaWheel />} sandIcon={Icon.DharmaWheel.source} primary="Doctrine Explorer" secondary="How plant form reveals function" />
        <InfoTile.Botanical to={routes.preparations} icon={<Icon.Alembic />} sandIcon={Icon.Alembic.source} primary="Preparations" secondary="Methods for herbal extraction" />
        <InfoTile.Botanical to={routes['body-systems']} icon={<Icon.Hexagon />} sandIcon={Icon.Hexagon.source} primary="Body Systems" secondary="Organs & systems mapped to plants and planets" />
      </DashboardSection>

      {/* Journal */}
      <DashboardSection title="Journal">
        <InfoTile.Gold to={routes.journal} icon={<Icon.Pencil />} sandIcon={Icon.Pencil.source} primary="Plant Journal" secondary="Record your plant relationships, reflections, and consciousness exploration with guided prompts" />
      </DashboardSection>

      {/* My Collections */}
      {collections.length > 0 && (
        <DashboardSection title="My Collections" columns={3}>
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
        </DashboardSection>
      )}

      {/* Quick Access Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Type.Subheading className="mb-3">
            {recentPlants.length > 0 ? 'Recent Plants' : 'Featured Plants'}
          </Type.Subheading>
          <List
            items={(recentPlants.length > 0 ? recentPlants.slice(0, 5) : plants.slice(0, 5)).map(toPlantListItem)}
            renderItem={PlantListItemRow}
          />
        </div>
        <div>
          <Type.Subheading className="mb-3">Common Ailments</Type.Subheading>
          <List
            items={ailments.slice(0, 5).map(toAilmentListItem)}
            renderItem={AilmentListItemRow}
          />
        </div>
      </div>
    </div>
  )
}
