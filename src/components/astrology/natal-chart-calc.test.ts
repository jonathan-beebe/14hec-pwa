import { describe, it, expect } from 'vitest'
import { computePlacements, longitudeToSignId } from './natal-chart-calc'

describe('longitudeToSignId', () => {
  it('maps 0° to Aries (1)', () => {
    expect(longitudeToSignId(0)).toBe(1)
  })

  it('maps 29.9° to Aries (1)', () => {
    expect(longitudeToSignId(29.9)).toBe(1)
  })

  it('maps 30° to Taurus (2)', () => {
    expect(longitudeToSignId(30)).toBe(2)
  })

  it('maps 90° to Cancer (4)', () => {
    expect(longitudeToSignId(90)).toBe(4)
  })

  it('maps 270° to Capricorn (10)', () => {
    expect(longitudeToSignId(270)).toBe(10)
  })

  it('maps 359.9° to Pisces (12)', () => {
    expect(longitudeToSignId(359.9)).toBe(12)
  })
})

describe('computePlacements', () => {
  it('computes J2000 epoch: Sun in Capricorn, Moon in Scorpio', () => {
    const result = computePlacements(
      new Date(Date.UTC(2000, 0, 1, 12, 0, 0)),
      51.4769,
      -0.0005,
    )
    expect(result.sun).toBe(10)
    expect(result.moon).toBe(8)
    expect(result.rising).toBeGreaterThanOrEqual(1)
    expect(result.rising).toBeLessThanOrEqual(12)
  })

  it('computes summer solstice 2024: Sun in Cancer', () => {
    const result = computePlacements(
      new Date(Date.UTC(2024, 5, 20, 20, 51, 0)),
      40.7128,
      -74.006,
    )
    expect(result.sun).toBe(4)
  })

  it('computes day after spring equinox: Sun in Aries', () => {
    const result = computePlacements(
      new Date(Date.UTC(2024, 2, 21, 0, 0, 0)),
      0,
      0,
    )
    expect(result.sun).toBe(1)
  })

  it('returns valid sign IDs for all placements', () => {
    const result = computePlacements(
      new Date(Date.UTC(1990, 6, 15, 8, 30, 0)),
      34.0522,
      -118.2437,
    )
    for (const key of ['sun', 'moon', 'rising'] as const) {
      expect(result[key]).toBeGreaterThanOrEqual(1)
      expect(result[key]).toBeLessThanOrEqual(12)
      expect(Number.isInteger(result[key])).toBe(true)
    }
  })

  it('different locations at the same time produce different rising signs', () => {
    const date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0))
    const london = computePlacements(date, 51.5, 0)
    const tokyo = computePlacements(date, 35.7, 139.7)
    // Sun and Moon should be the same (geocentric), rising differs by location
    expect(london.sun).toBe(tokyo.sun)
    expect(london.moon).toBe(tokyo.moon)
    expect(london.rising).not.toBe(tokyo.rising)
  })
})
