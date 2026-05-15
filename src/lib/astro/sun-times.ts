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
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0,
  ))
  const astroTime = MakeTime(startOfDay)

  const riseResult = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1)
  const setResult = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1)

  if (!riseResult && !setResult) {
    const midday = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12, 0, 0,
    ))
    const aboveHorizon = isSunAboveHorizon(midday, observer)
    return { kind: 'polar', condition: aboveHorizon ? 'polar-day' : 'polar-night' }
  }

  if (!riseResult || !setResult) {
    const midday = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12, 0, 0,
    ))
    const aboveHorizon = isSunAboveHorizon(midday, observer)
    return { kind: 'polar', condition: aboveHorizon ? 'polar-day' : 'polar-night' }
  }

  const sunrise = riseResult.date
  const sunset = setResult.date

  if (sunrise.getTime() > sunset.getTime()) {
    const nextSet = SearchRiseSet(Body.Sun, observer, -1, MakeTime(sunrise), 1)
    if (nextSet) {
      return { kind: 'normal', sunrise, sunset: nextSet.date }
    }
    return { kind: 'polar', condition: 'polar-day' }
  }

  return { kind: 'normal', sunrise, sunset }
}

export function getNextSunrise(date: Date, latitude: number, longitude: number): Date | null {
  const observer = new Observer(latitude, longitude, 0)
  const result = SearchRiseSet(Body.Sun, observer, +1, MakeTime(date), 2)
  return result ? result.date : null
}
