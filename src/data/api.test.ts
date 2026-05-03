import { describe, it, expect } from 'vitest'
import { api } from './api'

describe('api.getPlants', () => {
  it('returns plants sorted by common name', async () => {
    const plants = await api.getPlants()
    expect(plants.length).toBeGreaterThan(0)
    const names = plants.map(p => p.common_name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  it('filters by search term across common name, latin name, and description', async () => {
    const results = await api.getPlants({ search: 'mugwort' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(p => p.common_name.toLowerCase().includes('mugwort'))).toBe(true)
  })
})

describe('api.getPlantById', () => {
  it('returns a fully-hydrated plant detail for a known id', async () => {
    const all = await api.getPlants()
    const first = all[0]
    const detail = await api.getPlantById(first.id)

    if (!detail) throw new Error(`expected plant detail for id ${first.id}`)

    expect(detail.id).toBe(first.id)
    expect(detail.common_name).toBe(first.common_name)
    expect(Array.isArray(detail.parts)).toBe(true)
    expect(Array.isArray(detail.planetAssociations)).toBe(true)
    expect(Array.isArray(detail.zodiacAssociations)).toBe(true)
    expect(Array.isArray(detail.ailmentAssociations)).toBe(true)
  })

  it('returns null for an unknown id', async () => {
    const detail = await api.getPlantById(-1)
    expect(detail).toBeNull()
  })
})
