import { describe, it, expect } from 'vitest'
import {
  computeAvailableOptions,
  validateSelections,
  EMPTY_SELECTIONS,
  type CrossRefDataset,
} from './crossref-engine'

// ── Test dataset ────────────────────────────────────────────
//
// Plant A (1): ailments [1,2], parts [leaf,root], preps [1,2]
//              zodiac [Aries=1], planet [Mars=1]
//
// Plant B (2): ailments [1,3], parts [flower,stem], preps [1,3]
//              zodiac [Aries=1, Pisces=2], planet [Jupiter=2]
//
// Plant C (3): ailments [2], parts [root], preps [2]
//              zodiac [Pisces=2], planet [Neptune=3]

const DATASET: CrossRefDataset = {
  rows: [
    { plantId: 1, ailmentId: 1, partType: 'leaf', preparationId: 1 },
    { plantId: 1, ailmentId: 2, partType: 'root', preparationId: 2 },
    { plantId: 2, ailmentId: 1, partType: 'flower', preparationId: 1 },
    { plantId: 2, ailmentId: 3, partType: 'stem', preparationId: 3 },
    { plantId: 3, ailmentId: 2, partType: 'root', preparationId: 2 },
  ],
  plantZodiac: [
    { plantId: 1, zodiacSignId: 1 },
    { plantId: 2, zodiacSignId: 1 },
    { plantId: 2, zodiacSignId: 2 },
    { plantId: 3, zodiacSignId: 2 },
  ],
  plantPlanet: [
    { plantId: 1, planetId: 1 },
    { plantId: 2, planetId: 2 },
    { plantId: 3, planetId: 3 },
  ],
}

describe('computeAvailableOptions', () => {
  it('with no selections, all values across every axis are available', () => {
    const result = computeAvailableOptions(DATASET, EMPTY_SELECTIONS)

    expect(result.ailment).toEqual(new Set([1, 2, 3]))
    expect(result.zodiac).toEqual(new Set([1, 2]))
    expect(result.planet).toEqual(new Set([1, 2, 3]))
    expect(result.part).toEqual(new Set(['leaf', 'root', 'flower', 'stem']))
    expect(result.preparation).toEqual(new Set([1, 2, 3]))
  })

  it('selecting an ailment narrows parts and preps to rows for that ailment', () => {
    const sel = { ...EMPTY_SELECTIONS, ailment: 1 }
    const result = computeAvailableOptions(DATASET, sel)

    // Ailment 1 → plants A,B → rows with ailmentId 1
    expect(result.part).toEqual(new Set(['leaf', 'flower']))
    expect(result.preparation).toEqual(new Set([1]))
    expect(result.planet).toEqual(new Set([1, 2]))
    expect(result.zodiac).toEqual(new Set([1, 2]))
    // Ailment axis itself excludes its own filter — all ailments remain reachable
    expect(result.ailment).toEqual(new Set([1, 2, 3]))
  })

  it('selecting a zodiac narrows to plants associated with that sign', () => {
    const sel = { ...EMPTY_SELECTIONS, zodiac: 2 }
    const result = computeAvailableOptions(DATASET, sel)

    // Pisces → plants B,C
    expect(result.ailment).toEqual(new Set([1, 2, 3]))
    expect(result.part).toEqual(new Set(['flower', 'stem', 'root']))
    expect(result.preparation).toEqual(new Set([1, 2, 3]))
    expect(result.planet).toEqual(new Set([2, 3]))
    // Zodiac axis itself: all plants → both signs
    expect(result.zodiac).toEqual(new Set([1, 2]))
  })

  it('selecting a planet narrows to plants associated with that planet', () => {
    const sel = { ...EMPTY_SELECTIONS, planet: 1 }
    const result = computeAvailableOptions(DATASET, sel)

    // Mars → plant A only
    expect(result.ailment).toEqual(new Set([1, 2]))
    expect(result.part).toEqual(new Set(['leaf', 'root']))
    expect(result.preparation).toEqual(new Set([1, 2]))
    expect(result.zodiac).toEqual(new Set([1]))
    expect(result.planet).toEqual(new Set([1, 2, 3]))
  })

  it('selecting a part narrows to rows with that part type', () => {
    const sel = { ...EMPTY_SELECTIONS, part: 'root' }
    const result = computeAvailableOptions(DATASET, sel)

    // root rows → plants A (ailment 2) and C (ailment 2)
    expect(result.ailment).toEqual(new Set([2]))
    expect(result.preparation).toEqual(new Set([2]))
    expect(result.planet).toEqual(new Set([1, 3]))
    expect(result.zodiac).toEqual(new Set([1, 2]))
    // Part axis itself: all rows → all parts
    expect(result.part).toEqual(new Set(['leaf', 'root', 'flower', 'stem']))
  })

  it('combining two filters narrows the intersection', () => {
    const sel = { ...EMPTY_SELECTIONS, ailment: 3, zodiac: 1 }
    const result = computeAvailableOptions(DATASET, sel)

    // Ailment 3 → plant B. Zodiac Aries → plants A,B. Intersection: plant B.
    expect(result.planet).toEqual(new Set([2]))
    expect(result.part).toEqual(new Set(['stem']))
    expect(result.preparation).toEqual(new Set([3]))
    // Each axis excludes itself: ailment axis applies only zodiac
    expect(result.ailment).toEqual(new Set([1, 2, 3]))
    // Zodiac axis applies only ailment 3 → plant B → zodiacs {1,2}
    expect(result.zodiac).toEqual(new Set([1, 2]))
  })

  it('conflicting filters produce empty sets for remaining axes', () => {
    // Ailment 3 → plant B only. Planet Mars → plant A only. No overlap.
    const sel = { ...EMPTY_SELECTIONS, ailment: 3, planet: 1 }
    const result = computeAvailableOptions(DATASET, sel)

    expect(result.part).toEqual(new Set())
    expect(result.preparation).toEqual(new Set())
    expect(result.zodiac).toEqual(new Set())
    // Each axis still shows what's valid without its own filter
    expect(result.ailment).toEqual(new Set([1, 2]))
    expect(result.planet).toEqual(new Set([2]))
  })

  it('rows with null partType or preparationId do not leak into available sets', () => {
    const dataset: CrossRefDataset = {
      rows: [
        { plantId: 1, ailmentId: 1, partType: null, preparationId: null },
        { plantId: 1, ailmentId: 2, partType: 'leaf', preparationId: 1 },
      ],
      plantZodiac: [],
      plantPlanet: [],
    }
    const result = computeAvailableOptions(dataset, EMPTY_SELECTIONS)

    expect(result.part).toEqual(new Set(['leaf']))
    expect(result.preparation).toEqual(new Set([1]))
    expect(result.ailment).toEqual(new Set([1, 2]))
  })

  it('an empty dataset returns empty sets for all axes', () => {
    const empty: CrossRefDataset = { rows: [], plantZodiac: [], plantPlanet: [] }
    const result = computeAvailableOptions(empty, EMPTY_SELECTIONS)

    expect(result.ailment).toEqual(new Set())
    expect(result.zodiac).toEqual(new Set())
    expect(result.planet).toEqual(new Set())
    expect(result.part).toEqual(new Set())
    expect(result.preparation).toEqual(new Set())
  })

  it('selecting a preparation narrows to rows with that prep', () => {
    const sel = { ...EMPTY_SELECTIONS, preparation: 3 }
    const result = computeAvailableOptions(DATASET, sel)

    // Prep 3 → row 4 (plant B, ailment 3, stem)
    expect(result.ailment).toEqual(new Set([3]))
    expect(result.part).toEqual(new Set(['stem']))
    expect(result.planet).toEqual(new Set([2]))
    expect(result.zodiac).toEqual(new Set([1, 2]))
    // Prep axis excludes itself
    expect(result.preparation).toEqual(new Set([1, 2, 3]))
  })
})

