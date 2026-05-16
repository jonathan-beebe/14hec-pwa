// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { recentPlantsStore } from './recent-plants-store'

beforeEach(() => {
  localStorage.clear()
})

describe('recentPlantsStore', () => {
  describe('getRecentPlantIds', () => {
    it('returns empty array when no history exists', () => {
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([])
    })

    it('returns stored IDs in order', () => {
      recentPlantsStore.recordPlantView(1)
      recentPlantsStore.recordPlantView(2)
      recentPlantsStore.recordPlantView(3)
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([3, 2, 1])
    })
  })

  describe('recordPlantView', () => {
    it('prepends the viewed plant ID', () => {
      recentPlantsStore.recordPlantView(5)
      recentPlantsStore.recordPlantView(10)
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([10, 5])
    })

    it('deduplicates — moves existing ID to front', () => {
      recentPlantsStore.recordPlantView(1)
      recentPlantsStore.recordPlantView(2)
      recentPlantsStore.recordPlantView(3)
      recentPlantsStore.recordPlantView(1)
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([1, 3, 2])
    })

    it('trims to max 10 entries', () => {
      for (let i = 1; i <= 12; i++) {
        recentPlantsStore.recordPlantView(i)
      }
      const ids = recentPlantsStore.getRecentPlantIds()
      expect(ids).toHaveLength(10)
      expect(ids[0]).toBe(12)
      expect(ids[9]).toBe(3)
    })
  })

  describe('clearRecentPlants', () => {
    it('resets the store', () => {
      recentPlantsStore.recordPlantView(1)
      recentPlantsStore.recordPlantView(2)
      recentPlantsStore.clearRecentPlants()
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([])
    })
  })

  describe('localStorage unavailable', () => {
    it('returns empty array when localStorage throws', () => {
      const orig = Storage.prototype.getItem
      Storage.prototype.getItem = () => { throw new Error('denied') }
      expect(recentPlantsStore.getRecentPlantIds()).toEqual([])
      Storage.prototype.getItem = orig
    })

    it('recordPlantView does not throw when localStorage is unavailable', () => {
      const orig = Storage.prototype.setItem
      Storage.prototype.setItem = () => { throw new Error('denied') }
      expect(() => recentPlantsStore.recordPlantView(1)).not.toThrow()
      Storage.prototype.setItem = orig
    })
  })
})
