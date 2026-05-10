/**
 * In-memory database built from seed JSON files.
 * Mirrors the SQLite schema and seed-data.ts resolution logic from the Electron app.
 * All data is loaded and indexed on module initialization.
 */

import plantsRaw from './seed/plants.json'
import ailmentsRaw from './seed/ailments.json'
import bodySystems from './seed/body-systems.json'
import compoundsRaw from './seed/compounds.json'
import ethicalPracticeRaw from './seed/ethical-practice.json'
import hmbsRaw from './seed/hmbs-associations.json'
import planetsRaw from './seed/planets.json'
import teachingsRaw from './seed/plant-teachings.json'
import preparationsRaw from './seed/preparations.json'
import wellnessRaw from './seed/wellness-goals.json'
import zodiacRaw from './seed/zodiac.json'

// ── Helper ────────────────────────────────────────────────
function flatten(val: any): string {
  if (Array.isArray(val)) return val.join(', ')
  return val ?? ''
}

const now = new Date().toISOString()

// ══════════════════════════════════════════════════════════
// 1. PLANETS
// ══════════════════════════════════════════════════════════
export interface PlanetRow {
  id: number; name: string; symbol: string; associated_signs: string
  body_systems: string; energetic_quality: string; description: string
}

export const planets: PlanetRow[] = (planetsRaw as any[]).map((p, i) => ({
  id: i + 1,
  name: p.name,
  symbol: p.symbol || '',
  associated_signs: flatten(p.associated_signs),
  body_systems: flatten(p.body_systems),
  energetic_quality: p.energetic_quality || '',
  description: p.description || ''
}))

const planetByName = new Map(planets.map(p => [p.name, p]))
const planetById = new Map(planets.map(p => [p.id, p]))

// ══════════════════════════════════════════════════════════
// 2. ZODIAC SIGNS
// ══════════════════════════════════════════════════════════
export interface ZodiacPowerColor { name: string; hex: string }

export interface ZodiacRow {
  id: number; name: string; symbol: string; element: string; modality: string
  ruling_planet_id: number | null; date_range_start: string; date_range_end: string
  body_parts_ruled: string; description: string
  power_colors: ZodiacPowerColor[]; power_color_meaning: string
}

export const zodiacSigns: ZodiacRow[] = (zodiacRaw as any[]).map((s, i) => {
  const primaryPlanet = s.ruling_planet?.split('/')[0].trim()
  const planet = primaryPlanet ? planetByName.get(primaryPlanet) : undefined
  return {
    id: i + 1,
    name: s.name,
    symbol: s.symbol || '',
    element: s.element,
    modality: s.modality,
    ruling_planet_id: planet?.id ?? null,
    date_range_start: s.date_range_start || '',
    date_range_end: s.date_range_end || '',
    body_parts_ruled: flatten(s.body_parts_ruled),
    description: s.description || '',
    power_colors: Array.isArray(s.power_colors) ? s.power_colors : [],
    power_color_meaning: s.power_color_meaning || ''
  }
})

const zodiacByName = new Map(zodiacSigns.map(z => [z.name, z]))
const zodiacById = new Map(zodiacSigns.map(z => [z.id, z]))

// ══════════════════════════════════════════════════════════
// 3. PREPARATIONS
// ══════════════════════════════════════════════════════════
export interface PreparationRow {
  id: number; name: string; solvent: string; best_plant_parts: string
  absorption_speed: string; concentration_level: string; shelf_life: string
  general_instructions: string; safety_notes: string
}

export const preparations: PreparationRow[] = (preparationsRaw as any[]).map((p, i) => ({
  id: i + 1,
  name: p.name,
  solvent: p.solvent || '',
  best_plant_parts: flatten(p.best_plant_parts),
  absorption_speed: p.absorption_speed || '',
  concentration_level: p.concentration || p.concentration_level || '',
  shelf_life: p.shelf_life || '',
  general_instructions: Array.isArray(p.general_instructions)
    ? p.general_instructions.join('\n')
    : (p.general_instructions || ''),
  safety_notes: p.safety_notes || ''
}))

