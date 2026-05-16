export interface NatalDataset {
  signsWithPlants: Set<number>
}

export interface NatalSelections {
  sun: number | null
  moon: number | null
  rising: number | null
}

export const EMPTY_SELECTIONS: NatalSelections = {
  sun: null,
  moon: null,
  rising: null,
}

export function computeAvailableSigns(dataset: NatalDataset): Set<number> {
  return new Set(dataset.signsWithPlants)
}

export function validateSelections(
  available: Set<number>,
  selections: NatalSelections,
): NatalSelections {
  return {
    sun:
      selections.sun !== null && !available.has(selections.sun)
        ? null
        : selections.sun,
    moon:
      selections.moon !== null && !available.has(selections.moon)
        ? null
        : selections.moon,
    rising:
      selections.rising !== null && !available.has(selections.rising)
        ? null
        : selections.rising,
  }
}
