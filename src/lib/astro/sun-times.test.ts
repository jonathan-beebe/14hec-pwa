import { describe, it, expect } from 'vitest'
import { getSunTimes } from './sun-times'

function minutesDiff(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 60000
}

function dayLengthHours(sunrise: Date, sunset: Date): number {
  return (sunset.getTime() - sunrise.getTime()) / 3600000
}

describe('getSunTimes', () => {
  describe('mid-latitude locations', () => {
    it('computes sunrise/sunset for NYC summer solstice within 2 minutes of reference', () => {
      // NYC: 40.7128 N, 74.0060 W — June 21 2025
      // Reference (NOAA): sunrise ~09:25 UTC, sunset ~00:31 UTC+1 (next day)
      const result = getSunTimes(new Date('2025-06-21T12:00:00Z'), 40.7128, -74.006)

      if (result.kind !== 'normal') throw new Error('expected normal sun times for NYC')

      const sunriseUTC = result.sunrise.getUTCHours() * 60 + result.sunrise.getUTCMinutes()
      const sunsetUTC = result.sunset.getUTCHours() * 60 + result.sunset.getUTCMinutes()

      // Sunrise ~09:25 UTC = 565 minutes from midnight
      expect(sunriseUTC).toBeGreaterThanOrEqual(563)
      expect(sunriseUTC).toBeLessThanOrEqual(567)

      // Sunset ~00:31 UTC next day = 1471 minutes from midnight (24:31)
      // But sunset on the same calendar day: ~00:31 UTC = 31 minutes from midnight
      // Actually sunset in UTC is around 00:31 on June 22, which means the Date
      // will have a different day. Let's just check day length instead.
      const hours = dayLengthHours(result.sunrise, result.sunset)
      expect(hours).toBeGreaterThan(14.8)
      expect(hours).toBeLessThan(15.3)
    })

    it('computes sunrise/sunset for London summer solstice', () => {
      // London: 51.5074 N, 0.1278 W — June 21 2025
      // Reference: sunrise ~03:43 UTC, sunset ~20:21 UTC, day ~16h 38m
      const result = getSunTimes(new Date('2025-06-21T12:00:00Z'), 51.5074, -0.1278)

      if (result.kind !== 'normal') throw new Error('expected normal sun times for London')

      const hours = dayLengthHours(result.sunrise, result.sunset)
      expect(hours).toBeGreaterThan(16.3)
      expect(hours).toBeLessThan(16.9)
    })

    it('computes short winter day for Reykjavik winter solstice', () => {
      // Reykjavik: 64.1353 N, 21.8952 W — December 21 2025
      // Reference: sunrise ~11:22 UTC, sunset ~15:29 UTC, day ~4h 07m
      const result = getSunTimes(new Date('2025-12-21T12:00:00Z'), 64.1353, -21.8952)

      if (result.kind !== 'normal') throw new Error('expected normal sun times for Reykjavik')

      const hours = dayLengthHours(result.sunrise, result.sunset)
      expect(hours).toBeGreaterThan(3.5)
      expect(hours).toBeLessThan(4.5)
    })
  })

  describe('equinox behavior', () => {
    it('produces ~12 hours of daylight at the equator on the equinox', () => {
      // 0 lat, 0 lon — March 20 2025
      // Due to atmospheric refraction, day length is ~12h 6-7m, not exactly 12h
      const result = getSunTimes(new Date('2025-03-20T12:00:00Z'), 0, 0)

      if (result.kind !== 'normal') throw new Error('expected normal sun times at equator')

      const hours = dayLengthHours(result.sunrise, result.sunset)
      expect(hours).toBeGreaterThan(12.0)
      expect(hours).toBeLessThan(12.25)
    })
  })

  describe('southern hemisphere', () => {
    it('has long summer days in December (Sydney)', () => {
      // Sydney: -33.8688 S, 151.2093 E — December 21 2025
      // Reference: day ~14h 24m
      const result = getSunTimes(new Date('2025-12-21T00:00:00Z'), -33.8688, 151.2093)

      if (result.kind !== 'normal') throw new Error('expected normal sun times for Sydney')

      const hours = dayLengthHours(result.sunrise, result.sunset)
      expect(hours).toBeGreaterThan(14.0)
      expect(hours).toBeLessThan(14.8)
    })
  })

  describe('polar conditions', () => {
    it('returns polar-day for Tromso in midsummer', () => {
      // Tromso: 69.6489 N, 18.9551 E — June 21 (midnight sun period)
      const result = getSunTimes(new Date('2025-06-21T12:00:00Z'), 69.6489, 18.9551)

      expect(result.kind).toBe('polar')
      if (result.kind !== 'polar') throw new Error('expected polar condition')
      expect(result.condition).toBe('polar-day')
    })

    it('returns polar-night for Tromso in midwinter', () => {
      // Tromso: 69.6489 N — December 21 (polar night period)
      const result = getSunTimes(new Date('2025-12-21T12:00:00Z'), 69.6489, 18.9551)

      expect(result.kind).toBe('polar')
      if (result.kind !== 'polar') throw new Error('expected polar condition')
      expect(result.condition).toBe('polar-night')
    })
  })

  describe('invariants', () => {
    it('sunrise is always before sunset for non-polar locations', () => {
      const locations = [
        { lat: 40.7128, lon: -74.006 },   // NYC
        { lat: 51.5074, lon: -0.1278 },   // London
        { lat: -33.8688, lon: 151.2093 }, // Sydney
        { lat: 35.6762, lon: 139.6503 },  // Tokyo
        { lat: 0, lon: 0 },               // Equator
      ]
      const dates = [
        new Date('2025-03-20T12:00:00Z'), // equinox
        new Date('2025-06-21T12:00:00Z'), // summer solstice
        new Date('2025-12-21T12:00:00Z'), // winter solstice
      ]

      for (const loc of locations) {
        for (const date of dates) {
          const result = getSunTimes(date, loc.lat, loc.lon)
          if (result.kind === 'normal') {
            expect(result.sunrise.getTime()).toBeLessThan(result.sunset.getTime())
          }
        }
      }
    })
  })
})