const prepByName = new Map(preparations.map(p => [p.name.toLowerCase(), p]))
const prepById = new Map(preparations.map(p => [p.id, p]))

function findPrep(name: string): PreparationRow | undefined {
  const lower = name.toLowerCase()
  for (const [key, val] of prepByName) {
    if (key.includes(lower) || lower.includes(key)) return val
  }
  return undefined
}

// ══════════════════════════════════════════════════════════
// 4. AILMENTS
// ══════════════════════════════════════════════════════════
export interface AilmentRow {
  id: number; name: string; category: string; body_system: string
  description: string; symptoms: string
}

export const ailments: AilmentRow[] = (ailmentsRaw as any[]).map((a, i) => ({
  id: i + 1,
  name: a.name,
  category: a.category || '',
  body_system: a.body_system || '',
  description: a.description || '',
  symptoms: flatten(a.symptoms)
}))

const ailmentByName = new Map(ailments.map(a => [a.name, a]))
const ailmentById = new Map(ailments.map(a => [a.id, a]))

// ══════════════════════════════════════════════════════════
// 5. COMPOUNDS
// ══════════════════════════════════════════════════════════
export interface CompoundRow {
  id: number; name: string; compound_type: string
  pharmacological_action: string; psychoactive: number
}

export const compounds: CompoundRow[] = (compoundsRaw as any[]).map((c, i) => ({
  id: i + 1,
  name: c.name,
  compound_type: c.compound_type || '',
  pharmacological_action: c.pharmacological_action || '',
  psychoactive: c.psychoactive ? 1 : 0
}))

const compoundByName = new Map(compounds.map(c => [c.name, c]))
const compoundById = new Map(compounds.map(c => [c.id, c]))

// ══════════════════════════════════════════════════════════
// 6. PLANTS (with junction tables)
// ══════════════════════════════════════════════════════════
export interface PlantRow {
  id: number; common_name: string; latin_name: string; family: string
  genus: string; species: string; description: string; habitat: string
  native_region: string; category: string; energetic_quality: string
  doctrine_of_signatures: string; safety_notes: string; image_url: string | null
  created_at: string; updated_at: string
}

export interface PlantPartRow {
  id: number; plant_id: number; part_type: string
  typical_compounds: string; therapeutic_properties: string; notes: string
}

export interface PlantPlanetAssocRow {
  plant_id: number; planet_id: number; association_type: string; notes: string
}

export interface PlantZodiacAssocRow {
  plant_id: number; zodiac_sign_id: number; notes: string
}

export interface PlantAilmentRow {
  id: number; plant_id: number; ailment_id: number; plant_part_id: number | null
  preparation_id: number | null; efficacy_notes: string; evidence_level: string
  dosage_notes: string
}

export interface PlantCompoundRow {
  plant_id: number; compound_id: number; concentration_notes: string
}

export interface ContraindicationRow {
  id: number; plant_id: number; ailment_id: number; reason: string
  severity: string; notes: string
}

export const allPlants: PlantRow[] = []
export const plantParts: PlantPartRow[] = []
export const plantPlanetAssocs: PlantPlanetAssocRow[] = []
export const plantZodiacAssocs: PlantZodiacAssocRow[] = []
export const plantAilments: PlantAilmentRow[] = []
export const plantCompounds: PlantCompoundRow[] = []
export const contraindications: ContraindicationRow[] = []

let partIdCounter = 1
let plantAilmentIdCounter = 1
let contraindicationIdCounter = 1

