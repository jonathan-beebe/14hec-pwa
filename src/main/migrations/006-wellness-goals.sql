-- Wellness Goals: Outcome-first, support-oriented plant discovery
-- "What do I want to improve?" vs Ailments' "What's wrong?"

-- Wellness categories group related goals into browsable domains
CREATE TABLE IF NOT EXISTS wellness_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual wellness goals within categories
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

-- Many-to-many: plants supporting wellness goals
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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wellness_goals_category ON wellness_goals(category_id);
CREATE INDEX IF NOT EXISTS idx_wellness_goals_body_system ON wellness_goals(body_system);
CREATE INDEX IF NOT EXISTS idx_pwg_plant ON plant_wellness_goals(plant_id);
CREATE INDEX IF NOT EXISTS idx_pwg_goal ON plant_wellness_goals(wellness_goal_id);
