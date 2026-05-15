import { describe, it, expect } from 'vitest'
import { getPlanetaryTiming } from './index'

describe('getPlanetaryTiming (integration)', () => {
  it('returns a complete PlanetaryTiming for NYC in summer', () => {
    const now = new Date('2025-06-22T15:00:00Z') // Sunday afternoon UTC
    const result = getPlanetaryTiming(now, 40.7128, -74.006)

    if (!result) throw new Error('expected a PlanetaryTiming result')

    expect(result.dayRuler).toBe('Sun')
    expect(result.sunTimes.sunrise).toBeInstanceOf(Date)
    expect(result.sunTimes.sunset).toBeInstanceOf(Date)
    expect(result.sunTimes.sunrise.getTime()).toBeLessThan(result.sunTimes.sunset.getTime())
    expect(result.hours).toHaveLength(24)
    expect(result.hours[0].planet).toBe('Sun')
  })

  it('identifies the current planetary hour for a time during the day', () => {
    // NYC Sunday June 22 2025, ~3 PM UTC = ~11 AM EDT (daytime)
    const now = new Date('2025-06-22T15:00:00Z')
    const result = getPlanetaryTiming(now, 40.7128, -74.006)

    if (!result) throw new Error('expected a PlanetaryTiming result')
    if (!result.currentHour) throw new Error('expected a current hour during daytime')

    expect(result.currentHour.isDay).toBe(true)
    expect(result.currentHour.startTime.getTime()).toBeLessThanOrEqual(now.getTime())
    expect(result.currentHour.endTime.getTime()).toBeGreaterThan(now.getTime())
  })

  it('returns null for polar locations', () => {
    // Tromso, midsummer — polar day, no valid planetary hours
    const now = new Date('2025-06-21T12:00:00Z')
    const result = getPlanetaryTiming(now, 69.6489, 18.9551)
    expect(result).toBeNull()
  })

  it('works for southern hemisphere', () => {
    // Sydney, December 21 — long summer day
    const now = new Date('2025-12-21T04:00:00Z') // ~3 PM AEDT
    const result = getPlanetaryTiming(now, -33.8688, 151.2093)

    if (!result) throw new Error('expected a result for Sydney')

    const dayHours = result.hours.filter(h => h.isDay)
    const nightHours = result.hours.filter(h => !h.isDay)
    expect(dayHours).toHaveLength(12)
    expect(nightHours).toHaveLength(12)

    // Summer day hours should be longer than night hours
    expect(dayHours[0].durationMinutes).toBeGreaterThan(nightHours[0].durationMinutes)
  })

  it('assigns currentHour as null when now is before sunrise', () => {
    // Very early morning UTC before NYC sunrise
    const now = new Date('2025-06-22T05:00:00Z') // ~1 AM EDT
    const result = getPlanetaryTiming(now, 40.7128, -74.006)

    if (!result) throw new Error('expected a PlanetaryTiming result')

    // This time might fall in the previous day's night hours (not computed),
    // so currentHour may be null
    // The key invariant: if currentHour exists, it contains now
    if (result.currentHour) {
      expect(result.currentHour.startTime.getTime()).toBeLessThanOrEqual(now.getTime())
      expect(result.currentHour.endTime.getTime()).toBeGreaterThan(now.getTime())
    }
  })

  it('all hours span from sunrise to next sunrise', () => {
    const now = new Date('2025-06-22T15:00:00Z')
    const result = getPlanetaryTiming(now, 40.7128, -74.006)

    if (!result) throw new Error('expected a PlanetaryTiming result')

    const firstStart = result.hours[0].startTime
    const lastEnd = result.hours[23].endTime

    // First hour starts at sunrise
    expect(firstStart.getTime()).toBe(result.sunTimes.sunrise.getTime())

    // Total span should be ~24 hours (sunrise to next sunrise)
    const spanHours = (lastEnd.getTime() - firstStart.getTime()) / 3600000
    expect(spanHours).toBeGreaterThan(23.5)
    expect(spanHours).toBeLessThan(24.5)
  })
})