for (let i = 0; i < (plantsRaw as any[]).length; i++) {
  const raw = (plantsRaw as any[])[i]
  const plantId = i + 1

  allPlants.push({
    id: plantId,
    common_name: raw.common_name,
    latin_name: raw.latin_name,
    family: raw.family || '',
    genus: raw.genus || '',
    species: raw.species || '',
    description: raw.description || '',
    habitat: raw.habitat || '',
    native_region: raw.native_region || '',
    category: raw.category || 'conventional',
    energetic_quality: raw.energetic_quality || '',
    doctrine_of_signatures: raw.doctrine_of_signatures || '',
    safety_notes: raw.safety_notes || '',
    image_url: raw.image_url || null,
    created_at: now,
    updated_at: now
  })

  // Plant parts
  const partIds: Record<string, number> = {}
  if (raw.parts) {
    for (const part of raw.parts) {
      const partId = partIdCounter++
      partIds[part.part_type] = partId
      plantParts.push({
        id: partId,
        plant_id: plantId,
        part_type: part.part_type,
        typical_compounds: part.typical_compounds || '',
        therapeutic_properties: part.therapeutic_properties || '',
        notes: part.notes || ''
      })
    }
  }

  // Planet associations
  if (raw.planet_associations) {
    for (const assoc of raw.planet_associations) {
      const planet = planetByName.get(assoc.planet)
      if (planet) {
        plantPlanetAssocs.push({
          plant_id: plantId,
          planet_id: planet.id,
          association_type: assoc.association_type || '',
          notes: assoc.notes || ''
        })
      }
    }
  }

  // Zodiac associations
  if (raw.zodiac_associations) {
    for (const assoc of raw.zodiac_associations) {
      const sign = zodiacByName.get(assoc.sign)
      if (sign) {
        plantZodiacAssocs.push({
          plant_id: plantId,
          zodiac_sign_id: sign.id,
          notes: assoc.notes || ''
        })
      }
    }
  }

  // Ailment associations
  if (raw.ailment_associations) {
    for (const assoc of raw.ailment_associations) {
      const ailment = ailmentByName.get(assoc.ailment)
      if (ailment) {
        const plantPartId = assoc.plant_part ? (partIds[assoc.plant_part] ?? null) : null
        const prep = assoc.preparation ? findPrep(assoc.preparation) : undefined
        plantAilments.push({
          id: plantAilmentIdCounter++,
          plant_id: plantId,
          ailment_id: ailment.id,
          plant_part_id: plantPartId,
          preparation_id: prep?.id ?? null,
          efficacy_notes: assoc.efficacy_notes || '',
          evidence_level: assoc.evidence_level || 'traditional',
          dosage_notes: assoc.dosage_notes || ''
        })
      }
    }
  }

  // Compound associations
  if (raw.compound_names) {
    for (const name of raw.compound_names) {
      const compound = compoundByName.get(name)
      if (compound) {
        plantCompounds.push({
          plant_id: plantId,
          compound_id: compound.id,
          concentration_notes: ''
        })
      }
    }
  }

  // Contraindications
  if (raw.contraindication_associations) {
    for (const assoc of raw.contraindication_associations) {
      const ailment = ailmentByName.get(assoc.ailment)
      if (ailment) {
        contraindications.push({
          id: contraindicationIdCounter++,
          plant_id: plantId,
          ailment_id: ailment.id,
          reason: assoc.reason || '',
          severity: assoc.severity || 'moderate',
          notes: assoc.notes || ''
        })
      }
    }
  }
}

const plantById = new Map(allPlants.map(p => [p.id, p]))
const plantByCommonName = new Map(allPlants.map(p => [p.common_name, p]))

// Index junction tables by plant_id
export const partsByPlantId = new Map<number, PlantPartRow[]>()
for (const p of plantParts) {
  const arr = partsByPlantId.get(p.plant_id) || []
  arr.push(p)
  partsByPlantId.set(p.plant_id, arr)
}

const partById = new Map(plantParts.map(p => [p.id, p]))

export const planetAssocsByPlantId = new Map<number, PlantPlanetAssocRow[]>()
for (const a of plantPlanetAssocs) {
  const arr = planetAssocsByPlantId.get(a.plant_id) || []
  arr.push(a)
  planetAssocsByPlantId.set(a.plant_id, arr)
}

