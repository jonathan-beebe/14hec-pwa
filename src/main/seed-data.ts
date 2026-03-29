import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadJson(filename: string): any[] {
  const filePath = join(__dirname, '../../src/seed', filename)
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

/** Convert any array values in an object to comma-separated strings for SQLite */
function flattenArrays(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result[key] = value.join(', ')
    } else {
      result[key] = value
    }
  }
  return result
}

export function seedDatabase(db: Database.Database): void {
  const transaction = db.transaction(() => {
    seedPlanets(db)
    seedZodiac(db)
    seedPreparations(db)
    seedAilments(db)
    seedCompounds(db)
    seedPlants(db)
    seedBodySystems(db)
    seedTeachingsAndJournal(db)
    seedEthicalPractice(db)
    seedWellnessGoals(db)
    seedHMBSAssociations(db)
  })

  transaction()
}

function seedPlanets(db: Database.Database): void {
  const planets = loadJson('planets.json')
  const stmt = db.prepare(`
    INSERT INTO planets (name, symbol, associated_signs, body_systems, energetic_quality, description)
    VALUES (@name, @symbol, @associated_signs, @body_systems, @energetic_quality, @description)
  `)
  for (const p of planets) {
    stmt.run(flattenArrays(p))
  }
}

function seedZodiac(db: Database.Database): void {
  const signs = loadJson('zodiac.json')
  const stmt = db.prepare(`
    INSERT INTO zodiac_signs (name, symbol, element, modality, ruling_planet_id, date_range_start, date_range_end, body_parts_ruled, description)
    VALUES (@name, @symbol, @element, @modality, @ruling_planet_id, @date_range_start, @date_range_end, @body_parts_ruled, @description)
  `)
  const getPlanet = db.prepare('SELECT id FROM planets WHERE name = ?')

  for (const s of signs) {
    // Resolve ruling planet - use the first planet for dual-ruled signs
    const primaryPlanet = s.ruling_planet.split('/')[0].trim()
    const planet = getPlanet.get(primaryPlanet) as { id: number } | undefined
    stmt.run(flattenArrays({
      ...s,
      ruling_planet_id: planet?.id ?? null
    }))
  }
}

function seedPreparations(db: Database.Database): void {
  const preps = loadJson('preparations.json')
  const stmt = db.prepare(`
    INSERT INTO preparations (name, solvent, best_plant_parts, absorption_speed, concentration_level, shelf_life, general_instructions, safety_notes)
    VALUES (@name, @solvent, @best_plant_parts, @absorption_speed, @concentration_level, @shelf_life, @general_instructions, @safety_notes)
  `)
  for (const p of preps) {
    stmt.run(flattenArrays({
      ...p,
      concentration_level: p.concentration || p.concentration_level,
      general_instructions: Array.isArray(p.general_instructions)
        ? p.general_instructions.join('\n')
        : p.general_instructions
    }))
  }
}

function seedAilments(db: Database.Database): void {
  const ailments = loadJson('ailments.json')
  const stmt = db.prepare(`
    INSERT INTO ailments (name, category, body_system, description, symptoms)
    VALUES (@name, @category, @body_system, @description, @symptoms)
  `)
  for (const a of ailments) {
    stmt.run(flattenArrays(a))
  }
}

function seedCompounds(db: Database.Database): void {
  const compounds = loadJson('compounds.json')
  const stmt = db.prepare(`
    INSERT INTO compounds (name, compound_type, pharmacological_action, psychoactive)
    VALUES (@name, @compound_type, @pharmacological_action, @psychoactive)
  `)
  for (const c of compounds) {
    stmt.run(c)
  }
}

