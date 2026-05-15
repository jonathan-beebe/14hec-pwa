/**
 * Drop-in replacement for window.api (Electron IPC bridge).
 * All methods return Promises to match the existing async interface.
 */

import {
  allPlants, plantById, plantByCommonName,
  plantParts, partsByPlantId, partById,
  planetAssocsByPlantId, zodiacAssocsByPlantId,
  ailmentAssocsByPlantId, ailmentAssocsByAilmentId,
  compoundsByPlantId, contraindicationsByPlantId, contraindicationsByAilmentId,
  planets, planetById as planetByIdMap, planetByName,
  zodiacSigns, zodiacById as zodiacByIdMap,
  preparations, prepById as prepByIdMap,
  ailments, ailmentById as ailmentByIdMap,
  compounds, compoundById as compoundByIdMap,
  bodySystemRows, bsById, bsByName,
  bsAilmentsByBsId, bsPlantPartsByBsId,
  teachings, teachingsByPlantId, presenceByPlantId,
  ethicalPracticeByPlantId,
  journalPrompts, promptById,
  wellnessCategories, wellnessGoals, wgById, wcatById,
  plantWellnessGoals, pwgByGoalId,
  hmbsAssociations, hmbsByPlantId,
  plantPlanetAssocs, plantZodiacAssocs, plantAilments, contraindications,
  ailmentPlanetAssocs, ailmentZodiacAssocs,
  type PlantRow
} from './db'

import { journalStore } from './journal-store'
import { collectionsStore } from './collections-store'

import type {
  Plant, PlantDetail, PlantPart, Ailment, AilmentDetail,
  PlanetAssociation, ZodiacAssociation, AilmentAssociation,
  Compound, ResearchNote, Contraindication, PlantContraindication,
  Preparation, PlanetData, ZodiacSign,
  CrossRefResult, ContraindicationResult,
  BodySystem, BodySystemDetail, BodySystemAilment, BodySystemPlantPart,
  PlantTeaching, PlantTeachingWithPlant, PlantPresenceEnergetics, EthicalPractice,
  JournalPrompt, JournalEntry,
  WellnessCategory, WellnessGoal, WellnessGoalDetail, WellnessPlantRecommendation,
  HMBSPlant, PlantHMBSAssociation, HMBSDomainSummary,
  Collection, CollectionDetail, CollectionForPlant
} from '@/types'

// ── Helper: severity sort key ─────────────────────────────
function severityOrder(s: string): number {
  if (s === 'high') return 1
  if (s === 'moderate') return 2
  return 3
}

function strengthOrder(s: string): number {
  if (s === 'primary') return 1
  if (s === 'secondary') return 2
  return 3
}

function relevanceOrder(s: string): number {
  if (s === 'primary') return 1
  if (s === 'secondary') return 2
  return 3
}

