import { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { api } from '@/data/api'
import type { Plant, ZodiacSign } from '../../types'
import Text from '@/components/design-system/atoms/Text'
import { SEASONS, getCurrentSeason, getSeasonBySlug } from './seasons'
import { usePageMeta } from '@/components/layout/MobileTopBar'

export default function SeasonalDetail() {
  const { season: seasonSlug } = useParams<{ season: string }>()
  const navigate = useNavigate()
  const { search } = useLocation()
  usePageMeta({ back: `/seasonal${search}` })
  const season = seasonSlug ? getSeasonBySlug(seasonSlug) : undefined

  const [plants, setPlants] = useState<Plant[]>([])
  const [signs, setSigns] = useState<ZodiacSign[]>([])

  useEffect(() => {
    api.getPlants().then(setPlants)
    api.getZodiacSigns().then(setSigns)
  }, [])

  if (!season) {
    return <Navigate to="/seasonal" replace />
  }

  const findPlantByName = (name: string) => plants.find((p) => p.common_name === name)
  const currentSeason = getCurrentSeason()

  return (
    <div className="animate-fade-in">
      {/* Season selector — desktop only (preserves the tabbed layout on large screens) */}
      <div className="hidden md:block mb-6">
        <Text.PageTitle>Seasonal Guide</Text.PageTitle>
        <p className="text-sm text-earth-500 mt-1">
          Plants aligned with the rhythms of the year
        </p>
      </div>
      <div className="hidden md:grid grid-cols-4 gap-3 mb-8">
        {SEASONS.map((s) => (
          <Link
            key={s.slug}
            to={`/seasonal/${s.slug}`}
            aria-current={season.slug === s.slug ? 'page' : undefined}
            className={`card relative text-center block transition-all duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400 ${
              season.slug === s.slug ? 'ring-1 ring-inset ring-white/10' : ''
            }`}
            style={{
              background:
                season.slug === s.slug
                  ? s.gradient
                  : 'rgba(26, 25, 21, 0.65)',
              boxShadow:
                season.slug === s.slug
                  ? '0 0 30px rgba(255,255,255,0.03)'
                  : undefined,
            }}
          >
            <div className="text-2xl mb-1" aria-hidden="true">
              {s.icon}
            </div>
            <div
              className={`text-sm font-display font-medium ${
                season.slug === s.slug ? s.textColor : 'text-earth-400'
              }`}
            >
              {s.name}
            </div>
            <div className="text-[10px] text-earth-600 mt-0.5">{s.months}</div>
            {s.slug === currentSeason && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-botanical-400 animate-pulse-glow" />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Season detail */}
      <div className="space-y-6 mt-4 md:mt-0 animate-fade-in-up">
        {/* Overview */}
        <div className="glass-panel p-6" style={{ background: season.gradient }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl opacity-40">{season.icon}</span>
            <div>
              <Text.Heading className={season.textColor}>
                {season.name}
              </Text.Heading>
              <div className="flex gap-2 mt-1">
                <span className={`badge badge-${season.element.toLowerCase()}`}>
                  {season.element}
                </span>
                <span className="text-xs text-earth-500">{season.months}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-earth-300 leading-relaxed">
            {season.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div
              className="rounded-xl p-3"
              style={{
                background: 'rgba(26, 25, 21, 0.4)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Text.SectionLabel>Active Signs</Text.SectionLabel>
              <div className="flex flex-wrap gap-2">
                {season.signs.map((signName) => {
                  const sign = signs.find((s) => s.name === signName)
                  return sign ? (
                    <span
                      key={signName}
                      className={`badge badge-${sign.element}`}
                    >
                      {sign.symbol} {signName}
                    </span>
                  ) : (
                    <span
                      key={signName}
                      className="badge bg-earth-800/50 text-earth-300 ring-earth-600/20"
                    >
                      {signName}
                    </span>
                  )
                })}
              </div>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background: 'rgba(26, 25, 21, 0.4)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Text.SectionLabel>Body Focus</Text.SectionLabel>
              <p className="text-sm text-earth-300">{season.bodyFocus}</p>
            </div>
          </div>
        </div>

        {/* Themes */}
        <div className="flex flex-wrap gap-3">
          {season.themes.map((theme) => (
            <span
              key={theme}
              className="badge bg-earth-800/40 text-earth-300 ring-earth-600/20 px-3 py-1"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Seasonal Plants */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'☘'}</span>
            <Text.SectionTitle as="h3" className="mb-0">
              {season.name} Plants
            </Text.SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {season.plantFocus.map((name) => {
              const plant = findPlantByName(name)
              return (
                <button
                  key={name}
                  onClick={() => plant && navigate(`/plants/${plant.id}`)}
                  disabled={!plant}
                  className="text-left rounded-xl p-4 transition-all duration-200 ease-out-expo group disabled:opacity-50"
                  style={{
                    background: 'rgba(26, 25, 21, 0.5)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-botanical-400 font-display font-medium group-hover:text-botanical-300 transition-colors">
                    {name}
                  </span>
                  {plant && (
                    <>
                      <span className="text-earth-500 text-xs ml-2 italic">
                        {plant.latin_name}
                      </span>
                      <p className="text-xs text-earth-500 mt-1 line-clamp-1">
                        {plant.energetic_quality}
                      </p>
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
            <span className="text-xl opacity-50">{'⚗'}</span>
            <Text.SectionTitle as="h3" className="mb-0">
              Recommended Preparations
            </Text.SectionTitle>
          </div>
          <div className="flex flex-wrap gap-3">
            {season.preparationFocus.map((prep) => (
              <button
                key={prep}
                onClick={() => navigate('/preparations')}
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
            <span className="text-xl opacity-50">{'❁'}</span>
            <Text.SectionTitle as="h3" className="mb-0">
              Seasonal Activities
            </Text.SectionTitle>
          </div>
          <div className="space-y-2">
            {season.activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: 'rgba(26, 25, 21, 0.4)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-earth-500 font-medium flex-shrink-0"
                  style={{
                    background: 'rgba(26, 25, 21, 0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
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
