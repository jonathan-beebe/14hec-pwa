import { useState, useEffect } from 'react'
import type { Page } from '../../App'
import type { Plant, ZodiacSign } from '../../types'

interface SeasonalGuideProps {
  navigate: (page: Page) => void
}

interface Season {
  name: string
  months: string
  icon: string
  element: string
  color: string
  textColor: string
  gradient: string
  signs: string[]
  description: string
  themes: string[]
  activities: string[]
  plantFocus: string[]
  preparationFocus: string[]
  bodyFocus: string
}

const SEASONS: Season[] = [
  {
    name: 'Spring',
    months: 'March - May',
    icon: '\u2618',
    element: 'Air',
    color: 'green',
    textColor: 'text-green-300',
    gradient: 'linear-gradient(135deg, rgba(61, 138, 94, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Aries', 'Taurus', 'Gemini'],
    description: 'The season of renewal and emergence. Plants are at their most vital as sap rises and new growth appears. This is the optimal time for harvesting aerial parts: young leaves, flowers, and fresh shoots.',
    themes: ['Renewal', 'Purification', 'New beginnings', 'Vitality'],
    activities: ['Harvest spring greens (nettle, dandelion)', 'Plant medicinal garden beds', 'Make fresh flower essences', 'Spring liver cleanse protocols'],
    plantFocus: ['Nettle', 'Dandelion', 'Yarrow', 'Elderflower', 'Chamomile'],
    preparationFocus: ['Flower Essence', 'Infusion', 'Whole Food'],
    bodyFocus: 'Liver, gallbladder, lymphatic system, blood purification'
  },
  {
    name: 'Summer',
    months: 'June - August',
    icon: '\u2609',
    element: 'Fire',
    color: 'amber',
    textColor: 'text-amber-300',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Cancer', 'Leo', 'Virgo'],
    description: 'Peak solar energy. Plants are in full bloom and at maximum potency. The long days favor solar preparations and drying herbs for winter medicine-making. Harvest flowers at noon on sunny days for peak essential oil content.',
    themes: ['Abundance', 'Solar vitality', 'Full expression', 'Harvest'],
    activities: ['Harvest St. John\'s Wort at midsummer', 'Dry herbs for winter stores', 'Make solar-infused oils', 'Prepare sun teas and tinctures'],
    plantFocus: ['St. John\'s Wort', 'Rosemary', 'Lavender', 'Rose', 'Chamomile'],
    preparationFocus: ['Tincture', 'Infusion', 'Flower Essence'],
    bodyFocus: 'Heart, circulatory system, skin, vitality, adrenals'
  },
  {
    name: 'Autumn',
    months: 'September - November',
    icon: '\u2741',
    element: 'Water',
    color: 'orange',
    textColor: 'text-orange-300',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(16, 15, 12, 0.85))',
    signs: ['Libra', 'Scorpio', 'Sagittarius'],
    description: 'The season of harvest and turning inward. Plant energy descends into roots and seeds. This is the prime time for root harvesting (after the aerial parts have died back) and seed collection for planting and medicine.',
    themes: ['Harvest', 'Introspection', 'Release', 'Preparation'],
    activities: ['Harvest roots (ashwagandha, ginger, comfrey)', 'Make decoctions from dried roots', 'Prepare immune-building protocols', 'Collect seeds for next year'],
    plantFocus: ['Ashwagandha', 'Ginger', 'Comfrey', 'Reishi', 'Elderflower'],
    preparationFocus: ['Decoction', 'Tincture', 'Ground/Capsule'],
    bodyFocus: 'Lungs, large intestine, immune system, nervous system'
  },
  {
    name: 'Winter',
    months: 'December - February',
    icon: '\u2744',
    element: 'Earth',
    color: 'blue',
    textColor: 'text-blue-300',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 15, 12, 0.85))',
    signs: ['Capricorn', 'Aquarius', 'Pisces'],
    description: 'The season of stillness and deep rest. Focus on inner work, dream practice, and building reserves. Plants rest too, but dried and preserved medicines carry us through. Spagyric preparations and long-steeping tinctures are winter work.',
    themes: ['Rest', 'Dream work', 'Deep nourishment', 'Inner vision'],
    activities: ['Work with dream herbs (mugwort)', 'Make long-steeping bone broths', 'Practice cold-weather breathwork', 'Tend to spagyric preparations'],
    plantFocus: ['Mugwort', 'Reishi', 'Ashwagandha', 'Sage', 'Cannabis'],
    preparationFocus: ['Spagyric', 'Decoction', 'Smoked'],
    bodyFocus: 'Kidneys, bones, joints, reproductive system, dream body'
  }
]

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
}