export const zodiacAssocsByPlantId = new Map<number, PlantZodiacAssocRow[]>()
for (const a of plantZodiacAssocs) {
  const arr = zodiacAssocsByPlantId.get(a.plant_id) || []
  arr.push(a)
  zodiacAssocsByPlantId.set(a.plant_id, arr)
}

export const ailmentAssocsByPlantId = new Map<number, PlantAilmentRow[]>()
export const ailmentAssocsByAilmentId = new Map<number, PlantAilmentRow[]>()
for (const a of plantAilments) {
  let arr = ailmentAssocsByPlantId.get(a.plant_id) || []
  arr.push(a)
  ailmentAssocsByPlantId.set(a.plant_id, arr)

  arr = ailmentAssocsByAilmentId.get(a.ailment_id) || []
  arr.push(a)
  ailmentAssocsByAilmentId.set(a.ailment_id, arr)
}

export const compoundsByPlantId = new Map<number, PlantCompoundRow[]>()
for (const c of plantCompounds) {
  const arr = compoundsByPlantId.get(c.plant_id) || []
  arr.push(c)
  compoundsByPlantId.set(c.plant_id, arr)
}

export const contraindicationsByPlantId = new Map<number, ContraindicationRow[]>()
export const contraindicationsByAilmentId = new Map<number, ContraindicationRow[]>()
for (const c of contraindications) {
  let arr = contraindicationsByPlantId.get(c.plant_id) || []
  arr.push(c)
  contraindicationsByPlantId.set(c.plant_id, arr)

  arr = contraindicationsByAilmentId.get(c.ailment_id) || []
  arr.push(c)
  contraindicationsByAilmentId.set(c.ailment_id, arr)
}

// ══════════════════════════════════════════════════════════
// 7. BODY SYSTEMS
// ══════════════════════════════════════════════════════════
export interface BodySystemRow {
  id: number; name: string; category: string; description: string
  tcm_element: string | null; ayurvedic_dosha: string | null
  ruling_planet_id: number | null; zodiac_sign_id: number | null
  image_url: string | null; created_at: string
}

export interface BodySystemAilmentRow {
  body_system_id: number; ailment_id: number; relevance: string; notes: string
}

export interface BodySystemPlantPartRow {
  id: number; body_system_id: number; plant_id: number | null; part_type: string | null
  correspondence_type: string; signature_description: string | null
  therapeutic_action: string | null; is_food: number; food_name: string | null; notes: string | null
}

const bsData = bodySystems as any
export const bodySystemRows: BodySystemRow[] = []
export const bodySystemAilmentRows: BodySystemAilmentRow[] = []
export const bodySystemPlantPartRows: BodySystemPlantPartRow[] = []

let bsIdCounter = 1
let bsppIdCounter = 1

for (const bs of bsData.body_systems) {
  const planet = bs.ruling_planet ? planetByName.get(bs.ruling_planet) : undefined
  const zodiac = bs.zodiac_sign ? zodiacByName.get(bs.zodiac_sign) : undefined
  bodySystemRows.push({
    id: bsIdCounter++,
    name: bs.name,
    category: bs.category,
    description: bs.description || '',
    tcm_element: bs.tcm_element || null,
    ayurvedic_dosha: bs.ayurvedic_dosha || null,
    ruling_planet_id: planet?.id ?? null,
    zodiac_sign_id: zodiac?.id ?? null,
    image_url: null,
    created_at: now
  })
}

const bsByName = new Map(bodySystemRows.map(b => [b.name, b]))
const bsById = new Map(bodySystemRows.map(b => [b.id, b]))

for (const mapping of bsData.ailment_mappings) {
  const bs = bsByName.get(mapping.body_system)
  const ailment = ailmentByName.get(mapping.ailment)
  if (bs && ailment) {
    bodySystemAilmentRows.push({
      body_system_id: bs.id,
      ailment_id: ailment.id,
      relevance: mapping.relevance || 'primary',
      notes: mapping.notes || ''
    })
  }
}