function seedPlants(db: Database.Database): void {
  const plants = loadJson('plants.json')

  const insertPlant = db.prepare(`
    INSERT INTO plants (common_name, latin_name, family, genus, species, description, habitat, native_region, category, energetic_quality, doctrine_of_signatures, safety_notes)
    VALUES (@common_name, @latin_name, @family, @genus, @species, @description, @habitat, @native_region, @category, @energetic_quality, @doctrine_of_signatures, @safety_notes)
  `)

  const insertPart = db.prepare(`
    INSERT INTO plant_parts (plant_id, part_type, typical_compounds, therapeutic_properties, notes)
    VALUES (@plant_id, @part_type, @typical_compounds, @therapeutic_properties, @notes)
  `)

  const insertPlantPlanet = db.prepare(`
    INSERT OR IGNORE INTO plant_planet_associations (plant_id, planet_id, association_type, notes)
    VALUES (@plant_id, @planet_id, @association_type, @notes)
  `)

  const insertPlantZodiac = db.prepare(`
    INSERT OR IGNORE INTO plant_zodiac_associations (plant_id, zodiac_sign_id, notes)
    VALUES (@plant_id, @zodiac_sign_id, @notes)
  `)

  const insertPlantAilment = db.prepare(`
    INSERT INTO plant_ailments (plant_id, ailment_id, plant_part_id, preparation_id, efficacy_notes, evidence_level, dosage_notes)
    VALUES (@plant_id, @ailment_id, @plant_part_id, @preparation_id, @efficacy_notes, @evidence_level, @dosage_notes)
  `)

  const insertPlantCompound = db.prepare(`
    INSERT OR IGNORE INTO plant_compounds (plant_id, compound_id)
    VALUES (@plant_id, @compound_id)
  `)

  const insertContraindication = db.prepare(`
    INSERT INTO plant_contraindications (plant_id, ailment_id, reason, severity, notes)
    VALUES (@plant_id, @ailment_id, @reason, @severity, @notes)
  `)

  const getPlanet = db.prepare('SELECT id FROM planets WHERE name = ?')
  const getZodiac = db.prepare('SELECT id FROM zodiac_signs WHERE name = ?')
  const getAilment = db.prepare('SELECT id FROM ailments WHERE name = ?')
  const getPreparation = db.prepare('SELECT id FROM preparations WHERE name LIKE ?')
  const getCompound = db.prepare('SELECT id FROM compounds WHERE name = ?')

  for (const plant of plants) {
    const result = insertPlant.run(plant)
    const plantId = result.lastInsertRowid as number

    // Insert plant parts and track their IDs
    const partIds: Record<string, number> = {}
    if (plant.parts) {
      for (const part of plant.parts) {
        const partResult = insertPart.run({
          plant_id: plantId,
          part_type: part.part_type,
          typical_compounds: part.typical_compounds,
          therapeutic_properties: part.therapeutic_properties,
          notes: part.notes || null
        })
        partIds[part.part_type] = partResult.lastInsertRowid as number
      }
    }

    // Insert planet associations
    if (plant.planet_associations) {
      for (const assoc of plant.planet_associations) {
        const planet = getPlanet.get(assoc.planet) as { id: number } | undefined
        if (planet) {
          insertPlantPlanet.run({
            plant_id: plantId,
            planet_id: planet.id,
            association_type: assoc.association_type,
            notes: assoc.notes || null
          })
        }
      }
    }

    // Insert zodiac associations
    if (plant.zodiac_associations) {
      for (const assoc of plant.zodiac_associations) {
        const sign = getZodiac.get(assoc.sign) as { id: number } | undefined
        if (sign) {
          insertPlantZodiac.run({
            plant_id: plantId,
            zodiac_sign_id: sign.id,
            notes: assoc.notes || null
          })
        }
      }
    }

    // Insert ailment associations
    if (plant.ailment_associations) {
      for (const assoc of plant.ailment_associations) {
        const ailment = getAilment.get(assoc.ailment) as { id: number } | undefined
        const plantPartId = assoc.plant_part ? partIds[assoc.plant_part] : null
        const prep = assoc.preparation ? getPreparation.get(`%${assoc.preparation}%`) as { id: number } | undefined : undefined
        if (ailment) {
          insertPlantAilment.run({
            plant_id: plantId,
            ailment_id: ailment.id,
            plant_part_id: plantPartId || null,
            preparation_id: prep?.id || null,
            efficacy_notes: assoc.efficacy_notes || null,
            evidence_level: assoc.evidence_level || 'traditional',
            dosage_notes: assoc.dosage_notes || null
          })
        }
      }
    }

    // Insert compound associations
    if (plant.compound_names) {
      for (const name of plant.compound_names) {
        const compound = getCompound.get(name) as { id: number } | undefined
        if (compound) {
          insertPlantCompound.run({
            plant_id: plantId,
            compound_id: compound.id
          })
        }
      }
    }

    // Insert contraindication associations
    if (plant.contraindication_associations) {
      for (const assoc of plant.contraindication_associations) {
        const ailment = getAilment.get(assoc.ailment) as { id: number } | undefined
        if (ailment) {
          insertContraindication.run({
            plant_id: plantId,
            ailment_id: ailment.id,
            reason: assoc.reason || null,
            severity: assoc.severity || 'moderate',
            notes: assoc.notes || null
          })
        }
      }
    }
  }
}

