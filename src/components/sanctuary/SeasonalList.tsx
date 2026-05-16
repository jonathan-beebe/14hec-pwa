import { Link } from 'react-router-dom'
import CatalogLayout from '@/components/design-system/layouts/CatalogLayout'
import Text from '@/components/design-system/atoms/Text'
import { SEASONS, getCurrentSeason } from './seasons'

export default function SeasonalList() {
  const currentSeason = getCurrentSeason()

  return (
    <CatalogLayout
      header={
        <div className="px-4 md:px-8 pt-6 pb-4">
          <Text.PageTitle>Seasonal Guide</Text.PageTitle>
          <p className="text-sm text-earth-500 mt-1">
            Plants aligned with the rhythms of the year
          </p>
        </div>
      }
      results={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 md:px-8 pt-3 pb-8">
          {SEASONS.map((season) => (
            <Link
              key={season.slug}
              to={`/seasonal/${season.slug}`}
              className="card relative text-center block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400 transition-all duration-300 ease-out-expo"
              style={{ background: season.gradient }}
            >
              <div className="text-4xl mb-2 opacity-50" aria-hidden="true">
                {season.icon}
              </div>
              <Text.SectionTitle as="h2" className={season.textColor}>
                {season.name}
              </Text.SectionTitle>
              <div className="text-xs text-earth-500 mt-1">{season.months}</div>
              <div className="mt-2">
                <span className={`badge badge-${season.element.toLowerCase()}`}>
                  {season.element}
                </span>
              </div>
              <p className="text-xs text-earth-400 leading-relaxed mt-3 line-clamp-3">
                {season.description}
              </p>
              {season.slug === currentSeason && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-botanical-400 animate-pulse-glow" />
                </div>
              )}
            </Link>
          ))}
        </div>
      }
      itemCount={4}
    />
  )
}
