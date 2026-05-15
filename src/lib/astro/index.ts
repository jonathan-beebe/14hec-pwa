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

import { DAY_RULERS } from './chaldean'
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

  const localOffsetMs = (longitude / 15) * 3600000
  const localSunrise = new Date(sunrise.getTime() + localOffsetMs)
  const dayOfWeek = localSunrise.getUTCDay()
  const hours = computePlanetaryHours(sunrise, sunset, nextSunrise, dayOfWeek)

  return {
    dayRuler: DAY_RULERS[dayOfWeek],
    sunTimes: { sunrise, sunset },
    hours,
    currentHour: findCurrentHour(now, hours),
  }
}
