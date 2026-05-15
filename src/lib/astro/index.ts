export { CHALDEAN_ORDER, DAY_RULERS, getDayRuler } from './chaldean'
export { getSunTimes, getNextSunrise } from './sun-times'
export { computePlanetaryHours, findCurrentHour } from './planetary-hours'
export type {
  SunTimes,
  SunTimesResult,
  PlanetaryHour,
  PlanetaryTiming,
  PolarCondition,
  GeoLocation,
} from './types'

import { getDayRuler } from './chaldean'
import { getSunTimes, getNextSunrise } from './sun-times'
import { computePlanetaryHours, findCurrentHour } from './planetary-hours'
import type { PlanetaryTiming } from './types'

export function getPlanetaryTiming(
  now: Date,
  latitude: number,
  longitude: number,
): PlanetaryTiming | null {
  const sunResult = getSunTimes(now, latitude, longitude)
  if (sunResult.kind === 'polar') return null

  const { sunrise, sunset } = sunResult
  const nextSunrise = getNextSunrise(sunset, latitude, longitude)
  if (!nextSunrise) return null

  const dayOfWeek = sunrise.getUTCDay()
  const hours = computePlanetaryHours(sunrise, sunset, nextSunrise, dayOfWeek)

  return {
    dayRuler: getDayRuler(sunrise),
    sunTimes: { sunrise, sunset },
    hours,
    currentHour: findCurrentHour(now, hours),
  }
}
