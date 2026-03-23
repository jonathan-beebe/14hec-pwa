export interface Plant {
  id: number
  common_name: string
  latin_name: string
  family: string
  genus: string
  species: string
  description: string
  habitat: string
  native_region: string
  category: 'conventional' | 'entheogenic' | 'both'
  energetic_quality: string
  doctrine_of_signatures: string
  safety_notes: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface PlantPart {
  id: number
  plant_id: number
  part_type: string
  typical_compounds: string
  therapeutic_properties: string
  notes: string
}

export interface Contraindication {
  id: number
  plant_id: number
  ailment_id: number
  ailment_name: string
  ailment_category: string
  reason: string
  severity: 'high' | 'moderate' | 'low'
  notes: string
}

export interface ContraindicationResult {
  id: number
  common_name: string
  latin_name: string
  category: string
  reason: string
  severity: string
  notes: string
  ailment_name: string
}

export interface PlantContraindication {
  id: number
  plant_id: number
  ailment_id: number
  common_name: string
  latin_name: string
  plant_category: string
  reason: string
  severity: string
  notes: string
}

export interface PlantDetail extends Plant {
  parts: PlantPart[]
  planetAssociations: PlanetAssociation[]
  zodiacAssociations: ZodiacAssociation[]
  ailmentAssociations: AilmentAssociation[]
  compounds: Compound[]
  researchNotes: ResearchNote[]
  contraindications: Contraindication[]
  teachings: PlantTeaching | null
  presenceEnergetics: PlantPresenceEnergetics | null
}

export interface PlanetAssociation {
  plant_id: number
  planet_id: number
  association_type: string
  notes: string
  planet_name: string
  planet_symbol: string
  planet_energy: string
}

export interface ZodiacAssociation {
  plant_id: number
  zodiac_sign_id: number
  notes: string
  sign_name: string
  sign_symbol: string
  element: string
}

export interface AilmentAssociation {
  id: number
  plant_id: number
  ailment_id: number
  ailment_name: string
  ailment_category: string
  body_system: string
  part_type: string | null
  preparation_name: string | null
  efficacy_notes: string
  evidence_level: string
  dosage_notes: string
}

export interface Ailment {
  id: number
  name: string
  category: 'physical' | 'emotional' | 'spiritual'
  body_system: string
  description: string
  symptoms: string
}

export interface AilmentDetail extends Ailment {
  plantRecommendations: PlantRecommendation[]
  planetAssociations: { planet_name: string; symbol: string; notes: string }[]
  zodiacAssociations: { sign_name: string; symbol: string; notes: string }[]
  plantsToAvoid: PlantContraindication[]
}

export interface PlantRecommendation {
  plant_id: number
  common_name: string
  latin_name: string
  plant_category: string
  part_type: string | null
  preparation_name: string | null
  efficacy_notes: string
  evidence_level: string
  dosage_notes: string
}

export interface Preparation {
  id: number
  name: string
  solvent: string
  best_plant_parts: string
  absorption_speed: string
  concentration_level: string
  shelf_life: string
  general_instructions: string
  safety_notes: string
}

export interface PlanetData {
  id: number
  name: string
  symbol: string
  associated_signs: string
  body_systems: string
  energetic_quality: string
  description: string
  plants?: Plant[]
}

export interface ZodiacSign {
  id: number
  name: string
  symbol: string
  element: 'fire' | 'water' | 'air' | 'earth'
  modality: 'cardinal' | 'fixed' | 'mutable'
  ruling_planet_id: number
  ruling_planet_name: string
  ruling_planet_symbol: string
  date_range_start: string
  date_range_end: string
  body_parts_ruled: string
  description: string
  plants?: Plant[]
  ailments?: Ailment[]
}

export interface Compound {
  id: number
  name: string
  compound_type: string
  pharmacological_action: string
  psychoactive: number
  concentration_notes?: string
}

export interface ResearchNote {
  id: number
  plant_id: number
  title: string
  content: string
  source_url: string
  evidence_type: string
  created_at: string
}

export interface CrossRefResult {
  id: number
  common_name: string
  latin_name: string
  category: string
  energetic_quality: string
  efficacy_notes: string
  evidence_level: string
  dosage_notes: string
  part_type: string | null
  preparation_name: string | null
  ailment_name: string
}

// ── Plant Teachings ──────────────────────────────────────
export interface PlantTeaching {
  id: number
  plant_id: number
  energetic_teaching: string
  mental_teaching: string
  physical_teaching: string
  spiritual_teaching: string
  activation_principle: string
  created_at: string
}

// ── Plant Presence Energetics ──────────────────────────────────────
export interface PlantPresenceEnergetics {
  id: number
  plant_id: number
  home_placement: string
  field_interaction: string
  energetic_gift: string
  presence_practice: string
  spatial_influence: string
  created_at: string
}

// ── Journal ──────────────────────────────────────
export interface JournalPrompt {
  id: number
  plant_id: number | null
  prompt_text: string
  prompt_category: 'energetic' | 'mental' | 'physical' | 'spiritual' | 'integration' | 'relationship'
  plant_name?: string
}

export interface JournalEntry {
  id: number
  plant_id: number | null
  prompt_id: number | null
  title: string | null
  content: string
  mood: string | null
  season: string | null
  entry_date: string
  created_at: string
  updated_at: string
  plant_name?: string
  prompt_text?: string
}

// ── Body Systems ──────────────────────────────────────
export interface BodySystem {
  id: number
  name: string
  category: 'organ' | 'system' | 'tissue' | 'gland' | 'structure'
  description: string
  tcm_element: string | null
  ayurvedic_dosha: string | null
  ruling_planet_id: number | null
  zodiac_sign_id: number | null
  image_url: string | null
  created_at: string
}

export interface BodySystemDetail extends BodySystem {
  ruling_planet_name: string | null
  ruling_planet_symbol: string | null
  zodiac_sign_name: string | null
  zodiac_sign_symbol: string | null
  ailments: BodySystemAilment[]
  plantPartCorrespondences: BodySystemPlantPart[]
  foodCorrespondences: BodySystemPlantPart[]
}

export interface BodySystemAilment {
  body_system_id: number
  ailment_id: number
  ailment_name: string
  ailment_category: string
  ailment_description: string
  relevance: 'primary' | 'secondary' | 'associated'
  notes: string | null
}

export interface BodySystemPlantPart {
  id: number
  body_system_id: number
  plant_id: number | null
  plant_common_name: string | null
  plant_latin_name: string | null
  part_type: string | null
  correspondence_type: 'doctrine_of_signatures' | 'traditional_herbalism' | 'nutritional' | 'tcm' | 'ayurvedic' | 'clinical'
  signature_description: string | null
  therapeutic_action: string | null
  is_food: number
  food_name: string | null
  notes: string | null
}

// ── Wellness Goals ──────────────────────────────────────
export interface WellnessCategory {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  sort_order: number
  goal_count: number
  created_at: string
}

export interface WellnessGoal {
  id: number
  category_id: number
  category_name: string
  category_slug: string
  name: string
  description: string
  desired_outcome: string | null
  body_system: string | null
  evidence_summary: string | null
  lifestyle_notes: string | null
  plant_count: number
  created_at: string
}

export interface WellnessGoalDetail extends WellnessGoal {
  category_icon: string
  plantRecommendations: WellnessPlantRecommendation[]
}

export interface WellnessPlantRecommendation {
  id: number
  plant_id: number
  wellness_goal_id: number
  common_name: string
  latin_name: string
  plant_category: string
  part_type: string | null
  preparation_name: string | null
  mechanism: string | null
  efficacy_notes: string | null
  evidence_level: string
  dosage_notes: string | null
  notes: string | null
}

declare global {
  interface Window {
    api: {
      getPlants: (filters?: any) => Promise<Plant[]>
      getPlantById: (id: number) => Promise<PlantDetail | null>
      getAilments: (filters?: any) => Promise<Ailment[]>
      getAilmentById: (id: number) => Promise<AilmentDetail | null>
      getZodiacSigns: () => Promise<ZodiacSign[]>
      getZodiacSignById: (id: number) => Promise<ZodiacSign | null>
      getPlanets: () => Promise<PlanetData[]>
      getPlanetById: (id: number) => Promise<PlanetData | null>
      getPreparations: () => Promise<Preparation[]>
      getPreparationById: (id: number) => Promise<Preparation | null>
      crossReference: (params: any) => Promise<CrossRefResult[]>
      crossReferenceContraindications: (params: any) => Promise<ContraindicationResult[]>
      getCompounds: () => Promise<Compound[]>

      // Body Systems
      getBodySystems: () => Promise<BodySystem[]>
      getBodySystemById: (id: number) => Promise<BodySystemDetail | null>
      getBodySystemByName: (name: string) => Promise<BodySystemDetail | null>

      // Plant Teachings
      getTeachingsByPlantId: (plantId: number) => Promise<PlantTeaching | null>

      // Plant Presence Energetics
      getPresenceByPlantId: (plantId: number) => Promise<PlantPresenceEnergetics | null>

      // Journal
      getJournalPrompts: (filters?: { plantId?: number | null; category?: string }) => Promise<JournalPrompt[]>
      getJournalEntries: (filters?: { plantId?: number; search?: string }) => Promise<JournalEntry[]>
      createJournalEntry: (entry: {
        plant_id?: number | null
        prompt_id?: number | null
        title?: string | null
        content: string
        mood?: string | null
        season?: string | null
        entry_date?: string | null
      }) => Promise<{ id: number }>
      updateJournalEntry: (id: number, updates: {
        title?: string | null
        content?: string
        mood?: string | null
        season?: string | null
        entry_date?: string | null
      }) => Promise<{ success: boolean }>
      deleteJournalEntry: (id: number) => Promise<{ success: boolean }>

      // Wellness Goals
      getWellnessCategories: () => Promise<WellnessCategory[]>
      getWellnessGoalsByCategory: (categoryId: number) => Promise<WellnessGoal[]>
      getWellnessGoalById: (id: number) => Promise<WellnessGoalDetail | null>
      searchWellnessGoals: (search: string) => Promise<WellnessGoal[]>
    }
  }
}