function seedTeachingsAndJournal(db: Database.Database): void {
  const data = JSON.parse(readFileSync(join(__dirname, '../../src/seed', 'plant-teachings.json'), 'utf-8'))

  const getPlant = db.prepare('SELECT id FROM plants WHERE common_name = ?')

  // ── Insert plant teachings ──────────────────────────────────────
  const insertTeaching = db.prepare(`
    INSERT INTO plant_teachings (plant_id, energetic_teaching, mental_teaching, physical_teaching, spiritual_teaching, activation_principle)
    VALUES (@plant_id, @energetic_teaching, @mental_teaching, @physical_teaching, @spiritual_teaching, @activation_principle)
  `)

  for (const teaching of data.teachings) {
    const plant = getPlant.get(teaching.plant) as { id: number } | undefined
    if (plant) {
      insertTeaching.run({
        plant_id: plant.id,
        energetic_teaching: teaching.energetic_teaching,
        mental_teaching: teaching.mental_teaching,
        physical_teaching: teaching.physical_teaching,
        spiritual_teaching: teaching.spiritual_teaching,
        activation_principle: teaching.activation_principle
      })
    }
  }

  // ── Insert plant presence energetics ──────────────────────────────────────
  const insertPresence = db.prepare(`
    INSERT INTO plant_presence_energetics (plant_id, home_placement, field_interaction, energetic_gift, presence_practice, spatial_influence)
    VALUES (@plant_id, @home_placement, @field_interaction, @energetic_gift, @presence_practice, @spatial_influence)
  `)

  if (data.presence_energetics) {
    for (const presence of data.presence_energetics) {
      const plant = getPlant.get(presence.plant) as { id: number } | undefined
      if (plant) {
        insertPresence.run({
          plant_id: plant.id,
          home_placement: presence.home_placement,
          field_interaction: presence.field_interaction,
          energetic_gift: presence.energetic_gift,
          presence_practice: presence.presence_practice,
          spatial_influence: presence.spatial_influence
        })
      }
    }
  }

  // ── Insert journal prompts ──────────────────────────────────────
  const insertPrompt = db.prepare(`
    INSERT INTO journal_prompts (plant_id, prompt_text, prompt_category)
    VALUES (@plant_id, @prompt_text, @prompt_category)
  `)

  for (const prompt of data.prompts) {
    let plantId: number | null = null
    if (prompt.plant) {
      const plant = getPlant.get(prompt.plant) as { id: number } | undefined
      plantId = plant?.id ?? null
    }

    insertPrompt.run({
      plant_id: plantId,
      prompt_text: prompt.prompt_text,
      prompt_category: prompt.prompt_category
    })
  }
}

