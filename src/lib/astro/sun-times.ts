import { Body, Observer, SearchRiseSet, MakeTime, Horizon, Equator } from 'astronomy-engine'
import type { SunTimesResult } from './types'

function isSunAboveHorizon(date: Date, observer: Observer): boolean {
  const astroTime = MakeTime(date)
  const equator = Equator(Body.Sun, astroTime, observer, true, true)
  const horizon = Horizon(astroTime, observer, equator.ra, equator.dec, 'normal')
  return horizon.altitude > 0
}

export function getSunTimes(date: Date, latitude: number, longitude: number): SunTimesResult {
  const observer = new Observer(latitude, longitude, 0)

  // Find the most recent sunrise before `date` by searching forward from 24h ago
  const searchStart = new Date(date.getTime() - 24 * 3600_000)
  const riseResult = SearchRiseSet(Body.Sun, observer, +1, MakeTime(searchStart), 1)

  if (!riseResult || riseResult.date.getTime() > date.getTime()) {
    const aboveHorizon = isSunAboveHorizon(date, observer)
    return { kind: 'polar', condition: aboveHorizon ? 'polar-day' : 'polar-night' }
  }

  const sunrise = riseResult.date
  const setResult = SearchRiseSet(Body.Sun, observer, -1, MakeTime(sunrise), 1)

  if (!setResult) {
    return { kind: 'polar', condition: 'polar-day' }
  }

  return { kind: 'normal', sunrise, sunset: setResult.date }
}

export function getNextSunrise(date: Date, latitude: number, longitude: number): Date | null {
  const observer = new Observer(latitude, longitude, 0)
  const result = SearchRiseSet(Body.Sun, observer, +1, MakeTime(date), 2)
  return result ? result.date : null
}
