-- Plant Collections: personal groupings of plants for quick reference
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🌿',
  color TEXT DEFAULT 'botanical',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_plants (
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  notes TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_plants_collection ON collection_plants(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_plants_plant ON collection_plants(plant_id);