function seedEthicalPractice(db: Database.Database): void {
  const data = loadJson('ethical-practice.json')
  const getPlant = db.prepare('SELECT id FROM plants WHERE common_name = ?')

  const stmt = db.prepare(`
    INSERT INTO ethical_practice (
      plant_id,
      use_context_daily, use_context_practitioner, use_context_ceremonial,
      use_context_group_vs_private, cultural_respect_notes, misuse_risks,
      facilitator_qualifications, facilitator_qualities, facilitator_red_flags, preparation_framework,
      physiological_contraindications, psychological_considerations, environmental_considerations,
      dosage_sensitivity, interaction_notes, contraindication_severity,
      native_ecosystems, wildcrafted_vs_cultivated, sustainable_harvesting,
      ethical_sourcing_concerns, sourcing_standards,
      traditional_preparation, modern_preparation, preparation_potency_notes, intentional_practices,
      psychospiritual_effects, archetypal_resonance, nervous_system_influence,
      consciousness_interaction, spirit_teaching,
      integration_body, integration_heart, integration_mind, integration_spirit,
      healthy_integration_signs, incomplete_integration_signs, when_to_seek_support
    ) VALUES (
      @plant_id,
      @use_context_daily, @use_context_practitioner, @use_context_ceremonial,
      @use_context_group_vs_private, @cultural_respect_notes, @misuse_risks,
      @facilitator_qualifications, @facilitator_qualities, @facilitator_red_flags, @preparation_framework,
      @physiological_contraindications, @psychological_considerations, @environmental_considerations,
      @dosage_sensitivity, @interaction_notes, @contraindication_severity,
      @native_ecosystems, @wildcrafted_vs_cultivated, @sustainable_harvesting,
      @ethical_sourcing_concerns, @sourcing_standards,
      @traditional_preparation, @modern_preparation, @preparation_potency_notes, @intentional_practices,
      @psychospiritual_effects, @archetypal_resonance, @nervous_system_influence,
      @consciousness_interaction, @spirit_teaching,
      @integration_body, @integration_heart, @integration_mind, @integration_spirit,
      @healthy_integration_signs, @incomplete_integration_signs, @when_to_seek_support
    )
  `)

  for (const entry of data) {
    const plant = getPlant.get(entry.plant) as { id: number } | undefined
    if (plant) {
      stmt.run({
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
        when_to_seek_support: entry.when_to_seek_support || null
      })
    }
  }
}

