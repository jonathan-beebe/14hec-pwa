/**
 * Plant collections stored in localStorage.
 * Mirrors the Electron app's collections + collection_plants tables.
 */

import { plantById } from './db'
import type { Collection, CollectionDetail, CollectionForPlant, Plant } from '@/types'

const COLLECTIONS_KEY = '14hec-collections'
const COLLECTION_PLANTS_KEY = '14hec-collection-plants'
const ID_KEY = '14hec-collection-next-id'

interface StoredCollection {
  id: number
  name: string
  description: string | null
  icon: string
  color: string
  created_at: string
  updated_at: string
}

interface StoredCollectionPlant {
  collection_id: number
  plant_id: number
  notes: string | null
  added_at: string
}

function readCollections(): StoredCollection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCollections(rows: StoredCollection[]): void {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(rows))
}

function readCollectionPlants(): StoredCollectionPlant[] {
  try {
    const raw = localStorage.getItem(COLLECTION_PLANTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCollectionPlants(rows: StoredCollectionPlant[]): void {
  localStorage.setItem(COLLECTION_PLANTS_KEY, JSON.stringify(rows))
}

function getNextId(): number {
  const current = parseInt(localStorage.getItem(ID_KEY) || '0', 10)
  const next = current + 1
  localStorage.setItem(ID_KEY, String(next))
  return next
}

function touchCollection(id: number): void {
  const rows = readCollections()
  const row = rows.find(r => r.id === id)
  if (!row) return
  row.updated_at = new Date().toISOString()
  writeCollections(rows)
}

export const collectionsStore = {
  getCollections(): Collection[] {
    const collections = readCollections()
    const cps = readCollectionPlants()
    const counts = new Map<number, number>()
    for (const cp of cps) {
      counts.set(cp.collection_id, (counts.get(cp.collection_id) || 0) + 1)
    }
    return [...collections]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(c => ({ ...c, plant_count: counts.get(c.id) || 0 }))
  },

  getCollectionById(id: number): CollectionDetail | null {
    const collection = readCollections().find(c => c.id === id)
    if (!collection) return null

    const plants = readCollectionPlants()
      .filter(cp => cp.collection_id === id)
      .sort((a, b) => b.added_at.localeCompare(a.added_at))
      .map(cp => {
        const plant = plantById.get(cp.plant_id)
        if (!plant) return null
        return {
          ...(plant as Plant),
          collection_notes: cp.notes,
          added_at: cp.added_at
        }
      })
      .filter((p): p is Plant & { collection_notes: string | null; added_at: string } => p !== null)

    return { ...collection, plants }
  },

  createCollection(data: {
    name: string
    description?: string | null
    icon?: string | null
    color?: string | null
  }): { id: number } {
    const rows = readCollections()
    const id = getNextId()
    const now = new Date().toISOString()
    rows.push({
      id,
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? '\u{1F33F}',
      color: data.color ?? 'botanical',
      created_at: now,
      updated_at: now
    })
    writeCollections(rows)
    return { id }
  },

  updateCollection(id: number, updates: {
    name?: string
    description?: string | null
    icon?: string | null
    color?: string | null
  }): { success: boolean } {
    const rows = readCollections()
    const row = rows.find(r => r.id === id)
    if (!row) return { success: false }

    if (updates.name !== undefined) row.name = updates.name
    if (updates.description !== undefined) row.description = updates.description
    if (updates.icon !== undefined && updates.icon !== null) row.icon = updates.icon
    if (updates.color !== undefined && updates.color !== null) row.color = updates.color
    row.updated_at = new Date().toISOString()

    writeCollections(rows)
    return { success: true }
  },

  deleteCollection(id: number): { success: boolean } {
    writeCollections(readCollections().filter(c => c.id !== id))
    writeCollectionPlants(readCollectionPlants().filter(cp => cp.collection_id !== id))
    return { success: true }
  },

  addPlantToCollection(collectionId: number, plantId: number, notes?: string): { success: boolean } {
    const rows = readCollectionPlants()
    const exists = rows.some(cp => cp.collection_id === collectionId && cp.plant_id === plantId)
    if (!exists) {
      rows.push({
        collection_id: collectionId,
        plant_id: plantId,
        notes: notes ?? null,
        added_at: new Date().toISOString()
      })
      writeCollectionPlants(rows)
    }
    touchCollection(collectionId)
    return { success: true }
  },

  removePlantFromCollection(collectionId: number, plantId: number): { success: boolean } {
    writeCollectionPlants(
      readCollectionPlants().filter(
        cp => !(cp.collection_id === collectionId && cp.plant_id === plantId)
      )
    )
    touchCollection(collectionId)
    return { success: true }
  },

  getCollectionsForPlant(plantId: number): CollectionForPlant[] {
    const collections = readCollections()
    const cps = readCollectionPlants()
    const memberships = new Set(
      cps.filter(cp => cp.plant_id === plantId).map(cp => cp.collection_id)
    )
    return [...collections]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        contains_plant: memberships.has(c.id) ? 1 : 0
      }))
  }
}