// ══════════════════════════════════════════════════════════
// API object — mirrors window.api exactly
// ══════════════════════════════════════════════════════════
export const api = {
  // ── Plants ──────────────────────────────────────────
  getPlants: async (filters?: {
    search?: string; category?: string; planet?: string
    zodiacSign?: string; element?: string; plantPart?: string
  }): Promise<Plant[]> => {
    let result = [...allPlants]

    if (filters?.planet) {
      const planet = planetByName.get(filters.planet)
      if (!planet) return []
      const plantIds = new Set(
        plantPlanetAssocs.filter(a => a.planet_id === planet.id).map(a => a.plant_id)
      )
      result = result.filter(p => plantIds.has(p.id))
    }

    if (filters?.zodiacSign) {
      const sign = Array.from(zodiacSigns).find(z => z.name === filters.zodiacSign)
      if (!sign) return []
      const plantIds = new Set(
        plantZodiacAssocs.filter(a => a.zodiac_sign_id === sign.id).map(a => a.plant_id)
      )
      result = result.filter(p => plantIds.has(p.id))
    }

    if (filters?.element) {
      const signIds = new Set(zodiacSigns.filter(z => z.element === filters.element).map(z => z.id))
      const plantIds = new Set(
        plantZodiacAssocs.filter(a => signIds.has(a.zodiac_sign_id)).map(a => a.plant_id)
      )
      result = result.filter(p => plantIds.has(p.id))
    }

    if (filters?.plantPart) {
      const plantIds = new Set(
        plantParts.filter(pp => pp.part_type === filters.plantPart).map(pp => pp.plant_id)
      )
      result = result.filter(p => plantIds.has(p.id))
    }

    if (filters?.category) {
      result = result.filter(p => p.category === filters.category)
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(p =>
        p.common_name.toLowerCase().includes(s) ||
        p.latin_name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      )
    }

    result.sort((a, b) => a.common_name.localeCompare(b.common_name))
    return result as Plant[]
  },

  getPlantById: async (id: number): Promise<PlantDetail | null> => {
    const plant = plantById.get(id)
    if (!plant) return null

    const parts = partsByPlantId.get(id) || []

    const planetAssocs = (planetAssocsByPlantId.get(id) || []).map(a => {
      const planet = planetByIdMap.get(a.planet_id)!
      return {
        plant_id: a.plant_id,
        planet_id: a.planet_id,
        association_type: a.association_type,
        notes: a.notes,
        planet_name: planet.name,
        planet_symbol: planet.symbol,
        planet_energy: planet.energetic_quality
      } as PlanetAssociation
    })

    const zodiacAssocs = (zodiacAssocsByPlantId.get(id) || []).map(a => {
      const sign = zodiacByIdMap.get(a.zodiac_sign_id)!
      return {
        plant_id: a.plant_id,
        zodiac_sign_id: a.zodiac_sign_id,
        notes: a.notes,
        sign_name: sign.name,
        sign_symbol: sign.symbol,
        element: sign.element
      } as ZodiacAssociation
    })

    const ailmentAssocs = (ailmentAssocsByPlantId.get(id) || []).map(a => {
      const ailment = ailmentByIdMap.get(a.ailment_id)!
      const part = a.plant_part_id ? partById.get(a.plant_part_id) : null
      const prep = a.preparation_id ? prepByIdMap.get(a.preparation_id) : null
      return {
        id: a.id,
        plant_id: a.plant_id,
        ailment_id: a.ailment_id,
        ailment_name: ailment.name,
        ailment_category: ailment.category,
        body_system: ailment.body_system,
        part_type: part?.part_type || null,
        preparation_name: prep?.name || null,
        efficacy_notes: a.efficacy_notes,
        evidence_level: a.evidence_level,
        dosage_notes: a.dosage_notes
      } as AilmentAssociation
    })

    const compoundAssocs = (compoundsByPlantId.get(id) || []).map(c => {
      const compound = compoundByIdMap.get(c.compound_id)!
      return {
        ...compound,
        concentration_notes: c.concentration_notes
      } as Compound
    })

    const contras = (contraindicationsByPlantId.get(id) || [])
      .map(c => {
        const ailment = ailmentByIdMap.get(c.ailment_id)!
        return {
          id: c.id,
          plant_id: c.plant_id,
          ailment_id: c.ailment_id,
          ailment_name: ailment.name,
          ailment_category: ailment.category,
          reason: c.reason,
          severity: c.severity,
          notes: c.notes
        } as Contraindication
      })
      .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity))

    const teaching = teachingsByPlantId.get(id) || null
    const presence = presenceByPlantId.get(id) || null
    const ethical = ethicalPracticeByPlantId.get(id) || null

    return {
      ...plant,
      parts: parts as PlantPart[],
      planetAssociations: planetAssocs,
      zodiacAssociations: zodiacAssocs,
      ailmentAssociations: ailmentAssocs,
      compounds: compoundAssocs,
      researchNotes: [] as ResearchNote[],
      contraindications: contras,
      teachings: teaching as PlantTeaching | null,
      presenceEnergetics: presence as PlantPresenceEnergetics | null,
      ethicalPractice: ethical as EthicalPractice | null
    } as PlantDetail
  },

  // ── Ailments ──────────────────────────────────────────
  getAilments: async (filters?: {
    category?: string; bodySystem?: string; search?: string
  }): Promise<Ailment[]> => {
    let result = [...ailments]
    if (filters?.category) result = result.filter(a => a.category === filters.category)
    if (filters?.bodySystem) result = result.filter(a => a.body_system === filters.bodySystem)
    if (filters?.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(s) || a.description.toLowerCase().includes(s)
      )
    }
    result.sort((a, b) => a.name.localeCompare(b.name))
    return result as Ailment[]
  },

  getAilmentById: async (id: number): Promise<AilmentDetail | null> => {
    const ailment = ailmentByIdMap.get(id)
    if (!ailment) return null

    const plantRecs = (ailmentAssocsByAilmentId.get(id) || []).map(a => {
      const plant = plantById.get(a.plant_id)!
      const part = a.plant_part_id ? partById.get(a.plant_part_id) : null
      const prep = a.preparation_id ? prepByIdMap.get(a.preparation_id) : null
      return {
        plant_id: a.plant_id,
        common_name: plant.common_name,
        latin_name: plant.latin_name,
        plant_category: plant.category,
        part_type: part?.part_type || null,
        preparation_name: prep?.name || null,
        efficacy_notes: a.efficacy_notes,
        evidence_level: a.evidence_level,
        dosage_notes: a.dosage_notes
      }
    }).sort((a, b) => a.common_name.localeCompare(b.common_name))

    const planetAssocs = ailmentPlanetAssocs
      .filter(a => a.ailment_id === id)
      .map(a => {
        const p = planetByIdMap.get(a.planet_id)!
        return { planet_name: p.name, symbol: p.symbol, notes: a.notes }
      })

    const zodiacAssocs = ailmentZodiacAssocs
      .filter(a => a.ailment_id === id)
      .map(a => {
        const z = zodiacByIdMap.get(a.zodiac_sign_id)!
        return { sign_name: z.name, symbol: z.symbol, notes: a.notes }
      })

    const plantsToAvoid = (contraindicationsByAilmentId.get(id) || [])
      .map(c => {
        const plant = plantById.get(c.plant_id)!
        return {
          id: c.id,
          plant_id: c.plant_id,
          ailment_id: c.ailment_id,
          common_name: plant.common_name,
          latin_name: plant.latin_name,
          plant_category: plant.category,
          reason: c.reason,
          severity: c.severity,
          notes: c.notes
        } as PlantContraindication
      })
      .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity) || a.common_name.localeCompare(b.common_name))

    return {
      ...ailment,
      plantRecommendations: plantRecs,
      planetAssociations: planetAssocs,
      zodiacAssociations: zodiacAssocs,
      plantsToAvoid
    } as AilmentDetail
  },

  // ── Astrology ──────────────────────────────────────────
  getZodiacSigns: async (): Promise<ZodiacSign[]> => {
    return zodiacSigns.map(z => {
      const planet = z.ruling_planet_id ? planetByIdMap.get(z.ruling_planet_id) : null
      return {
        ...z,
        ruling_planet_name: planet?.name || '',
        ruling_planet_symbol: planet?.symbol || ''
      } as ZodiacSign
    })
  },

  getZodiacSignById: async (id: number): Promise<ZodiacSign | null> => {
    const sign = zodiacByIdMap.get(id)
    if (!sign) return null
    const planet = sign.ruling_planet_id ? planetByIdMap.get(sign.ruling_planet_id) : null

    const signPlants = plantZodiacAssocs
      .filter(a => a.zodiac_sign_id === id)
      .map(a => plantById.get(a.plant_id)!)
      .sort((a, b) => a.common_name.localeCompare(b.common_name))

    const signAilments = ailmentZodiacAssocs
      .filter(a => a.zodiac_sign_id === id)
      .map(a => ailmentByIdMap.get(a.ailment_id)!)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      ...sign,
      ruling_planet_name: planet?.name || '',
      ruling_planet_symbol: planet?.symbol || '',
      plants: signPlants,
      ailments: signAilments
    } as ZodiacSign
  },

  getPlanets: async (): Promise<PlanetData[]> => {
    return planets as PlanetData[]
  },

  getPlanetById: async (id: number): Promise<PlanetData | null> => {
    const planet = planetByIdMap.get(id)
    if (!planet) return null

    const planetPlants = plantPlanetAssocs
      .filter(a => a.planet_id === id)
      .map(a => plantById.get(a.plant_id)!)
      .sort((a, b) => a.common_name.localeCompare(b.common_name))

    return { ...planet, plants: planetPlants } as PlanetData
  },

  // ── Preparations ──────────────────────────────────────
  getPreparations: async (): Promise<Preparation[]> => {
    return [...preparations].sort((a, b) => a.name.localeCompare(b.name)) as Preparation[]
  },

  getPreparationById: async (id: number): Promise<Preparation | null> => {
    return (prepByIdMap.get(id) as Preparation) || null
  },

  // ── Cross-Reference ──────────────────────────────────
  crossReference: async (params: {
    ailmentId?: number; zodiacSignId?: number; planetId?: string
    plantPart?: string; preparationId?: number
  }): Promise<CrossRefResult[]> => {
    let results = plantAilments.map(pa => {
      const plant = plantById.get(pa.plant_id)!
      const ailment = ailmentByIdMap.get(pa.ailment_id)!
      const part = pa.plant_part_id ? partById.get(pa.plant_part_id) : null
      const prep = pa.preparation_id ? prepByIdMap.get(pa.preparation_id) : null
      return {
        _pa: pa,
        id: plant.id,
        common_name: plant.common_name,
        latin_name: plant.latin_name,
        category: plant.category,
        energetic_quality: plant.energetic_quality,
        efficacy_notes: pa.efficacy_notes,
        evidence_level: pa.evidence_level,
        dosage_notes: pa.dosage_notes,
        part_type: part?.part_type || null,
        preparation_name: prep?.name || null,
        ailment_name: ailment.name
      }
    })

    if (params.ailmentId) {
      results = results.filter(r => r._pa.ailment_id === params.ailmentId)
    }
    if (params.zodiacSignId) {
      const plantIds = new Set(
        plantZodiacAssocs.filter(a => a.zodiac_sign_id === params.zodiacSignId).map(a => a.plant_id)
      )
      results = results.filter(r => plantIds.has(r.id))
    }
    if (params.planetId) {
      const pid = Number(params.planetId)
      const plantIds = new Set(
        plantPlanetAssocs.filter(a => a.planet_id === pid).map(a => a.plant_id)
      )
      results = results.filter(r => plantIds.has(r.id))
    }
    if (params.plantPart) {
      results = results.filter(r => r.part_type === params.plantPart)
    }
    if (params.preparationId) {
      results = results.filter(r => r._pa.preparation_id === params.preparationId)
    }

    // Deduplicate and sort
    const seen = new Set<string>()
    const deduped: CrossRefResult[] = []
    for (const r of results) {
      const key = `${r.id}-${r.ailment_name}-${r.part_type}-${r.preparation_name}`
      if (!seen.has(key)) {
        seen.add(key)
        const { _pa, ...rest } = r
        deduped.push(rest as CrossRefResult)
      }
    }
    deduped.sort((a, b) => a.common_name.localeCompare(b.common_name))
    return deduped
  },

  getCrossRefDataset: async () => ({
    rows: plantAilments.map(pa => ({
      plantId: pa.plant_id,
      ailmentId: pa.ailment_id,
      partType: pa.plant_part_id ? partById.get(pa.plant_part_id)?.part_type ?? null : null,
      preparationId: pa.preparation_id,
    })),
    plantZodiac: plantZodiacAssocs.map(a => ({
      plantId: a.plant_id,
      zodiacSignId: a.zodiac_sign_id,
    })),
    plantPlanet: plantPlanetAssocs.map(a => ({
      plantId: a.plant_id,
      planetId: a.planet_id,
    })),
  }),

  crossReferenceContraindications: async (params: {
    ailmentId?: number; zodiacSignId?: number; planetId?: string
  }): Promise<ContraindicationResult[]> => {
    let results = contraindications.map(c => {
      const plant = plantById.get(c.plant_id)!
      const ailment = ailmentByIdMap.get(c.ailment_id)!
      return {
        _c: c,
        id: plant.id,
        common_name: plant.common_name,
        latin_name: plant.latin_name,
        category: plant.category,
        reason: c.reason,
        severity: c.severity,
        notes: c.notes,
        ailment_name: ailment.name
      }
    })

    if (params.ailmentId) {
      results = results.filter(r => r._c.ailment_id === params.ailmentId)
    }
    if (params.zodiacSignId) {
      const plantIds = new Set(
        plantZodiacAssocs.filter(a => a.zodiac_sign_id === params.zodiacSignId).map(a => a.plant_id)
      )
      results = results.filter(r => plantIds.has(r.id))
    }
    if (params.planetId) {
      const pid = Number(params.planetId)
      const plantIds = new Set(
        plantPlanetAssocs.filter(a => a.planet_id === pid).map(a => a.plant_id)
      )
      results = results.filter(r => plantIds.has(r.id))
    }

    const seen = new Set<string>()
    const deduped: ContraindicationResult[] = []
    for (const r of results) {
      const key = `${r.id}-${r.ailment_name}`
      if (!seen.has(key)) {
        seen.add(key)
        const { _c, ...rest } = r
        deduped.push(rest as ContraindicationResult)
      }
    }
    deduped.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity) || a.common_name.localeCompare(b.common_name))
    return deduped
  },

  // ── Compounds ──────────────────────────────────────────
  getCompounds: async (): Promise<Compound[]> => {
    return [...compounds].sort((a, b) => a.name.localeCompare(b.name)) as Compound[]
  },

  // ── Body Systems ──────────────────────────────────────
  getBodySystems: async (): Promise<BodySystem[]> => {
    return bodySystemRows.map(bs => {
      const planet = bs.ruling_planet_id ? planetByIdMap.get(bs.ruling_planet_id) : null
      const zodiac = bs.zodiac_sign_id ? zodiacByIdMap.get(bs.zodiac_sign_id) : null
      return {
        ...bs,
        ruling_planet_name: planet?.name || null,
        ruling_planet_symbol: planet?.symbol || null,
        zodiac_sign_name: zodiac?.name || null,
        zodiac_sign_symbol: zodiac?.symbol || null
      }
    }).sort((a, b) => a.name.localeCompare(b.name)) as any[]
  },

  getBodySystemById: async (id: number): Promise<BodySystemDetail | null> => {
    return getBodySystemDetail(bs => bs.id === id)
  },

  getBodySystemByName: async (name: string): Promise<BodySystemDetail | null> => {
    return getBodySystemDetail(bs => bs.name === name)
  },

  // ── Plant Teachings ──────────────────────────────────
  getAllTeachings: async (): Promise<PlantTeachingWithPlant[]> => {
    return teachings.map(t => {
      const plant = plantById.get(t.plant_id)!
      return {
        ...t,
        common_name: plant.common_name,
        latin_name: plant.latin_name,
        category: plant.category
      } as PlantTeachingWithPlant
    }).sort((a, b) => a.common_name.localeCompare(b.common_name))
  },

  getTeachingsByPlantId: async (plantId: number): Promise<PlantTeaching | null> => {
    return (teachingsByPlantId.get(plantId) as PlantTeaching) || null
  },

  // ── Presence Energetics ──────────────────────────────
  getPresenceByPlantId: async (plantId: number): Promise<PlantPresenceEnergetics | null> => {
    return (presenceByPlantId.get(plantId) as PlantPresenceEnergetics) || null
  },

  // ── Ethical Practice ──────────────────────────────────
  getEthicalPracticeByPlantId: async (plantId: number): Promise<EthicalPractice | null> => {
    return (ethicalPracticeByPlantId.get(plantId) as EthicalPractice) || null
  },

  // ── Journal ──────────────────────────────────────────
  getJournalPrompts: async (filters?: {
    plantId?: number | null; category?: string
  }): Promise<JournalPrompt[]> => {
    let result = [...journalPrompts]

    if (filters?.plantId !== undefined) {
      if (filters.plantId === null) {
        result = result.filter(p => p.plant_id === null)
      } else {
        result = result.filter(p => p.plant_id === filters.plantId || p.plant_id === null)
      }
    }

    if (filters?.category) {
      result = result.filter(p => p.prompt_category === filters.category)
    }

    // Sort: plant-specific first, then by category, then id
    result.sort((a, b) => {
      const aHasPlant = a.plant_id !== null ? 0 : 1
      const bHasPlant = b.plant_id !== null ? 0 : 1
      if (aHasPlant !== bHasPlant) return aHasPlant - bHasPlant
      if (a.prompt_category !== b.prompt_category) return a.prompt_category.localeCompare(b.prompt_category)
      return a.id - b.id
    })

    return result.map(p => {
      const plant = p.plant_id ? plantById.get(p.plant_id) : null
      return { ...p, plant_name: plant?.common_name } as JournalPrompt
    })
  },

  getJournalEntries: async (filters?: {
    plantId?: number; search?: string
  }): Promise<JournalEntry[]> => {
    return journalStore.getEntries(filters)
  },

  getJournalEntryById: async (id: number): Promise<JournalEntry | null> => {
    const all = await journalStore.getEntries()
    return all.find((e) => e.id === id) ?? null
  },

  createJournalEntry: async (entry: {
    plant_id?: number | null; prompt_id?: number | null
    title?: string | null; content: string
    mood?: string | null; season?: string | null; entry_date?: string | null
  }): Promise<{ id: number }> => {
    return journalStore.createEntry(entry)
  },

  updateJournalEntry: async (id: number, updates: {
    title?: string | null; content?: string
    mood?: string | null; season?: string | null; entry_date?: string | null
  }): Promise<{ success: boolean }> => {
    return journalStore.updateEntry(id, updates)
  },

  deleteJournalEntry: async (id: number): Promise<{ success: boolean }> => {
    return journalStore.deleteEntry(id)
  },

  // ── Wellness Goals ──────────────────────────────────
  getWellnessCategories: async (): Promise<WellnessCategory[]> => {
    return wellnessCategories.map(c => ({
      ...c,
      goal_count: wellnessGoals.filter(g => g.category_id === c.id).length
    })).sort((a, b) => a.sort_order - b.sort_order) as WellnessCategory[]
  },

  getWellnessGoals: async (): Promise<WellnessGoal[]> => {
    return wellnessGoals
      .map(g => {
        const cat = wcatById.get(g.category_id)!
        return {
          ...g,
          category_name: cat.name,
          category_slug: cat.slug,
          plant_count: (pwgByGoalId.get(g.id) || []).length
        }
      })
      .sort((a, b) => {
        const catA = wcatById.get(a.category_id)!
        const catB = wcatById.get(b.category_id)!
        if (catA.sort_order !== catB.sort_order) return catA.sort_order - catB.sort_order
        return a.name.localeCompare(b.name)
      }) as WellnessGoal[]
  },

  getWellnessGoalsByCategory: async (categoryId: number): Promise<WellnessGoal[]> => {
    const cat = wcatById.get(categoryId)
    if (!cat) return []
    return wellnessGoals
      .filter(g => g.category_id === categoryId)
      .map(g => ({
        ...g,
        category_name: cat.name,
        category_slug: cat.slug,
        plant_count: (pwgByGoalId.get(g.id) || []).length
      }))
      .sort((a, b) => a.name.localeCompare(b.name)) as WellnessGoal[]
  },

  getWellnessGoalById: async (id: number): Promise<WellnessGoalDetail | null> => {
    const goal = wgById.get(id)
    if (!goal) return null
    const cat = wcatById.get(goal.category_id)!

    const plantRecs = (pwgByGoalId.get(id) || []).map(pwg => {
      const plant = plantById.get(pwg.plant_id)!
      const part = pwg.plant_part_id ? partById.get(pwg.plant_part_id) : null
      const prep = pwg.preparation_id ? prepByIdMap.get(pwg.preparation_id) : null
      return {
        id: pwg.id,
        plant_id: pwg.plant_id,
        wellness_goal_id: pwg.wellness_goal_id,
        common_name: plant.common_name,
        latin_name: plant.latin_name,
        plant_category: plant.category,
        part_type: part?.part_type || null,
        preparation_name: prep?.name || null,
        mechanism: pwg.mechanism,
        efficacy_notes: pwg.efficacy_notes,
        evidence_level: pwg.evidence_level,
        dosage_notes: pwg.dosage_notes,
        notes: pwg.notes
      } as WellnessPlantRecommendation
    }).sort((a, b) => a.common_name.localeCompare(b.common_name))

    return {
      ...goal,
      category_name: cat.name,
      category_slug: cat.slug,
      category_icon: cat.icon,
      plant_count: plantRecs.length,
      plantRecommendations: plantRecs
    } as WellnessGoalDetail
  },

  searchWellnessGoals: async (search: string): Promise<WellnessGoal[]> => {
    const s = search.toLowerCase()
    return wellnessGoals
      .filter(g => {
        const cat = wcatById.get(g.category_id)
        return g.name.toLowerCase().includes(s) ||
               g.description.toLowerCase().includes(s) ||
               (g.desired_outcome || '').toLowerCase().includes(s) ||
               (cat?.name || '').toLowerCase().includes(s)
      })
      .map(g => {
        const cat = wcatById.get(g.category_id)!
        return {
          ...g,
          category_name: cat.name,
          category_slug: cat.slug,
          plant_count: (pwgByGoalId.get(g.id) || []).length
        }
      })
      .sort((a, b) => {
        const catA = wcatById.get(a.category_id)!
        const catB = wcatById.get(b.category_id)!
        if (catA.sort_order !== catB.sort_order) return catA.sort_order - catB.sort_order
        return a.name.localeCompare(b.name)
      }) as WellnessGoal[]
  },

  // ── HMBS Associations ──────────────────────────────────
  getHMBSPlants: async (domain?: string, strength?: string): Promise<HMBSPlant[]> => {
    let result = hmbsAssociations

    if (domain) result = result.filter(h => h.domain === domain)
    if (strength) result = result.filter(h => h.strength === strength)

    return result
      .map(h => {
        const plant = plantById.get(h.plant_id)!
        return {
          plant_id: h.plant_id,
          common_name: plant.common_name,
          latin_name: plant.latin_name,
          category: plant.category,
          domain: h.domain,
          strength: h.strength,
          reason: h.reason,
          plant_part_affinity: h.plant_part_affinity,
          energetic_quality: plant.energetic_quality
        } as HMBSPlant
      })
      .sort((a, b) => strengthOrder(a.strength) - strengthOrder(b.strength) || a.common_name.localeCompare(b.common_name))
  },

  getHMBSByPlantId: async (plantId: number): Promise<PlantHMBSAssociation[]> => {
    return ((hmbsByPlantId.get(plantId) || []) as PlantHMBSAssociation[])
      .sort((a, b) => strengthOrder(a.strength) - strengthOrder(b.strength))
  },

  // ── Collections ─────────────────────────────────────
  getCollections: async (): Promise<Collection[]> => collectionsStore.getCollections(),

  getCollectionById: async (id: number): Promise<CollectionDetail | null> =>
    collectionsStore.getCollectionById(id),

  createCollection: async (data: {
    name: string
    description?: string | null
    icon?: string | null
    color?: string | null
  }): Promise<{ id: number }> => collectionsStore.createCollection(data),

  updateCollection: async (id: number, updates: {
    name?: string
    description?: string | null
    icon?: string | null
    color?: string | null
  }): Promise<{ success: boolean }> => collectionsStore.updateCollection(id, updates),

  deleteCollection: async (id: number): Promise<{ success: boolean }> =>
    collectionsStore.deleteCollection(id),

  addPlantToCollection: async (
    collectionId: number,
    plantId: number,
    notes?: string
  ): Promise<{ success: boolean }> =>
    collectionsStore.addPlantToCollection(collectionId, plantId, notes),

  removePlantFromCollection: async (
    collectionId: number,
    plantId: number
  ): Promise<{ success: boolean }> =>
    collectionsStore.removePlantFromCollection(collectionId, plantId),

  getCollectionsForPlant: async (plantId: number): Promise<CollectionForPlant[]> =>
    collectionsStore.getCollectionsForPlant(plantId),

  getHMBSSummary: async (): Promise<HMBSDomainSummary[]> => {
    const domainOrder = ['heart', 'mind', 'body', 'spirit']
    const summary = new Map<string, { total: number; primary: number; secondary: number; tertiary: number }>()

    for (const d of domainOrder) {
      summary.set(d, { total: 0, primary: 0, secondary: 0, tertiary: 0 })
    }

    for (const h of hmbsAssociations) {
      const s = summary.get(h.domain)!
      s.total++
      if (h.strength === 'primary') s.primary++
      else if (h.strength === 'secondary') s.secondary++
      else s.tertiary++
    }

    return domainOrder.map(d => ({
      domain: d as any,
      ...summary.get(d)!
    }))
  }
}