function seedBodySystems(db: Database.Database): void {
  const data = loadJson('body-systems.json') as any

  const getPlanet = db.prepare('SELECT id FROM planets WHERE name = ?')
  const getZodiac = db.prepare('SELECT id FROM zodiac_signs WHERE name = ?')
  const getAilment = db.prepare('SELECT id FROM ailments WHERE name = ?')
  const getBodySystem = db.prepare('SELECT id FROM body_systems WHERE name = ?')

  // ── Insert body systems ──────────────────────────────────────────
  const insertBodySystem = db.prepare(`
    INSERT OR IGNORE INTO body_systems (name, category, description, tcm_element, ayurvedic_dosha, ruling_planet_id, zodiac_sign_id)
    VALUES (@name, @category, @description, @tcm_element, @ayurvedic_dosha, @ruling_planet_id, @zodiac_sign_id)
  `)

  for (const bs of data.body_systems) {
    const planet = bs.ruling_planet ? getPlanet.get(bs.ruling_planet) as { id: number } | undefined : undefined
    const zodiac = bs.zodiac_sign ? getZodiac.get(bs.zodiac_sign) as { id: number } | undefined : undefined

    insertBodySystem.run({
      name: bs.name,
      category: bs.category,
      description: bs.description,
      tcm_element: bs.tcm_element || null,
      ayurvedic_dosha: bs.ayurvedic_dosha || null,
      ruling_planet_id: planet?.id ?? null,
      zodiac_sign_id: zodiac?.id ?? null
    })
  }

  // ── Insert ailment mappings ──────────────────────────────────────
  const insertAilmentMapping = db.prepare(`
    INSERT OR IGNORE INTO body_system_ailments (body_system_id, ailment_id, relevance, notes)
    VALUES (@body_system_id, @ailment_id, @relevance, @notes)
  `)

  for (const mapping of data.ailment_mappings) {
    const bodySystem = getBodySystem.get(mapping.body_system) as { id: number } | undefined
    const ailment = getAilment.get(mapping.ailment) as { id: number } | undefined

    if (bodySystem && ailment) {
      insertAilmentMapping.run({
        body_system_id: bodySystem.id,
        ailment_id: ailment.id,
        relevance: mapping.relevance || 'primary',
        notes: mapping.notes || null
      })
    }
  }

  // ── Insert plant part correspondences (herbs + foods) ────────────
  const insertCorrespondence = db.prepare(`
    INSERT INTO body_system_plant_parts
      (body_system_id, plant_id, part_type, correspondence_type, signature_description, therapeutic_action, is_food, food_name, notes)
    VALUES
      (@body_system_id, @plant_id, @part_type, @correspondence_type, @signature_description, @therapeutic_action, @is_food, @food_name, @notes)
  `)

  for (const corr of data.plant_part_correspondences) {
    const bodySystem = getBodySystem.get(corr.body_system) as { id: number } | undefined

    if (bodySystem) {
      insertCorrespondence.run({
        body_system_id: bodySystem.id,
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
}

function seedWellnessGoals(db: Database.Database): void {
  const data = JSON.parse(readFileSync(join(__dirname, '../../src/seed', 'wellness-goals.json'), 'utf-8'))

  // ── Insert wellness categories ──────────────────────────────────────
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO wellness_categories (name, slug, description, icon, sort_order)
    VALUES (@name, @slug, @description, @icon, @sort_order)
  `)

  for (const cat of data.wellness_categories) {
    insertCategory.run(cat)
  }

  // ── Insert wellness goals ──────────────────────────────────────
  const getCategory = db.prepare('SELECT id FROM wellness_categories WHERE name = ?')
  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO wellness_goals (category_id, name, description, desired_outcome, body_system, evidence_summary, lifestyle_notes)
    VALUES (@category_id, @name, @description, @desired_outcome, @body_system, @evidence_summary, @lifestyle_notes)
  `)

  for (const goal of data.wellness_goals) {
    const category = getCategory.get(goal.category) as { id: number } | undefined
    if (category) {
      insertGoal.run({
        category_id: category.id,
        name: goal.name,
        description: goal.description,
        desired_outcome: goal.desired_outcome || null,
        body_system: goal.body_system || null,
        evidence_summary: goal.evidence_summary || null,
        lifestyle_notes: goal.lifestyle_notes || null
      })
    }
  }

  // ── Insert plant-wellness-goal mappings ──────────────────────────────
  const getPlant = db.prepare('SELECT id FROM plants WHERE common_name = ?')
  const getGoal = db.prepare('SELECT id FROM wellness_goals WHERE name = ?')
  const insertMapping = db.prepare(`
    INSERT OR IGNORE INTO plant_wellness_goals (plant_id, wellness_goal_id, mechanism, efficacy_notes, evidence_level, dosage_notes)
    VALUES (@plant_id, @wellness_goal_id, @mechanism, @efficacy_notes, @evidence_level, @dosage_notes)
  `)

  for (const mapping of data.plant_wellness_mappings) {
    const plant = getPlant.get(mapping.plant) as { id: number } | undefined
    const goal = getGoal.get(mapping.goal) as { id: number } | undefined
    if (plant && goal) {
      insertMapping.run({
        plant_id: plant.id,
        wellness_goal_id: goal.id,
        mechanism: mapping.mechanism || null,
        efficacy_notes: mapping.efficacy_notes || null,
        evidence_level: mapping.evidence_level || 'traditional',
        dosage_notes: mapping.dosage_notes || null
      })
    }
  }
}

function seedHMBSAssociations(db: Database.Database): void {
  const data = loadJson('hmbs-associations.json')
  const getPlant = db.prepare('SELECT id FROM plants WHERE common_name = ?')

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO plant_hmbs_associations (plant_id, domain, strength, reason, plant_part_affinity)
    VALUES (@plant_id, @domain, @strength, @reason, @plant_part_affinity)
  `)

  for (const entry of data) {
    const plant = getPlant.get(entry.plant) as { id: number } | undefined
    if (plant && entry.associations) {
      for (const assoc of entry.associations) {
        stmt.run({
          plant_id: plant.id,
          domain: assoc.domain,
          strength: assoc.strength || 'primary',
          reason: assoc.reason || null,
          plant_part_affinity: assoc.plant_part_affinity || null
        })
      }
    }
  }
}