for (const corr of bsData.plant_part_correspondences) {
  const bs = bsByName.get(corr.body_system)
  if (bs) {
    bodySystemPlantPartRows.push({
      id: bsppIdCounter++,
      body_system_id: bs.id,
      plant_id: null,
      part_type: corr.part_type || null,
      correspondence_type: corr.correspondence_type || 'traditional_herbalism',
      signature_description: corr.signature_description || null,
      therapeutic_action: corr.therapeutic_action || null,
      is_food: corr.is_food || 0,
      food_name: corr.food_name || null,
      notes: corr.notes || null
    })
  }
}

// Indexes
export const bsAilmentsByBsId = new Map<number, BodySystemAilmentRow[]>()
for (const r of bodySystemAilmentRows) {
  const arr = bsAilmentsByBsId.get(r.body_system_id) || []
  arr.push(r)
  bsAilmentsByBsId.set(r.body_system_id, arr)
}

export const bsPlantPartsByBsId = new Map<number, BodySystemPlantPartRow[]>()
for (const r of bodySystemPlantPartRows) {
  const arr = bsPlantPartsByBsId.get(r.body_system_id) || []
  arr.push(r)
  bsPlantPartsByBsId.set(r.body_system_id, arr)
}

// ══════════════════════════════════════════════════════════
// 8. TEACHINGS, PRESENCE, JOURNAL PROMPTS
// ══════════════════════════════════════════════════════════
export interface TeachingRow {
  id: number; plant_id: number; energetic_teaching: string; mental_teaching: string
  physical_teaching: string; spiritual_teaching: string; activation_principle: string
  created_at: string
}

export interface PresenceRow {
  id: number; plant_id: number; home_placement: string; field_interaction: string
  energetic_gift: string; presence_practice: string; spatial_influence: string
  created_at: string
}

export interface JournalPromptRow {
  id: number; plant_id: number | null; prompt_text: string; prompt_category: string
}

const tData = teachingsRaw as any
export const teachings: TeachingRow[] = []
export const presenceRows: PresenceRow[] = []
export const journalPrompts: JournalPromptRow[] = []

let teachingIdCounter = 1
let presenceIdCounter = 1
let promptIdCounter = 1

for (const t of tData.teachings) {
  const plant = plantByCommonName.get(t.plant)
  if (plant) {
    teachings.push({
      id: teachingIdCounter++,
      plant_id: plant.id,
      energetic_teaching: t.energetic_teaching || '',
      mental_teaching: t.mental_teaching || '',
      physical_teaching: t.physical_teaching || '',
      spiritual_teaching: t.spiritual_teaching || '',
      activation_principle: t.activation_principle || '',
      created_at: now
    })
  }
}

if (tData.presence_energetics) {
  for (const p of tData.presence_energetics) {
    const plant = plantByCommonName.get(p.plant)
    if (plant) {
      presenceRows.push({
        id: presenceIdCounter++,
        plant_id: plant.id,
        home_placement: p.home_placement || '',
        field_interaction: p.field_interaction || '',
        energetic_gift: p.energetic_gift || '',
        presence_practice: p.presence_practice || '',
        spatial_influence: p.spatial_influence || '',
        created_at: now
      })
    }
  }
}

for (const prompt of tData.prompts) {
  const plant = prompt.plant ? plantByCommonName.get(prompt.plant) : undefined
  journalPrompts.push({
    id: promptIdCounter++,
    plant_id: plant?.id ?? null,
    prompt_text: prompt.prompt_text,
    prompt_category: prompt.prompt_category
  })
}

export const teachingsByPlantId = new Map(teachings.map(t => [t.plant_id, t]))
export const presenceByPlantId = new Map(presenceRows.map(p => [p.plant_id, p]))
export const promptById = new Map(journalPrompts.map(p => [p.id, p]))

// ══════════════════════════════════════════════════════════
// 9. ETHICAL PRACTICE
// ══════════════════════════════════════════════════════════
export interface EthicalPracticeRow {
  id: number; plant_id: number; [key: string]: any
}