// ── Body system detail helper ─────────────────────────────
function getBodySystemDetail(
  predicate: (bs: typeof bodySystemRows[0]) => boolean
): BodySystemDetail | null {
  const bs = bodySystemRows.find(predicate)
  if (!bs) return null

  const planet = bs.ruling_planet_id ? planetByIdMap.get(bs.ruling_planet_id) : null
  const zodiac = bs.zodiac_sign_id ? zodiacByIdMap.get(bs.zodiac_sign_id) : null

  const bsAilments = (bsAilmentsByBsId.get(bs.id) || [])
    .map(a => {
      const ailment = ailmentByIdMap.get(a.ailment_id)!
      return {
        body_system_id: a.body_system_id,
        ailment_id: a.ailment_id,
        ailment_name: ailment.name,
        ailment_category: ailment.category,
        ailment_description: ailment.description,
        relevance: a.relevance,
        notes: a.notes
      } as BodySystemAilment
    })
    .sort((a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance) || a.ailment_name.localeCompare(b.ailment_name))

  const allParts = bsPlantPartsByBsId.get(bs.id) || []

  const plantPartCorrespondences = allParts
    .filter(p => !p.is_food)
    .map(p => {
      const plant = p.plant_id ? plantById.get(p.plant_id) : null
      return {
        ...p,
        plant_common_name: plant?.common_name || null,
        plant_latin_name: plant?.latin_name || null
      } as BodySystemPlantPart
    })

  const foodCorrespondences = allParts
    .filter(p => p.is_food)
    .map(p => {
      const plant = p.plant_id ? plantById.get(p.plant_id) : null
      return {
        ...p,
        plant_common_name: plant?.common_name || null,
        plant_latin_name: plant?.latin_name || null
      } as BodySystemPlantPart
    })

  return {
    ...bs,
    ruling_planet_name: planet?.name || null,
    ruling_planet_symbol: planet?.symbol || null,
    zodiac_sign_name: zodiac?.name || null,
    zodiac_sign_symbol: zodiac?.symbol || null,
    ailments: bsAilments,
    plantPartCorrespondences,
    foodCorrespondences
  } as BodySystemDetail
}
