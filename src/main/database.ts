import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import { seedDatabase } from './seed-data'

let db: Database.Database

export function getDb(): Database.Database {
  return db
}

export function initDatabase(): void {
  const dbPath = join(app.getPath('userData'), '14hec.db')
  const isNew = !existsSync(dbPath)

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  createSchema()

  if (isNew) {
    seedDatabase(db)
  }
}

function createSchema(): void {
  const migrationsDir = join(__dirname, '../../src/main/migrations')
  const migrations = [
    '001-initial-schema.sql',
    '002-body-systems.sql',
    '003-teachings-journal.sql',
    '004-presence-energetics.sql',
    '005-ethical-practice.sql',
    '006-wellness-goals.sql',
    '007-hmbs-associations.sql'
  ]

  for (const migration of migrations) {
    const migrationPath = join(migrationsDir, migration)

    let schema: string
    if (existsSync(migrationPath)) {
      schema = readFileSync(migrationPath, 'utf-8')
    } else {
      schema = getEmbeddedSchema(migration)
    }

    db.exec(schema)
  }
}

function getEmbeddedSchema(migration: string): string {
  if (migration === '007-hmbs-associations.sql') {
    return getEmbeddedHMBSSchema()
  }
  if (migration === '006-wellness-goals.sql') {
    return getEmbeddedWellnessGoalsSchema()
  }
  if (migration === '005-ethical-practice.sql') {
    return getEmbeddedEthicalPracticeSchema()
  }
  if (migration === '004-presence-energetics.sql') {
    return getEmbeddedPresenceSchema()
  }
  if (migration === '003-teachings-journal.sql') {
    return getEmbeddedTeachingsJournalSchema()
  }
  if (migration === '002-body-systems.sql') {
    return getEmbeddedBodySystemsSchema()
  }
  return `
-- Core entity tables
CREATE TABLE IF NOT EXISTS plants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  common_name TEXT NOT NULL,
  latin_name TEXT NOT NULL UNIQUE,
  family TEXT,
  genus TEXT,
  species TEXT,
  description TEXT,
  habitat TEXT,
  native_region TEXT,
  category TEXT CHECK(category IN ('conventional','entheogenic','both')),
  energetic_quality TEXT,
  doctrine_of_signatures TEXT,
  safety_notes TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plant_parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  part_type TEXT CHECK(part_type IN (
    'root','bark','stem','leaf','flower','seed_fruit',
    'resin_sap','fungal_body','whole'
  )),
  typical_compounds TEXT,
  therapeutic_properties TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS ailments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT CHECK(category IN ('physical','emotional','spiritual')),
  body_system TEXT,
  description TEXT,
  symptoms TEXT
);

CREATE TABLE IF NOT EXISTS preparations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  solvent TEXT,
  best_plant_parts TEXT,
  absorption_speed TEXT,
  concentration_level TEXT,
  shelf_life TEXT,
  general_instructions TEXT,
  safety_notes TEXT
);

CREATE TABLE IF NOT EXISTS planets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  symbol TEXT,
  associated_signs TEXT,
  body_systems TEXT,
  energetic_quality TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS zodiac_signs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  symbol TEXT,
  element TEXT CHECK(element IN ('fire','water','air','earth')),
  modality TEXT CHECK(modality IN ('cardinal','fixed','mutable')),
  ruling_planet_id INTEGER REFERENCES planets(id),
  date_range_start TEXT,
  date_range_end TEXT,
  body_parts_ruled TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS compounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  compound_type TEXT,
  pharmacological_action TEXT,
  psychoactive INTEGER DEFAULT 0
);

-- Junction / relationship tables
CREATE TABLE IF NOT EXISTS plant_compounds (
  plant_id INTEGER REFERENCES plants(id),
  compound_id INTEGER REFERENCES compounds(id),
  concentration_notes TEXT,
  PRIMARY KEY (plant_id, compound_id)
);

CREATE TABLE IF NOT EXISTS plant_ailments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER REFERENCES plants(id),
  ailment_id INTEGER REFERENCES ailments(id),
  plant_part_id INTEGER REFERENCES plant_parts(id),
  preparation_id INTEGER REFERENCES preparations(id),
  efficacy_notes TEXT,
  evidence_level TEXT CHECK(evidence_level IN (
    'traditional','clinical','anecdotal','ethnobotanical'
  )),
  dosage_notes TEXT,
  source_reference TEXT
);

CREATE TABLE IF NOT EXISTS plant_planet_associations (
  plant_id INTEGER REFERENCES plants(id),
  planet_id INTEGER REFERENCES planets(id),
  association_type TEXT CHECK(association_type IN (
    'primary_ruler','sympathetic','antipathetic'
  )),
  notes TEXT,
  PRIMARY KEY (plant_id, planet_id)
);

CREATE TABLE IF NOT EXISTS plant_zodiac_associations (
  plant_id INTEGER REFERENCES plants(id),
  zodiac_sign_id INTEGER REFERENCES zodiac_signs(id),
  notes TEXT,
  PRIMARY KEY (plant_id, zodiac_sign_id)
);

CREATE TABLE IF NOT EXISTS ailment_planet_associations (
  ailment_id INTEGER REFERENCES ailments(id),
  planet_id INTEGER REFERENCES planets(id),
  notes TEXT,
  PRIMARY KEY (ailment_id, planet_id)
);

CREATE TABLE IF NOT EXISTS ailment_zodiac_associations (
  ailment_id INTEGER REFERENCES ailments(id),
  zodiac_sign_id INTEGER REFERENCES zodiac_signs(id),
  notes TEXT,
  PRIMARY KEY (ailment_id, zodiac_sign_id)
);

CREATE TABLE IF NOT EXISTS plant_part_preparations (
  plant_part_id INTEGER REFERENCES plant_parts(id),
  preparation_id INTEGER REFERENCES preparations(id),
  specific_instructions TEXT,
  dosage_notes TEXT,
  suitability TEXT CHECK(suitability IN ('optimal','viable','not_recommended')),
  PRIMARY KEY (plant_part_id, preparation_id)
);

CREATE TABLE IF NOT EXISTS preparation_compound_effects (
  preparation_id INTEGER REFERENCES preparations(id),
  compound_id INTEGER REFERENCES compounds(id),
  effect TEXT CHECK(effect IN ('extracts','concentrates','destroys','preserves')),
  notes TEXT,
  PRIMARY KEY (preparation_id, compound_id)
);

CREATE TABLE IF NOT EXISTS plant_research_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER REFERENCES plants(id),
  title TEXT,
  content TEXT,
  source_url TEXT,
  evidence_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plant_contraindications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER REFERENCES plants(id),
  ailment_id INTEGER REFERENCES ailments(id),
  reason TEXT,
  severity TEXT CHECK(severity IN ('high','moderate','low')),
  notes TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_common_name ON plants(common_name);
CREATE INDEX IF NOT EXISTS idx_plant_parts_plant ON plant_parts(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_ailments_plant ON plant_ailments(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_ailments_ailment ON plant_ailments(ailment_id);
CREATE INDEX IF NOT EXISTS idx_ailments_body_system ON ailments(body_system);
CREATE INDEX IF NOT EXISTS idx_ailments_category ON ailments(category);
CREATE INDEX IF NOT EXISTS idx_contraindications_plant ON plant_contraindications(plant_id);
CREATE INDEX IF NOT EXISTS idx_contraindications_ailment ON plant_contraindications(ailment_id);
  `
}

function getEmbeddedBodySystemsSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS body_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT CHECK(category IN ('organ','system','tissue','gland','structure')) NOT NULL,
  description TEXT,
  tcm_element TEXT,
  ayurvedic_dosha TEXT,
  ruling_planet_id INTEGER REFERENCES planets(id),
  zodiac_sign_id INTEGER REFERENCES zodiac_signs(id),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS body_system_ailments (
  body_system_id INTEGER NOT NULL REFERENCES body_systems(id),
  ailment_id INTEGER NOT NULL REFERENCES ailments(id),
  relevance TEXT CHECK(relevance IN ('primary','secondary','associated')) DEFAULT 'primary',
  notes TEXT,
  PRIMARY KEY (body_system_id, ailment_id)
);

CREATE TABLE IF NOT EXISTS body_system_plant_parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body_system_id INTEGER NOT NULL REFERENCES body_systems(id),
  plant_id INTEGER REFERENCES plants(id),
  part_type TEXT CHECK(part_type IN (
    'root','bark','stem','leaf','flower','seed_fruit',
    'resin_sap','fungal_body','whole'
  )),
  correspondence_type TEXT CHECK(correspondence_type IN (
    'doctrine_of_signatures','traditional_herbalism','nutritional',
    'tcm','ayurvedic','clinical'
  )) NOT NULL DEFAULT 'traditional_herbalism',
  signature_description TEXT,
  therapeutic_action TEXT,
  is_food INTEGER DEFAULT 0,
  food_name TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_body_systems_category ON body_systems(category);
CREATE INDEX IF NOT EXISTS idx_body_systems_name ON body_systems(name);
CREATE INDEX IF NOT EXISTS idx_bsa_body_system ON body_system_ailments(body_system_id);
CREATE INDEX IF NOT EXISTS idx_bsa_ailment ON body_system_ailments(ailment_id);
CREATE INDEX IF NOT EXISTS idx_bspp_body_system ON body_system_plant_parts(body_system_id);
CREATE INDEX IF NOT EXISTS idx_bspp_plant ON body_system_plant_parts(plant_id);
CREATE INDEX IF NOT EXISTS idx_bspp_food ON body_system_plant_parts(is_food);
  `
}

function getEmbeddedTeachingsJournalSchema(): string {
  return `
