-- Ethical Plant Medicine Practice: comprehensive guidance for safe, respectful,
-- and culturally aware engagement with plant medicines
-- Seven domains: ethical use context, facilitation, contraindications/safety,
-- sourcing/ecology, preparation/relationship, energetic signature, integration

CREATE TABLE IF NOT EXISTS ethical_practice (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL UNIQUE REFERENCES plants(id),

  -- 1. Ethical Use & Context of Application
  use_context_daily TEXT,           -- Daily/personal self-guided use guidance
  use_context_practitioner TEXT,    -- Practitioner-guided use guidance
  use_context_ceremonial TEXT,      -- Facilitated ceremonial use guidance
  use_context_group_vs_private TEXT,-- Group vs private ceremony considerations
  cultural_respect_notes TEXT,      -- Indigenous lineage, appropriation risks
  misuse_risks TEXT,                -- Risks of working outside appropriate context

  -- 2. Facilitation Guidelines
  facilitator_qualifications TEXT,  -- Required qualifications (clinical, traditional, lineage)
  facilitator_qualities TEXT,       -- Key qualities of safe facilitator
  facilitator_red_flags TEXT,       -- Red flags to avoid
  preparation_framework TEXT,       -- Prep and integration support frameworks

  -- 3. Contraindications & Safety (expanded beyond base plant data)
  physiological_contraindications TEXT,  -- Medications, conditions, pregnancy
  psychological_considerations TEXT,     -- Trauma, mental health, dissociation risk
  environmental_considerations TEXT,     -- Set, setting, group dynamics
  dosage_sensitivity TEXT,               -- Dosage ranges and sensitivity
  interaction_notes TEXT,                -- Interactions with other plants/pharmaceuticals
  contraindication_severity TEXT,        -- JSON: [{ item, level: 'caution'|'strict' }]

  -- 4. Sourcing & Ecological Integrity
  native_ecosystems TEXT,           -- Native growing regions
  wildcrafted_vs_cultivated TEXT,   -- Wildcrafting vs cultivation considerations
  sustainable_harvesting TEXT,      -- Regenerative/sustainable practices
  ethical_sourcing_concerns TEXT,   -- Overharvesting, exploitation, cultural extraction
  sourcing_standards TEXT,          -- Recommended standards (organic, biodynamic, etc.)

  -- 5. Preparation & Energetic Relationship
  traditional_preparation TEXT,     -- Traditional methods (tea, ceremony, etc.)
  modern_preparation TEXT,          -- Modern equivalents
  preparation_potency_notes TEXT,   -- How preparation influences experience
  intentional_practices TEXT,       -- Pre-consumption practices (grounding, prayer, fasting)

  -- 6. Energetic Signature & Divine Intelligence
  psychospiritual_effects TEXT,     -- Emotional/psycho-spiritual effects
  archetypal_resonance TEXT,        -- Archetypal or symbolic resonance
  nervous_system_influence TEXT,    -- Stimulating, regulating, expanding, grounding
  consciousness_interaction TEXT,   -- How plant interacts with perception
  spirit_teaching TEXT,             -- Traditional language for plant's spirit/teaching

  -- 7. Integration Considerations
  integration_body TEXT,            -- Somatic/physical integration guidance
  integration_heart TEXT,           -- Emotional integration guidance
  integration_mind TEXT,            -- Cognitive/meaning-making integration
  integration_spirit TEXT,          -- Existential/purpose integration
  healthy_integration_signs TEXT,   -- Signs of healthy integration
  incomplete_integration_signs TEXT,-- Signs of incomplete integration
  when_to_seek_support TEXT,        -- When to seek additional support

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ethical_practice_plant ON ethical_practice(plant_id);