export const ethicalPracticeRows: EthicalPracticeRow[] = []
let epIdCounter = 1

for (const entry of (ethicalPracticeRaw as any[])) {
  const plant = plantByCommonName.get(entry.plant)
  if (plant) {
    ethicalPracticeRows.push({
      id: epIdCounter++,
      plant_id: plant.id,
      use_context_daily: entry.use_context_daily || null,
      use_context_practitioner: entry.use_context_practitioner || null,
      use_context_ceremonial: entry.use_context_ceremonial || null,
      use_context_group_vs_private: entry.use_context_group_vs_private || null,
      cultural_respect_notes: entry.cultural_respect_notes || null,
      misuse_risks: entry.misuse_risks || null,
      facilitator_qualifications: entry.facilitator_qualifications || null,
      facilitator_qualities: entry.facilitator_qualities || null,
      facilitator_red_flags: entry.facilitator_red_flags || null,
      preparation_framework: entry.preparation_framework || null,
      physiological_contraindications: entry.physiological_contraindications || null,
      psychological_considerations: entry.psychological_considerations || null,
      environmental_considerations: entry.environmental_considerations || null,
      dosage_sensitivity: entry.dosage_sensitivity || null,
      interaction_notes: entry.interaction_notes || null,
      contraindication_severity: entry.contraindication_severity || null,
      native_ecosystems: entry.native_ecosystems || null,
      wildcrafted_vs_cultivated: entry.wildcrafted_vs_cultivated || null,
      sustainable_harvesting: entry.sustainable_harvesting || null,
      ethical_sourcing_concerns: entry.ethical_sourcing_concerns || null,
      sourcing_standards: entry.sourcing_standards || null,
      traditional_preparation: entry.traditional_preparation || null,
      modern_preparation: entry.modern_preparation || null,
      preparation_potency_notes: entry.preparation_potency_notes || null,
      intentional_practices: entry.intentional_practices || null,
      psychospiritual_effects: entry.psychospiritual_effects || null,
      archetypal_resonance: entry.archetypal_resonance || null,
      nervous_system_influence: entry.nervous_system_influence || null,
      consciousness_interaction: entry.consciousness_interaction || null,
      spirit_teaching: entry.spirit_teaching || null,
      integration_body: entry.integration_body || null,
      integration_heart: entry.integration_heart || null,
      integration_mind: entry.integration_mind || null,
      integration_spirit: entry.integration_spirit || null,
      healthy_integration_signs: entry.healthy_integration_signs || null,
      incomplete_integration_signs: entry.incomplete_integration_signs || null,
      when_to_seek_support: entry.when_to_seek_support || null,
      created_at: now
    })
  }
}

export const ethicalPracticeByPlantId = new Map(ethicalPracticeRows.map(e => [e.plant_id, e]))

// ══════════════════════════════════════════════════════════
// 10. WELLNESS GOALS
// ══════════════════════════════════════════════════════════
export interface WellnessCategoryRow {
  id: number; name: string; slug: string; description: string
  icon: string; sort_order: number; created_at: string
}

export interface WellnessGoalRow {
  id: number; category_id: number; name: string; description: string
  desired_outcome: string | null; body_system: string | null
  evidence_summary: string | null; lifestyle_notes: string | null; created_at: string
}

export interface PlantWellnessGoalRow {
  id: number; plant_id: number; wellness_goal_id: number
  plant_part_id: number | null; preparation_id: number | null
  mechanism: string | null; efficacy_notes: string | null; evidence_level: string
  dosage_notes: string | null; notes: string | null
}

const wData = wellnessRaw as any
export const wellnessCategories: WellnessCategoryRow[] = wData.wellness_categories.map((c: any, i: number) => ({
  id: i + 1,
  name: c.name,
  slug: c.slug,
  description: c.description || '',
  icon: c.icon || '',
  sort_order: c.sort_order ?? i,
  created_at: now
}))

