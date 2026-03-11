-- Heart, Mind, Body, Spirit domain mappings for every plant
-- Each plant can belong to multiple domains with a primary/secondary strength
CREATE TABLE IF NOT EXISTS plant_hmbs_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL REFERENCES plants(id),
  domain TEXT NOT NULL CHECK(domain IN ('Heart','Mind','Body','Spirit')),
  strength TEXT NOT NULL CHECK(strength IN ('primary','secondary')) DEFAULT 'primary',
  role TEXT NOT NULL,
  UNIQUE(plant_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_hmbs_plant ON plant_hmbs_domains(plant_id);
CREATE INDEX IF NOT EXISTS idx_hmbs_domain ON plant_hmbs_domains(domain);
CREATE INDEX IF NOT EXISTS idx_hmbs_strength ON plant_hmbs_domains(strength);
