-- HMBS (Heart, Mind, Body, Spirit) Domain Associations
-- Maps every plant to one or more domains with strength and reasoning

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
