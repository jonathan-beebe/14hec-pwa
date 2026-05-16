import { describe, it, expect } from 'vitest'
import {
  computeAvailableSigns,
  validateSelections,
  EMPTY_SELECTIONS,
  type NatalDataset,
} from './natal-engine'

// ── Test dataset ────────────────────────────────────────────
//
// Signs 1–4 have plants. Sign 5 has no plants.
// Sign 1: 3 plants
// Sign 2: 1 plant
// Sign 3: 2 plants
// Sign 4: 1 plant
// Sign 5: 0 plants (should be disabled)

const DATASET: NatalDataset = {
  signsWithPlants: new Set([1, 2, 3, 4]),
}

describe('computeAvailableSigns', () => {
  it('returns the set of signs that have plants', () => {
    const result = computeAvailableSigns(DATASET)
    expect(result).toEqual(new Set([1, 2, 3, 4]))
  })

  it('returns empty set for an empty dataset', () => {
    const empty: NatalDataset = { signsWithPlants: new Set() }
    const result = computeAvailableSigns(empty)
    expect(result).toEqual(new Set())
  })

  it('does not include signs without plants', () => {
    const result = computeAvailableSigns(DATASET)
    expect(result.has(5)).toBe(false)
  })
})

describe('validateSelections', () => {
  it('preserves selections that are available', () => {
    const available = computeAvailableSigns(DATASET)
    const sel = { ...EMPTY_SELECTIONS, sun: 1, moon: 3 }
    const validated = validateSelections(available, sel)

    expect(validated.sun).toBe(1)
    expect(validated.moon).toBe(3)
    expect(validated.rising).toBeNull()
  })

  it('clears a selection whose sign has no plants', () => {
    const available = computeAvailableSigns(DATASET)
    const sel = { ...EMPTY_SELECTIONS, sun: 5 }
    const validated = validateSelections(available, sel)

    expect(validated.sun).toBeNull()
  })

  it('clears multiple invalid selections at once', () => {
    const available = computeAvailableSigns(DATASET)
    const sel = { sun: 5, moon: 99, rising: 2 }
    const validated = validateSelections(available, sel)

    expect(validated.sun).toBeNull()
    expect(validated.moon).toBeNull()
    expect(validated.rising).toBe(2)
  })

  it('leaves null selections as null', () => {
    const available = computeAvailableSigns(DATASET)
    const validated = validateSelections(available, EMPTY_SELECTIONS)
    expect(validated).toEqual(EMPTY_SELECTIONS)
  })

  it('handles empty available set by clearing all selections', () => {
    const available = new Set<number>()
    const sel = { sun: 1, moon: 2, rising: 3 }
    const validated = validateSelections(available, sel)

    expect(validated.sun).toBeNull()
    expect(validated.moon).toBeNull()
    expect(validated.rising).toBeNull()
  })
})