const wcatByName = new Map(wellnessCategories.map(c => [c.name, c]))
const wcatById = new Map(wellnessCategories.map(c => [c.id, c]))

export const wellnessGoals: WellnessGoalRow[] = []
let wgIdCounter = 1

for (const goal of wData.wellness_goals) {
  const cat = wcatByName.get(goal.category)
  if (cat) {
    wellnessGoals.push({
      id: wgIdCounter++,
      category_id: cat.id,
      name: goal.name,
      description: goal.description || '',
      desired_outcome: goal.desired_outcome || null,
      body_system: goal.body_system || null,
      evidence_summary: goal.evidence_summary || null,
      lifestyle_notes: goal.lifestyle_notes || null,
      created_at: now
    })
  }
}

const wgByName = new Map(wellnessGoals.map(g => [g.name, g]))
const wgById = new Map(wellnessGoals.map(g => [g.id, g]))

export const plantWellnessGoals: PlantWellnessGoalRow[] = []
let pwgIdCounter = 1

for (const mapping of wData.plant_wellness_mappings) {
  const plant = plantByCommonName.get(mapping.plant)
  const goal = wgByName.get(mapping.goal)
  if (plant && goal) {
    plantWellnessGoals.push({
      id: pwgIdCounter++,
      plant_id: plant.id,
      wellness_goal_id: goal.id,
      plant_part_id: null,
      preparation_id: null,
      mechanism: mapping.mechanism || null,
      efficacy_notes: mapping.efficacy_notes || null,
      evidence_level: mapping.evidence_level || 'traditional',
      dosage_notes: mapping.dosage_notes || null,
      notes: null
    })
  }
}

export const pwgByGoalId = new Map<number, PlantWellnessGoalRow[]>()
for (const r of plantWellnessGoals) {
  const arr = pwgByGoalId.get(r.wellness_goal_id) || []
  arr.push(r)
  pwgByGoalId.set(r.wellness_goal_id, arr)
}

// ══════════════════════════════════════════════════════════
// 11. HMBS ASSOCIATIONS
// ══════════════════════════════════════════════════════════
export interface HMBSRow {
  id: number; plant_id: number; domain: string; strength: string
  reason: string | null; plant_part_affinity: string | null
}

export const hmbsAssociations: HMBSRow[] = []
let hmbsIdCounter = 1

for (const entry of (hmbsRaw as any[])) {
  const plant = plantByCommonName.get(entry.plant)
  if (plant && entry.associations) {
    for (const assoc of entry.associations) {
      hmbsAssociations.push({
        id: hmbsIdCounter++,
        plant_id: plant.id,
        domain: assoc.domain,
        strength: assoc.strength || 'primary',
        reason: assoc.reason || null,
        plant_part_affinity: assoc.plant_part_affinity || null
      })
    }
  }
}

export const hmbsByPlantId = new Map<number, HMBSRow[]>()
for (const h of hmbsAssociations) {
  const arr = hmbsByPlantId.get(h.plant_id) || []
  arr.push(h)
  hmbsByPlantId.set(h.plant_id, arr)
}

// ══════════════════════════════════════════════════════════
// NO AILMENT-PLANET / AILMENT-ZODIAC in seed data
// These junction tables exist in schema but have no seed data
// The Electron app still queries them, so we provide empty arrays
// ══════════════════════════════════════════════════════════
export const ailmentPlanetAssocs: { ailment_id: number; planet_id: number; notes: string }[] = []
export const ailmentZodiacAssocs: { ailment_id: number; zodiac_sign_id: number; notes: string }[] = []

// ══════════════════════════════════════════════════════════
// RE-EXPORTS for api.ts
// ══════════════════════════════════════════════════════════
export {
  planetById, planetByName,
  zodiacById, zodiacByName,
  prepById, ailmentById,
  compoundById,
  plantById, plantByCommonName,
  bsById, bsByName,
  wcatById, wgById, wgByName,
  partById
}