export default function SeasonalGuide({ navigate }: SeasonalGuideProps) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [activeSeason, setActiveSeason] = useState<Season>(
    SEASONS.find((s) => s.name === getCurrentSeason()) || SEASONS[0]
  )

  useEffect(() => {
    window.api.getPlants().then(setPlants)
    window.api.getZodiacSigns().then(setSigns)
  }, [])

  const findPlantByName = (name: string) => plants.find((p) => p.common_name === name)
  const currentSeasonName = getCurrentSeason()

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-earth-100 tracking-wide">Seasonal Guide</h1>
        <p className="text-sm text-earth-500 mt-1">Plants aligned with the rhythms of the year</p>
      </div>

      {/* Season Selector */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {SEASONS.map((season) => (
          <button
            key={season.name}
            onClick={() => setActiveSeason(season)}
            className={`card relative text-center transition-all duration-300 ease-out-expo ${
              activeSeason.name === season.name
                ? 'ring-1 ring-inset ring-white/10'
                : ''
            }`}
            style={{
              background: activeSeason.name === season.name
                ? season.gradient
                : 'rgba(26, 25, 21, 0.65)',
              boxShadow: activeSeason.name === season.name ? `0 0 30px rgba(255,255,255,0.03)` : undefined
            }}
          >
            <div className="text-2xl mb-1">{season.icon}</div>
            <div className={`text-sm font-display font-medium ${activeSeason.name === season.name ? season.textColor : 'text-earth-400'}`}>
              {season.name}
            </div>
            <div className="text-[10px] text-earth-600 mt-0.5">{season.months}</div>
            {season.name === currentSeasonName && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-botanical-400 animate-pulse-glow" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Season Detail */}
      <div className="space-y-6 animate-fade-in-up">
        {/* Season Overview */}
        <div className="glass-panel p-6"
             style={{ background: activeSeason.gradient }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl opacity-40">{activeSeason.icon}</span>
            <div>
              <h2 className={`text-2xl font-display font-bold ${activeSeason.textColor}`}>{activeSeason.name}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`badge badge-${activeSeason.element.toLowerCase()}`}>{activeSeason.element}</span>
                <span className="text-xs text-earth-500">{activeSeason.months}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-earth-300 leading-relaxed">{activeSeason.description}</p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl p-3"
                 style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="section-subtitle">Active Signs</div>
              <div className="flex gap-2">
                {activeSeason.signs.map((signName) => {
                  const sign = signs.find((s) => s.name === signName)
                  return sign ? (
                    <span key={signName} className={`badge badge-${sign.element}`}>
                      {sign.symbol} {signName}
                    </span>
                  ) : (
                    <span key={signName} className="badge bg-earth-800/50 text-earth-300 ring-earth-600/20">{signName}</span>
                  )
                })}
              </div>
            </div>
            <div className="rounded-xl p-3"
                 style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="section-subtitle">Body Focus</div>
              <p className="text-sm text-earth-300">{activeSeason.bodyFocus}</p>
            </div>
          </div>
        </div>

        {/* Themes */}
        <div className="flex gap-3">
          {activeSeason.themes.map((theme) => (
            <span key={theme} className="badge bg-earth-800/40 text-earth-300 ring-earth-600/20 px-3 py-1">
              {theme}
            </span>
          ))}
        </div>

        {/* Seasonal Plants */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2618'}</span>
            <h3 className="section-title mb-0">{activeSeason.name} Plants</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSeason.plantFocus.map((name) => {
              const plant = findPlantByName(name)
              return (
                <button
                  key={name}
                  onClick={() => plant && navigate({ view: 'plant-detail', id: plant.id })}
                  disabled={!plant}
                  className="text-left rounded-xl p-4 transition-all duration-200 ease-out-expo group disabled:opacity-50"
                  style={{ background: 'rgba(26, 25, 21, 0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="text-botanical-400 font-display font-medium group-hover:text-botanical-300 transition-colors">{name}</span>
                  {plant && (
                    <>
                      <span className="text-earth-500 text-xs ml-2 italic">{plant.latin_name}</span>
                      <p className="text-xs text-earth-500 mt-1 line-clamp-1">{plant.energetic_quality}</p>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Preparation Focus */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2697'}</span>
            <h3 className="section-title mb-0">Recommended Preparations</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeSeason.preparationFocus.map((prep) => (
              <button
                key={prep}
                onClick={() => navigate({ view: 'preparations' })}
                className="badge bg-botanical-900/20 text-botanical-300 ring-botanical-500/20 px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {prep}
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Activities */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2741'}</span>
            <h3 className="section-title mb-0">Seasonal Activities</h3>
          </div>
          <div className="space-y-2">
            {activeSeason.activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                   style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-earth-500 font-medium flex-shrink-0"
                     style={{ background: 'rgba(26, 25, 21, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {i + 1}
                </div>
                <span className="text-sm text-earth-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
