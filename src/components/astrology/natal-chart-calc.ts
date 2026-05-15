import {
  SunPosition,
  EclipticGeoMoon,
  SiderealTime,
  MakeTime,
} from 'astronomy-engine'

import type { NatalSelections } from './natal-engine'

export function longitudeToSignId(longitude: number): number {
  return Math.floor(longitude / 30) + 1
}

function computeAscendantLongitude(
  date: Date,
  latitude: number,
  longitude: number,
): number {
  const gast = SiderealTime(date)
  const lstHours = ((gast + longitude / 15) % 24 + 24) % 24
  const ramc = lstHours * 15

  const t = MakeTime(date)
  const jc = t.tt / 36525
  const obliquity = 23.4393 - 0.013004167 * jc

  const ramcRad = (ramc * Math.PI) / 180
  const oblRad = (obliquity * Math.PI) / 180
  const latRad = (latitude * Math.PI) / 180

  const y = -Math.cos(ramcRad)
  const x = Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)
  let asc = Math.atan2(y, x) * (180 / Math.PI)
  if (asc < 0) asc += 360

  return asc
}

export function computePlacements(
  date: Date,
  latitude: number,
  longitude: number,
): NatalSelections {
  const sunLon = SunPosition(date).elon
  const moonLon = EclipticGeoMoon(date).lon
  const ascLon = computeAscendantLongitude(date, latitude, longitude)

  return {
    sun: longitudeToSignId(sunLon),
    moon: longitudeToSignId(moonLon),
    rising: longitudeToSignId(ascLon),
  }
}
