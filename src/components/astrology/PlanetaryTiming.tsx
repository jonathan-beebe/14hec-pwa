import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Text from '@/components/design-system/atoms/Text'
import Notice from '@/components/design-system/components/Notice'
import { getPlanetaryTiming } from '@/lib/astro'
import type { PlanetaryHour } from '@/lib/astro'
import { useGeolocation } from '@/hooks/useGeolocation'

const DEFAULT_COORDS = { latitude: 40.7128, longitude: -74.006 }
const DEFAULT_LABEL = 'New York'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatCoord(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value).toFixed(2)
  return `${abs}°${value >= 0 ? pos : neg}`
}

function getOptimalActivities(planetName: string): string[] {
  const activities: Record<string, string[]> = {
    Sun: ['Harvesting solar herbs (rosemary, St. John\'s Wort)', 'Preparing vitalizing tonics', 'Setting intentions for healing'],
    Moon: ['Harvesting lunar herbs (mugwort, jasmine)', 'Making flower essences', 'Dream work preparations', 'Planting by moonlight'],
    Mercury: ['Studying herbal properties', 'Blending tinctures', 'Communication about healing', 'Preparing nervine herbs'],
    Venus: ['Harvesting flowers for beauty preparations', 'Making rose water', 'Preparing love and harmony elixirs'],
    Mars: ['Harvesting roots and protective herbs', 'Making stimulating preparations', 'Physical cleansing rituals'],
    Jupiter: ['Expanding herbal knowledge', 'Making liver tonics', 'Generous giving of medicine', 'Planting for abundance'],
    Saturn: ['Harvesting bark and structural herbs', 'Making long-term tinctures', 'Bone and joint preparations', 'Grounding practices']
  }
  return activities[planetName] || []
}

const planetSymbols: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄'
}

const planetGradients: Record<string, string> = {
  Sun: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 15, 12, 0.85))',
  Moon: 'linear-gradient(135deg, rgba(147, 197, 253, 0.08), rgba(16, 15, 12, 0.85))',
  Mercury: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(16, 15, 12, 0.85))',
  Venus: 'linear-gradient(135deg, rgba(244, 114, 182, 0.08), rgba(16, 15, 12, 0.85))',
  Mars: 'linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(16, 15, 12, 0.85))',
  Jupiter: 'linear-gradient(135deg, rgba(196, 181, 253, 0.08), rgba(16, 15, 12, 0.85))',
  Saturn: 'linear-gradient(135deg, rgba(156, 163, 175, 0.08), rgba(16, 15, 12, 0.85))'
}

const planetTextColors: Record<string, string> = {
  Sun: 'text-amber-400',
  Moon: 'text-blue-300',
  Mercury: 'text-emerald-400',
  Venus: 'text-pink-300',
  Mars: 'text-red-400',
  Jupiter: 'text-purple-300',
  Saturn: 'text-gray-300'
}

const planetRingColors: Record<string, string> = {
  Sun: 'rgba(245, 158, 11, 0.25)',
  Moon: 'rgba(147, 197, 253, 0.25)',
  Mercury: 'rgba(52, 211, 153, 0.25)',
  Venus: 'rgba(244, 114, 182, 0.25)',
  Mars: 'rgba(248, 113, 113, 0.25)',
  Jupiter: 'rgba(196, 181, 253, 0.25)',
  Saturn: 'rgba(156, 163, 175, 0.25)'
}

const planetBgColors: Record<string, string> = {
  Sun: 'rgba(245, 158, 11, 0.08)',
  Moon: 'rgba(147, 197, 253, 0.08)',
  Mercury: 'rgba(52, 211, 153, 0.08)',
  Venus: 'rgba(244, 114, 182, 0.08)',
  Mars: 'rgba(248, 113, 113, 0.08)',
  Jupiter: 'rgba(196, 181, 253, 0.08)',
  Saturn: 'rgba(156, 163, 175, 0.08)'
}

function HourCell({
  hour,
  isCurrent,
}: {
  hour: PlanetaryHour
  isCurrent: boolean
}) {
  return (
    <Link
      to={`/astrology/planetary-timing/${hour.planet.toLowerCase()}`}
      aria-label={`${hour.planet} hour starting ${formatTime(hour.startTime)} — view aligned plants`}
      className={`block p-2.5 rounded-xl text-center transition-all duration-200 ease-out-expo ${planetTextColors[hour.planet]}`}
      style={{
        background: isCurrent ? planetBgColors[hour.planet] : 'rgba(36, 34, 30, 0.4)',
        border: isCurrent ? `1px solid ${planetRingColors[hour.planet]}` : '1px solid rgba(255, 255, 255, 0.05)',
        opacity: isCurrent ? 1 : 0.55,
        boxShadow: isCurrent ? `0 0 20px -4px ${planetRingColors[hour.planet]}` : 'none'
      }}
      onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
      onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.55' }}
    >
      <div className="text-lg" aria-hidden="true">{planetSymbols[hour.planet]}</div>
      <div className="text-[10px] text-earth-400 mt-0.5">
        {formatTime(hour.startTime)}
      </div>
      <div className="text-[10px] font-medium">{hour.planet}</div>
    </Link>
  )
}

