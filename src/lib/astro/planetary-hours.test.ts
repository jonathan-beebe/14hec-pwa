import { describe, it, expect } from 'vitest'
import { computePlanetaryHours, findCurrentHour } from './planetary-hours'
import type { PlanetaryHour } from './types'

const MINUTE = 60 * 1000

function makeDate(h: number, m: number = 0): Date {
  return new Date(Date.UTC(2025, 5, 22, h, m, 0)) // June 22 2025 (Sunday)
}

describe('computePlanetaryHours', () => {
  const sunrise = makeDate(9, 25)   // ~09:25 UTC (NYC summer sunrise)
  const sunset = makeDate(0 + 24, 31) // ~00:31 UTC next day (NYC summer sunset)
  const nextSunrise = makeDate(9 + 24, 26) // next day sunrise

  // Sunday = day 0
  const hours = computePlanetaryHours(sunrise, sunset, nextSunrise, 0)

  it('produces exactly 24 planetary hours', () => {
    expect(hours).toHaveLength(24)
  })

  it('marks hours 1-12 as day, hours 13-24 as night', () => {
    for (let i = 0; i < 12; i++) {
      expect(hours[i].isDay).toBe(true)
      expect(hours[i].hourNumber).toBe(i + 1)
    }
    for (let i = 12; i < 24; i++) {
      expect(hours[i].isDay).toBe(false)
      expect(hours[i].hourNumber).toBe(i - 12 + 1)
    }
  })

  it('starts at sunrise', () => {
    expect(hours[0].startTime.getTime()).toBe(sunrise.getTime())
  })

  it('night begins at sunset', () => {
    expect(hours[12].startTime.getTime()).toBe(sunset.getTime())
  })

  it('ends at next sunrise', () => {
    expect(hours[23].endTime.getTime()).toBe(nextSunrise.getTime())
  })

  it('has contiguous hours with no gaps', () => {
    for (let i = 0; i < 23; i++) {
      expect(hours[i].endTime.getTime()).toBe(hours[i + 1].startTime.getTime())
    }
  })

  it('day hours + night hours sum to exactly 24 hours', () => {
    const totalMs = hours.reduce((sum, h) => sum + (h.endTime.getTime() - h.startTime.getTime()), 0)
    const expected = nextSunrise.getTime() - sunrise.getTime()
    expect(totalMs).toBe(expected)
  })

  it('assigns the day ruler (Sun) to the first hour on Sunday', () => {
    expect(hours[0].planet).toBe('Sun')
  })

  it('follows Chaldean sequence: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars...', () => {
    const expected = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
    for (let i = 0; i < 7; i++) {
      expect(hours[i].planet).toBe(expected[i])
    }
  })

  it('continues the Chaldean sequence across the day-night boundary without reset', () => {
    // Hour 12 (last day hour) and hour 13 (first night hour) must be consecutive in sequence
    const hour12idx = 11
    const hour13idx = 12
    const chaldean = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
    const idx12 = chaldean.indexOf(hours[hour12idx].planet)
    const idx13 = chaldean.indexOf(hours[hour13idx].planet)
    expect(idx13).toBe((idx12 + 1) % 7)
  })

  describe('unequal temporal hours', () => {
    it('day hours are longer than night hours at summer solstice (NYC)', () => {
      const dayDuration = hours[0].durationMinutes
      const nightDuration = hours[12].durationMinutes
      expect(dayDuration).toBeGreaterThan(nightDuration)
    })

    it('each day hour has the same duration', () => {
      const dayDuration = hours[0].durationMinutes
      for (let i = 1; i < 12; i++) {
        expect(hours[i].durationMinutes).toBeCloseTo(dayDuration, 6)
      }
    })

    it('each night hour has the same duration', () => {
      const nightDuration = hours[12].durationMinutes
      for (let i = 13; i < 24; i++) {
        expect(hours[i].durationMinutes).toBeCloseTo(nightDuration, 6)
      }
    })

    it('summer day hours in NYC are roughly 75 minutes', () => {
      expect(hours[0].durationMinutes).toBeGreaterThan(70)
      expect(hours[0].durationMinutes).toBeLessThan(80)
    })
  })

  describe('winter solstice (short day)', () => {
    it('produces short day hours and long night hours for Reykjavik', () => {
      // Reykjavik Dec 21: sunrise ~11:22 UTC, sunset ~15:29 UTC, ~4h 07m day
      const winterSunrise = new Date(Date.UTC(2025, 11, 21, 11, 22, 0))
      const winterSunset = new Date(Date.UTC(2025, 11, 21, 15, 29, 0))
      const winterNextSunrise = new Date(Date.UTC(2025, 11, 22, 11, 23, 0))

      const winterHours = computePlanetaryHours(winterSunrise, winterSunset, winterNextSunrise, 0)

      // Day hours should be ~20.6 minutes each
      expect(winterHours[0].durationMinutes).toBeGreaterThan(18)
      expect(winterHours[0].durationMinutes).toBeLessThan(23)

      // Night hours should be ~99.4 minutes each
      expect(winterHours[12].durationMinutes).toBeGreaterThan(95)
      expect(winterHours[12].durationMinutes).toBeLessThan(103)
    })
  })

  describe('all 7 days produce correct first-hour rulers', () => {
    const rulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

    rulers.forEach((ruler, dayOfWeek) => {
      it(`day ${dayOfWeek} starts with ${ruler}`, () => {
        const h = computePlanetaryHours(sunrise, sunset, nextSunrise, dayOfWeek)
        expect(h[0].planet).toBe(ruler)
      })
    })
  })
})

describe('findCurrentHour', () => {
  const sunrise = makeDate(9, 25)
  const sunset = makeDate(0 + 24, 31)
  const nextSunrise = makeDate(9 + 24, 26)
  const hours = computePlanetaryHours(sunrise, sunset, nextSunrise, 0)

  it('returns the first hour at sunrise', () => {
    const result = findCurrentHour(sunrise, hours)
    if (!result) throw new Error('expected a planetary hour at sunrise')
    expect(result.planet).toBe('Sun')
    expect(result.hourNumber).toBe(1)
  })

  it('returns the correct hour at a mid-day time', () => {
    // 3 hours after sunrise should be in hour 3 or 4 depending on hour length
    const threeHoursIn = new Date(sunrise.getTime() + 3 * 60 * MINUTE)
    const result = findCurrentHour(threeHoursIn, hours)
    if (!result) throw new Error('expected a planetary hour')
    expect(result.isDay).toBe(true)
  })

  it('returns a night hour after sunset', () => {
    const afterSunset = new Date(sunset.getTime() + 30 * MINUTE)
    const result = findCurrentHour(afterSunset, hours)
    if (!result) throw new Error('expected a night planetary hour')
    expect(result.isDay).toBe(false)
    expect(result.hourNumber).toBe(1)
  })

  it('returns null before sunrise', () => {
    const beforeSunrise = new Date(sunrise.getTime() - 60 * MINUTE)
    const result = findCurrentHour(beforeSunrise, hours)
    expect(result).toBeNull()
  })

  it('returns null after the last hour ends', () => {
    const afterEnd = new Date(nextSunrise.getTime() + 60 * MINUTE)
    const result = findCurrentHour(afterEnd, hours)
    expect(result).toBeNull()
  })
})
