import { describe, it, expect } from 'vitest'
import {
  CHALDEAN_ORDER,
  DAY_RULERS,
  getDayRuler,
  getPlanetForHour,
} from './chaldean'

describe('CHALDEAN_ORDER', () => {
  it('contains exactly the 7 classical planets', () => {
    expect(CHALDEAN_ORDER).toEqual([
      'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon',
    ])
  })
})

describe('DAY_RULERS', () => {
  it('maps to JavaScript getDay() indices (0=Sunday)', () => {
    expect(DAY_RULERS[0]).toBe('Sun')     // Sunday
    expect(DAY_RULERS[1]).toBe('Moon')    // Monday
    expect(DAY_RULERS[2]).toBe('Mars')    // Tuesday
    expect(DAY_RULERS[3]).toBe('Mercury') // Wednesday
    expect(DAY_RULERS[4]).toBe('Jupiter') // Thursday
    expect(DAY_RULERS[5]).toBe('Venus')   // Friday
    expect(DAY_RULERS[6]).toBe('Saturn')  // Saturday
  })
})

describe('getDayRuler', () => {
  it('returns Sun for a known Sunday', () => {
    const sunday = new Date('2025-06-22T12:00:00Z')
    expect(sunday.getUTCDay()).toBe(0)
    expect(getDayRuler(sunday)).toBe('Sun')
  })

  it('returns Saturn for a known Saturday', () => {
    const saturday = new Date('2025-06-28T12:00:00Z')
    expect(saturday.getUTCDay()).toBe(6)
    expect(getDayRuler(saturday)).toBe('Saturn')
  })

  it('returns Moon for a known Monday', () => {
    const monday = new Date('2025-06-23T12:00:00Z')
    expect(monday.getUTCDay()).toBe(1)
    expect(getDayRuler(monday)).toBe('Moon')
  })
})

describe('getPlanetForHour', () => {
  it('returns the day ruler for the first hour', () => {
    expect(getPlanetForHour(0, 0)).toBe('Sun')     // Sunday hour 1
    expect(getPlanetForHour(0, 1)).toBe('Moon')    // Monday hour 1
    expect(getPlanetForHour(0, 6)).toBe('Saturn')  // Saturday hour 1
  })

  it('follows the Chaldean sequence from the day ruler', () => {
    // Sunday: Sun(3), Venus(4), Mercury(5), Moon(6), Saturn(0), Jupiter(1), Mars(2)
    expect(getPlanetForHour(0, 0)).toBe('Sun')
    expect(getPlanetForHour(1, 0)).toBe('Venus')
    expect(getPlanetForHour(2, 0)).toBe('Mercury')
    expect(getPlanetForHour(3, 0)).toBe('Moon')
    expect(getPlanetForHour(4, 0)).toBe('Saturn')
    expect(getPlanetForHour(5, 0)).toBe('Jupiter')
    expect(getPlanetForHour(6, 0)).toBe('Mars')
    expect(getPlanetForHour(7, 0)).toBe('Sun') // wraps back
  })

  it('produces the next day ruler after 24 hours for all 7 days', () => {
    for (let day = 0; day < 7; day++) {
      const hour24Planet = getPlanetForHour(24, day)
      const nextDayRuler = DAY_RULERS[(day + 1) % 7]
      expect(hour24Planet).toBe(nextDayRuler)
    }
  })

  it('Sunday hour 24 yields Moon (Monday ruler)', () => {
    expect(getPlanetForHour(23, 0)).toBe('Mercury')
    expect(getPlanetForHour(24, 0)).toBe('Moon') // Monday's first hour
  })
})
