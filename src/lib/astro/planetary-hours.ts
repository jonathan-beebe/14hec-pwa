import { getPlanetForHour } from './chaldean'
import type { PlanetaryHour } from './types'

export function computePlanetaryHours(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  dayOfWeek: number,
): PlanetaryHour[] {
  const dayMs = sunset.getTime() - sunrise.getTime()
  const nightMs = nextSunrise.getTime() - sunset.getTime()
  const dayHourMs = dayMs / 12
  const nightHourMs = nightMs / 12

  const hours: PlanetaryHour[] = []

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12
    const hourMs = isDay ? dayHourMs : nightHourMs
    const base = isDay ? sunrise.getTime() : sunset.getTime()
    const offset = isDay ? i : i - 12

    hours.push({
      planet: getPlanetForHour(i, dayOfWeek),
      hourNumber: offset + 1,
      isDay,
      startTime: new Date(base + offset * hourMs),
      endTime: new Date(base + (offset + 1) * hourMs),
      durationMinutes: hourMs / 60000,
    })
  }

  return hours
}

export function findCurrentHour(now: Date, hours: PlanetaryHour[]): PlanetaryHour | null {
  const ts = now.getTime()
  return hours.find(h => ts >= h.startTime.getTime() && ts < h.endTime.getTime()) ?? null
}
