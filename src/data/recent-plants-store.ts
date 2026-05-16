const STORAGE_KEY = '14hec-recent-plants'
const MAX_ENTRIES = 10

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeIds(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // localStorage unavailable — silent fallback
  }
}

export const recentPlantsStore = {
  getRecentPlantIds(): number[] {
    return readIds()
  },

  recordPlantView(id: number): void {
    const ids = readIds().filter(existing => existing !== id)
    ids.unshift(id)
    writeIds(ids.slice(0, MAX_ENTRIES))
  },

  clearRecentPlants(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable — silent fallback
    }
  }
}
