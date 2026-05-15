export interface CrossRefRow {
  plantId: number
  ailmentId: number
  partType: string | null
  preparationId: number | null
}

export interface PlantZodiacLink {
  plantId: number
  zodiacSignId: number
}

export interface PlantPlanetLink {
  plantId: number
  planetId: number
}

export interface CrossRefDataset {
  rows: CrossRefRow[]
  plantZodiac: PlantZodiacLink[]
  plantPlanet: PlantPlanetLink[]
}

export interface CrossRefSelections {
  ailment: number | null
  zodiac: number | null
  planet: number | null
  part: string | null
  preparation: number | null
}

export interface AvailableOptions {
  ailment: Set<number>
  zodiac: Set<number>
  planet: Set<number>
  part: Set<string>
  preparation: Set<number>
}

export const EMPTY_SELECTIONS: CrossRefSelections = {
  ailment: null,
  zodiac: null,
  planet: null,
  part: null,
  preparation: null,
}

function plantIdsForZodiac(
  links: PlantZodiacLink[],
  zodiacSignId: number,
): Set<number> {
  const ids = new Set<number>()
  for (const link of links) {
    if (link.zodiacSignId === zodiacSignId) ids.add(link.plantId)
  }
  return ids
}

function plantIdsForPlanet(
  links: PlantPlanetLink[],
  planetId: number,
): Set<number> {
  const ids = new Set<number>()
  for (const link of links) {
    if (link.planetId === planetId) ids.add(link.plantId)
  }
  return ids
}

function filterRows(
  rows: CrossRefRow[],
  dataset: CrossRefDataset,
  sel: CrossRefSelections,
  exclude: keyof CrossRefSelections,
): CrossRefRow[] {
  let filtered = rows

  if (exclude !== 'ailment' && sel.ailment !== null) {
    filtered = filtered.filter((r) => r.ailmentId === sel.ailment)
  }

  if (exclude !== 'zodiac' && sel.zodiac !== null) {
    const ids = plantIdsForZodiac(dataset.plantZodiac, sel.zodiac)
    filtered = filtered.filter((r) => ids.has(r.plantId))
  }

  if (exclude !== 'planet' && sel.planet !== null) {
    const ids = plantIdsForPlanet(dataset.plantPlanet, sel.planet)
    filtered = filtered.filter((r) => ids.has(r.plantId))
  }

  if (exclude !== 'part' && sel.part !== null) {
    filtered = filtered.filter((r) => r.partType === sel.part)
  }

  if (exclude !== 'preparation' && sel.preparation !== null) {
    filtered = filtered.filter((r) => r.preparationId === sel.preparation)
  }

  return filtered
}

function collectPlantIds(rows: CrossRefRow[]): Set<number> {
  const ids = new Set<number>()
  for (const r of rows) ids.add(r.plantId)
  return ids
}

export function computeAvailableOptions(
  dataset: CrossRefDataset,
  selections: CrossRefSelections,
): AvailableOptions {
  const ailmentRows = filterRows(dataset.rows, dataset, selections, 'ailment')
  const ailment = new Set<number>()
  for (const r of ailmentRows) ailment.add(r.ailmentId)

  const zodiacRows = filterRows(dataset.rows, dataset, selections, 'zodiac')
  const zodiacPlantIds = collectPlantIds(zodiacRows)
  const zodiac = new Set<number>()
  for (const link of dataset.plantZodiac) {
    if (zodiacPlantIds.has(link.plantId)) zodiac.add(link.zodiacSignId)
  }

  const planetRows = filterRows(dataset.rows, dataset, selections, 'planet')
  const planetPlantIds = collectPlantIds(planetRows)
  const planet = new Set<number>()
  for (const link of dataset.plantPlanet) {
    if (planetPlantIds.has(link.plantId)) planet.add(link.planetId)
  }

  const partRows = filterRows(dataset.rows, dataset, selections, 'part')
  const part = new Set<string>()
  for (const r of partRows) {
    if (r.partType !== null) part.add(r.partType)
  }

  const prepRows = filterRows(dataset.rows, dataset, selections, 'preparation')
  const preparation = new Set<number>()
  for (const r of prepRows) {
    if (r.preparationId !== null) preparation.add(r.preparationId)
  }

  return { ailment, zodiac, planet, part, preparation }
}

const AXES: (keyof CrossRefSelections)[] = [
  'ailment',
  'zodiac',
  'planet',
  'part',
  'preparation',
]

/**
 * After a user changes one axis, auto-fill any other axis that has been
 * narrowed to a single remaining option. Cascades: filling one axis may
 * narrow another to one, which fills that one, etc. The `exempt` axis
 * (the one the user just touched) is never auto-filled — if the user
 * cleared it, we respect that intent.
 */
export function autoSelect(
  dataset: CrossRefDataset,
  selections: CrossRefSelections,
  exempt: keyof CrossRefSelections | null,
): CrossRefSelections {
  let current = selections
  for (let i = 0; i < AXES.length; i++) {
    const available = computeAvailableOptions(dataset, current)
    current = validateSelections(available, current)
    let changed = false
    for (const key of AXES) {
      if (key === exempt) continue
      if (current[key] !== null) continue
      const set = available[key]
      if (set.size === 1) {
        const [value] = set
        current = { ...current, [key]: value as never }
        changed = true
      }
    }
    if (!changed) break
  }
  return current
}

export function validateSelections(
  available: AvailableOptions,
  selections: CrossRefSelections,
): CrossRefSelections {
  return {
    ailment:
      selections.ailment !== null && !available.ailment.has(selections.ailment)
        ? null
        : selections.ailment,
    zodiac:
      selections.zodiac !== null && !available.zodiac.has(selections.zodiac)
        ? null
        : selections.zodiac,
    planet:
      selections.planet !== null && !available.planet.has(selections.planet)
        ? null
        : selections.planet,
    part:
      selections.part !== null && !available.part.has(selections.part)
        ? null
        : selections.part,
    preparation:
      selections.preparation !== null &&
      !available.preparation.has(selections.preparation)
        ? null
        : selections.preparation,
  }
}