describe('validateSelections', () => {
  it('preserves selections that are in the available set', () => {
    const available = computeAvailableOptions(DATASET, { ...EMPTY_SELECTIONS, ailment: 1 })
    const sel = { ...EMPTY_SELECTIONS, ailment: 1 }
    const validated = validateSelections(available, sel)

    expect(validated.ailment).toBe(1)
  })

  it('clears a selection that is no longer available', () => {
    // Planet Mars (1) → plant A → ailments {1,2}. Ailment 3 is not in that set.
    const sel = { ...EMPTY_SELECTIONS, ailment: 3, planet: 1 }
    const available = computeAvailableOptions(DATASET, sel)
    const validated = validateSelections(available, sel)

    // Ailment 3 is NOT in available.ailment ({1,2})
    expect(validated.ailment).toBeNull()
    // Planet 1 is NOT in available.planet ({2})
    expect(validated.planet).toBeNull()
  })

  it('leaves null selections as null', () => {
    const available = computeAvailableOptions(DATASET, EMPTY_SELECTIONS)
    const validated = validateSelections(available, EMPTY_SELECTIONS)

    expect(validated).toEqual(EMPTY_SELECTIONS)
  })

  it('clears part and preparation when their sets are empty', () => {
    // Conflicting: ailment 3 (plant B) + planet 1 (plant A)
    const sel = { ...EMPTY_SELECTIONS, ailment: 3, planet: 1, part: 'stem' }
    const available = computeAvailableOptions(DATASET, sel)
    const validated = validateSelections(available, sel)

    // Part set is empty for the remaining axes (ailment + planet conflict)
    // but part axis excludes itself, so available.part = parts from ailment 3 + planet 1 minus part
    // Actually: available.part applies ailment 3 + planet 1 → no rows → empty set
    expect(validated.part).toBeNull()
  })
})
