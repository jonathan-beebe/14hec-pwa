export interface SunTimes {
  sunrise: Date
  sunset: Date
}

export interface PlanetaryHour {
  planet: string
  hourNumber: number
  isDay: boolean
  startTime: Date
  endTime: Date
  durationMinutes: number
}

export interface PlanetaryTiming {
  dayRuler: string
  sunTimes: SunTimes
  hours: PlanetaryHour[]
  currentHour: PlanetaryHour | null
}

export type PolarCondition = 'polar-day' | 'polar-night'

export type SunTimesResult =
  | { kind: 'normal'; sunrise: Date; sunset: Date }
  | { kind: 'polar'; condition: PolarCondition }

export interface GeoLocation {
  latitude: number
  longitude: number
}