-- Plant Teachings: What the plant desires to teach us
-- Plants activate what is already within us — they are mirrors, not additions
CREATE TABLE IF NOT EXISTS plant_teachings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  energetic_teaching TEXT,
  mental_teaching TEXT,
  physical_teaching TEXT,
  spiritual_teaching TEXT,
  activation_principle TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER REFERENCES plants(id),
  prompt_text TEXT NOT NULL,
  prompt_category TEXT CHECK(prompt_category IN ('energetic','mental','physical','spiritual','integration','relationship')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER REFERENCES plants(id),
  prompt_id INTEGER REFERENCES journal_prompts(id),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  season TEXT,
  entry_date DATE DEFAULT (date('now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teachings_plant ON plant_teachings(plant_id);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_plant ON journal_prompts(plant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_plant ON journal_entries(plant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
  `
}

function getEmbeddedEthicalPracticeSchema(): string {
  return `
-- Ethical Plant Medicine Practice: comprehensive guidance for safe, respectful,
-- and culturally aware engagement with plant medicines
CREATE TABLE IF NOT EXISTS ethical_practice (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL UNIQUE REFERENCES plants(id),
  use_context_daily TEXT,
  use_context_practitioner TEXT,
  use_context_ceremonial TEXT,
  use_context_group_vs_private TEXT,
  cultural_respect_notes TEXT,
  misuse_risks TEXT,
  facilitator_qualifications TEXT,
  facilitator_qualities TEXT,
  facilitator_red_flags TEXT,
  preparation_framework TEXT,
  physiological_contraindications TEXT,
  psychological_considerations TEXT,
  environmental_considerations TEXT,
  dosage_sensitivity TEXT,
  interaction_notes TEXT,
  contraindication_severity TEXT,
  native_ecosystems TEXT,
  wildcrafted_vs_cultivated TEXT,
  sustainable_harvesting TEXT,
  ethical_sourcing_concerns TEXT,
  sourcing_standards TEXT,
  traditional_preparation TEXT,
  modern_preparation TEXT,
  preparation_potency_notes TEXT,
  intentional_practices TEXT,
  psychospiritual_effects TEXT,
  archetypal_resonance TEXT,
  nervous_system_influence TEXT,
  consciousness_interaction TEXT,
  spirit_teaching TEXT,
  integration_body TEXT,
  integration_heart TEXT,
  integration_mind TEXT,
  integration_spirit TEXT,
  healthy_integration_signs TEXT,
  incomplete_integration_signs TEXT,
  when_to_seek_support TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ethical_practice_plant ON ethical_practice(plant_id);
  `
}

function getEmbeddedWellnessGoalsSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS wellness_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wellness_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES wellness_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  desired_outcome TEXT,
  body_system TEXT,
  evidence_summary TEXT,
  lifestyle_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS plant_wellness_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  wellness_goal_id INTEGER NOT NULL REFERENCES wellness_goals(id),
  plant_part_id INTEGER REFERENCES plant_parts(id),
  preparation_id INTEGER REFERENCES preparations(id),
  mechanism TEXT,
  efficacy_notes TEXT,
  evidence_level TEXT CHECK(evidence_level IN (
    'traditional','clinical','anecdotal','ethnobotanical'
  )),
  dosage_notes TEXT,
  notes TEXT,
  UNIQUE(plant_id, wellness_goal_id)
);

CREATE INDEX IF NOT EXISTS idx_wellness_goals_category ON wellness_goals(category_id);
CREATE INDEX IF NOT EXISTS idx_wellness_goals_body_system ON wellness_goals(body_system);
CREATE INDEX IF NOT EXISTS idx_pwg_plant ON plant_wellness_goals(plant_id);
CREATE INDEX IF NOT EXISTS idx_pwg_goal ON plant_wellness_goals(wellness_goal_id);
  `
}

function getEmbeddedPresenceSchema(): string {
  return `
-- Plant Presence Energetics: How plants interact with our field through living proximity
-- Not consumption — the gift of sharing space with living plant intelligence
CREATE TABLE IF NOT EXISTS plant_presence_energetics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL UNIQUE REFERENCES plants(id),
  home_placement TEXT,
  field_interaction TEXT,
  energetic_gift TEXT,
  presence_practice TEXT,
  spatial_influence TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_presence_plant ON plant_presence_energetics(plant_id);
  `
}

function getEmbeddedHMBSSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS plant_hmbs_associations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  domain TEXT NOT NULL CHECK(domain IN ('heart','mind','body','spirit')),
  strength TEXT NOT NULL CHECK(strength IN ('primary','secondary','tertiary')) DEFAULT 'primary',
  reason TEXT,
  plant_part_affinity TEXT,
  UNIQUE(plant_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_hmbs_plant ON plant_hmbs_associations(plant_id);
CREATE INDEX IF NOT EXISTS idx_hmbs_domain ON plant_hmbs_associations(domain);
CREATE INDEX IF NOT EXISTS idx_hmbs_strength ON plant_hmbs_associations(strength);
  `
}