export default function PlanetaryTiming() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { geo, requestLocation } = useGeolocation()

  const coords = geo.status === 'resolved'
    ? { latitude: geo.latitude, longitude: geo.longitude }
    : DEFAULT_COORDS

  const timing = useMemo(
    () => getPlanetaryTiming(currentTime, coords.latitude, coords.longitude),
    [currentTime, coords.latitude, coords.longitude]
  )

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const isCurrentHour = (h: PlanetaryHour) =>
    timing?.currentHour !== null &&
    timing?.currentHour !== undefined &&
    h.startTime.getTime() === timing.currentHour.startTime.getTime()

  const locationLabel = geo.status === 'resolved'
    ? `${formatCoord(geo.latitude, 'N', 'S')}, ${formatCoord(geo.longitude, 'E', 'W')}`
    : DEFAULT_LABEL

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-5">
        <Text.PageTitle>Planetary Timing</Text.PageTitle>
        <p className="text-xs text-earth-500 mt-0.5">
          Optimal times for harvesting, preparing, and taking plant medicines
        </p>
      </div>

      {/* Location status */}
      <div className="mb-4">
        {geo.status === 'idle' && (
          <div className="flex items-center gap-3 text-xs text-earth-500">
            <span>Using default location ({DEFAULT_LABEL})</span>
            <button
              onClick={requestLocation}
              className="text-celestial-400 hover:text-celestial-300 transition-colors duration-200"
            >
              Use my location
            </button>
          </div>
        )}
        {geo.status === 'requesting' && (
          <div className="text-xs text-earth-500 animate-pulse">
            Requesting location...
          </div>
        )}
        {geo.status === 'resolved' && (
          <div className="text-xs text-earth-500">
            Location: {locationLabel}
          </div>
        )}
        {geo.status === 'denied' && (
          <Notice tone="info">
            Location access denied. Using default location ({DEFAULT_LABEL}).
          </Notice>
        )}
        {geo.status === 'unavailable' && (
          <Notice tone="info">
            Location unavailable. Using default location ({DEFAULT_LABEL}).
          </Notice>
        )}
      </div>

      {/* Polar condition */}
      {!timing && (
        <Notice tone="info" title="Polar Conditions">
          Planetary hours cannot be computed for your location at this time of year.
          During polar day or polar night, the sun does not rise and set in the
          normal pattern needed for traditional temporal hour calculations.
        </Notice>
      )}

      {timing && (
        <>
          {/* Sunrise / Sunset */}
          <div className="flex items-center justify-center gap-6 mb-4 text-sm text-earth-400">
            <span>{'☉'} Sunrise {formatTime(timing.sunTimes.sunrise)}</span>
            <span className="text-earth-600">|</span>
            <span>{'☽'} Sunset {formatTime(timing.sunTimes.sunset)}</span>
          </div>

          {/* Current Moment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {[
              {
                label: 'Day Ruler',
                planet: timing.dayRuler,
                sub: currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                showActivities: true,
              },
              {
                label: 'Current Planetary Hour',
                planet: timing.currentHour?.planet ?? timing.dayRuler,
                sub: timing.currentHour
                  ? `${timing.currentHour.isDay ? 'Day' : 'Night'} hour ${timing.currentHour.hourNumber} — ${formatTime(timing.currentHour.startTime)} to ${formatTime(timing.currentHour.endTime)}`
                  : 'Between planetary days',
                showActivities: false,
              }
            ].map((item) => (
              <div key={item.label} className="card-glow-celestial"
                   style={{ background: planetGradients[item.planet] }}>
                <Text.SectionLabel>{item.label}</Text.SectionLabel>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-4xl animate-pulse-slow" aria-hidden="true">{planetSymbols[item.planet]}</span>
                  <div>
                    <div className="text-xl font-display font-bold text-earth-100">{item.planet}</div>
                    <div className="text-sm text-earth-400">{item.sub}</div>
                  </div>
                </div>
                {item.showActivities && (
                  <div className="mt-3">
                    <div className="text-xs text-earth-500 mb-1.5">Best activities today:</div>
                    <div className="space-y-1">
                      {getOptimalActivities(item.planet).map((act, i) => (
                        <p key={i} className="text-xs text-earth-400">{act}</p>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  to={`/astrology/planetary-timing/${item.planet.toLowerCase()}`}
                  className="mt-3 inline-block text-xs text-botanical-500 hover:text-botanical-400 transition-colors duration-200 ease-out-expo"
                >
                  View aligned plants {'→'}
                </Link>
              </div>
            ))}
          </div>

          {/* Day Hours */}
          <div className="card mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl opacity-50">{'☉'}</span>
              <Text.SectionTitle className="mb-0">Day Hours</Text.SectionTitle>
              <span
                className="text-xs text-earth-500 ml-auto cursor-help border-b border-dotted border-earth-600"
                title="Temporal hours divide the time between sunrise and sunset into 12 equal parts. In summer, day hours are longer than 60 minutes; in winter, shorter."
              >
                ~{Math.round(timing.hours[0].durationMinutes)} min each
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {timing.hours.filter(h => h.isDay).map((h) => (
                <HourCell
                  key={h.startTime.getTime()}
                  hour={h}
                  isCurrent={isCurrentHour(h)}
                />
              ))}
            </div>
          </div>

          {/* Night Hours */}
          <div className="card mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl opacity-50">{'☽'}</span>
              <Text.SectionTitle className="mb-0">Night Hours</Text.SectionTitle>
              <span
                className="text-xs text-earth-500 ml-auto cursor-help border-b border-dotted border-earth-600"
                title="Temporal hours divide the time between sunset and next sunrise into 12 equal parts. In summer, night hours are shorter than 60 minutes; in winter, longer."
              >
                ~{Math.round(timing.hours[12].durationMinutes)} min each
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {timing.hours.filter(h => !h.isDay).map((h) => (
                <HourCell
                  key={h.startTime.getTime()}
                  hour={h}
                  isCurrent={isCurrentHour(h)}
                />
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
