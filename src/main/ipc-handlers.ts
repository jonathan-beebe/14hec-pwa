import { ipcMain } from 'electron'
import { getDb } from './database'

export function registerIpcHandlers(): void {
  // ── Plants ──────────────────────────────────────────
  ipcMain.handle('db:plants:getAll', (_event, filters?: {
    search?: string
    category?: string
    planet?: string
    zodiacSign?: string
    element?: string
    plantPart?: string
  }) => {
    const db = getDb()
    let query = `
      SELECT DISTINCT p.* FROM plants p
    `
    const joins: string[] = []
    const conditions: string[] = []
    const params: any[] = []

    if (filters?.planet) {
      joins.push('JOIN plant_planet_associations ppa ON p.id = ppa.plant_id JOIN planets pl ON ppa.planet_id = pl.id')
      conditions.push('pl.name = ?')
      params.push(filters.planet)
    }

    if (filters?.zodiacSign) {
      joins.push('JOIN plant_zodiac_associations pza ON p.id = pza.plant_id JOIN zodiac_signs zs ON pza.zodiac_sign_id = zs.id')
      conditions.push('zs.name = ?')
      params.push(filters.zodiacSign)
    }

    if (filters?.element) {
      if (!filters.zodiacSign) {
        joins.push('JOIN plant_zodiac_associations pza ON p.id = pza.plant_id JOIN zodiac_signs zs ON pza.zodiac_sign_id = zs.id')
      }
      conditions.push('zs.element = ?')
      params.push(filters.element)
    }

    if (filters?.plantPart) {
      joins.push('JOIN plant_parts pp ON p.id = pp.plant_id')
      conditions.push('pp.part_type = ?')
      params.push(filters.plantPart)
    }

    if (filters?.category) {
      conditions.push('p.category = ?')
      params.push(filters.category)
    }

    if (filters?.search) {
      conditions.push('(p.common_name LIKE ? OR p.latin_name LIKE ? OR p.description LIKE ?)')
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += joins.join(' ') + (conditions.length ? ' WHERE ' + conditions.join(' AND ') : '') + ' ORDER BY p.common_name'

    return db.prepare(query).all(...params)
  })

  ipcMain.handle('db:plants:getById', (_event, id: number) => {
    const db = getDb()

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id)
    if (!plant) return null

    const parts = db.prepare('SELECT * FROM plant_parts WHERE plant_id = ?').all(id)
    const planetAssociations = db.prepare(`
      SELECT ppa.*, pl.name as planet_name, pl.symbol as planet_symbol, pl.energetic_quality as planet_energy
      FROM plant_planet_associations ppa
      JOIN planets pl ON ppa.planet_id = pl.id
      WHERE ppa.plant_id = ?
    `).all(id)

    const zodiacAssociations = db.prepare(`
      SELECT pza.*, zs.name as sign_name, zs.symbol as sign_symbol, zs.element
      FROM plant_zodiac_associations pza
      JOIN zodiac_signs zs ON pza.zodiac_sign_id = zs.id
      WHERE pza.plant_id = ?
    `).all(id)

    const ailmentAssociations = db.prepare(`
      SELECT pa.*, a.name as ailment_name, a.category as ailment_category, a.body_system,
             pp.part_type, pr.name as preparation_name
      FROM plant_ailments pa
      JOIN ailments a ON pa.ailment_id = a.id
      LEFT JOIN plant_parts pp ON pa.plant_part_id = pp.id
      LEFT JOIN preparations pr ON pa.preparation_id = pr.id
      WHERE pa.plant_id = ?
    `).all(id)

    const compounds = db.prepare(`
      SELECT c.*, pc.concentration_notes
      FROM plant_compounds pc
      JOIN compounds c ON pc.compound_id = c.id
      WHERE pc.plant_id = ?
    `).all(id)

    const researchNotes = db.prepare('SELECT * FROM plant_research_notes WHERE plant_id = ?').all(id)

    const contraindications = db.prepare(`
      SELECT pc.*, a.name as ailment_name, a.category as ailment_category
      FROM plant_contraindications pc
      JOIN ailments a ON pc.ailment_id = a.id
      WHERE pc.plant_id = ?
      ORDER BY CASE pc.severity WHEN 'high' THEN 1 WHEN 'moderate' THEN 2 WHEN 'low' THEN 3 END
    `).all(id)

    const teachings = db.prepare('SELECT * FROM plant_teachings WHERE plant_id = ?').get(id) || null

    const presenceEnergetics = db.prepare('SELECT * FROM plant_presence_energetics WHERE plant_id = ?').get(id) || null

    const ethicalPractice = db.prepare('SELECT * FROM ethical_practice WHERE plant_id = ?').get(id) || null

    return {
      ...plant,
      parts,
      planetAssociations,
      zodiacAssociations,
      ailmentAssociations,
      compounds,
      researchNotes,
      contraindications,
      teachings,
      presenceEnergetics,
      ethicalPractice
    }
  })

  // ── Ailments ────────────────────────────────────────
  ipcMain.handle('db:ailments:getAll', (_event, filters?: {
    category?: string
    bodySystem?: string
    search?: string
  }) => {
    const db = getDb()
    let query = 'SELECT * FROM ailments'
    const conditions: string[] = []
    const params: any[] = []

    if (filters?.category) {
      conditions.push('category = ?')
      params.push(filters.category)
    }
    if (filters?.bodySystem) {
      conditions.push('body_system = ?')
      params.push(filters.bodySystem)
    }
    if (filters?.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)')
      const s = `%${filters.search}%`
      params.push(s, s)
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY name'

    return db.prepare(query).all(...params)
  })

  ipcMain.handle('db:ailments:getById', (_event, id: number) => {
    const db = getDb()
    const ailment = db.prepare('SELECT * FROM ailments WHERE id = ?').get(id)
    if (!ailment) return null

    const plantRecommendations = db.prepare(`
      SELECT pa.*, p.common_name, p.latin_name, p.category as plant_category,
             pp.part_type, pr.name as preparation_name
      FROM plant_ailments pa
      JOIN plants p ON pa.plant_id = p.id
      LEFT JOIN plant_parts pp ON pa.plant_part_id = pp.id
      LEFT JOIN preparations pr ON pa.preparation_id = pr.id
      WHERE pa.ailment_id = ?
      ORDER BY p.common_name
    `).all(id)

    const planetAssociations = db.prepare(`
      SELECT apa.*, pl.name as planet_name, pl.symbol
      FROM ailment_planet_associations apa
      JOIN planets pl ON apa.planet_id = pl.id
      WHERE apa.ailment_id = ?
    `).all(id)

    const zodiacAssociations = db.prepare(`
      SELECT aza.*, zs.name as sign_name, zs.symbol
      FROM ailment_zodiac_associations aza
      JOIN zodiac_signs zs ON aza.zodiac_sign_id = zs.id
      WHERE aza.ailment_id = ?
    `).all(id)

    const plantsToAvoid = db.prepare(`
      SELECT pc.*, p.common_name, p.latin_name, p.category as plant_category
      FROM plant_contraindications pc
      JOIN plants p ON pc.plant_id = p.id
      WHERE pc.ailment_id = ?
      ORDER BY CASE pc.severity WHEN 'high' THEN 1 WHEN 'moderate' THEN 2 WHEN 'low' THEN 3 END, p.common_name
    `).all(id)

    return { ...ailment, plantRecommendations, planetAssociations, zodiacAssociations, plantsToAvoid }
  })

  // ── Astrology ───────────────────────────────────────
  ipcMain.handle('db:zodiac:getAll', () => {
    const db = getDb()
    return db.prepare(`
      SELECT zs.*, pl.name as ruling_planet_name, pl.symbol as ruling_planet_symbol
      FROM zodiac_signs zs
      LEFT JOIN planets pl ON zs.ruling_planet_id = pl.id
      ORDER BY zs.id
    `).all()
  })

  ipcMain.handle('db:zodiac:getById', (_event, id: number) => {
    const db = getDb()
    const sign = db.prepare(`
      SELECT zs.*, pl.name as ruling_planet_name, pl.symbol as ruling_planet_symbol
      FROM zodiac_signs zs
      LEFT JOIN planets pl ON zs.ruling_planet_id = pl.id
      WHERE zs.id = ?
    `).get(id)
    if (!sign) return null

    const plants = db.prepare(`
      SELECT p.*, pza.notes as association_notes
      FROM plant_zodiac_associations pza
      JOIN plants p ON pza.plant_id = p.id
      WHERE pza.zodiac_sign_id = ?
      ORDER BY p.common_name
    `).all(id)

    const ailments = db.prepare(`
      SELECT a.*, aza.notes as association_notes
      FROM ailment_zodiac_associations aza
      JOIN ailments a ON aza.ailment_id = a.id
      WHERE aza.zodiac_sign_id = ?
      ORDER BY a.name
    `).all(id)

    return { ...sign, plants, ailments }
  })

  ipcMain.handle('db:planets:getAll', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM planets ORDER BY id').all()
  })

  ipcMain.handle('db:planets:getById', (_event, id: number) => {
    const db = getDb()
    const planet = db.prepare('SELECT * FROM planets WHERE id = ?').get(id)
    if (!planet) return null

    const plants = db.prepare(`
      SELECT p.*, ppa.association_type, ppa.notes as association_notes
      FROM plant_planet_associations ppa
      JOIN plants p ON ppa.plant_id = p.id
      WHERE ppa.planet_id = ?
      ORDER BY p.common_name
    `).all(id)

    return { ...planet, plants }
  })

  // ── Preparations ────────────────────────────────────
  ipcMain.handle('db:preparations:getAll', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM preparations ORDER BY name').all()
  })

  ipcMain.handle('db:preparations:getById', (_event, id: number) => {
    const db = getDb()
    return db.prepare('SELECT * FROM preparations WHERE id = ?').get(id)
  })

  // ── Cross-Reference Engine ──────────────────────────
  ipcMain.handle('db:crossref:query', (_event, params: {
    ailmentId?: number
    zodiacSignId?: number
    planetId?: string
    plantPart?: string
    preparationId?: number
  }) => {
    const db = getDb()
    let query = `
      SELECT DISTINCT p.id, p.common_name, p.latin_name, p.category, p.energetic_quality,
             pa.efficacy_notes, pa.evidence_level, pa.dosage_notes,
             pp.part_type, pr.name as preparation_name,
             a.name as ailment_name
      FROM plants p
      JOIN plant_ailments pa ON p.id = pa.plant_id
      JOIN ailments a ON pa.ailment_id = a.id
      LEFT JOIN plant_parts pp ON pa.plant_part_id = pp.id
      LEFT JOIN preparations pr ON pa.preparation_id = pr.id
    `
    const joins: string[] = []
    const conditions: string[] = []
    const queryParams: any[] = []

    if (params.ailmentId) {
      conditions.push('pa.ailment_id = ?')
      queryParams.push(params.ailmentId)
    }

    if (params.zodiacSignId) {
      joins.push('JOIN plant_zodiac_associations pza ON p.id = pza.plant_id')
      conditions.push('pza.zodiac_sign_id = ?')
      queryParams.push(params.zodiacSignId)
    }

    if (params.planetId) {
      joins.push('JOIN plant_planet_associations ppa ON p.id = ppa.plant_id')
      conditions.push('ppa.planet_id = ?')
      queryParams.push(params.planetId)
    }

    if (params.plantPart) {
      conditions.push('pp.part_type = ?')
      queryParams.push(params.plantPart)
    }

    if (params.preparationId) {
      conditions.push('pa.preparation_id = ?')
      queryParams.push(params.preparationId)
    }

    query += joins.join(' ')
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY p.common_name'

    return db.prepare(query).all(...queryParams)
  })

  // ── Cross-Reference Contraindications ───────────────
  ipcMain.handle('db:crossref:contraindications', (_event, params: {
    ailmentId?: number
    zodiacSignId?: number
    planetId?: string
  }) => {
    const db = getDb()
    let query = `
      SELECT DISTINCT p.id, p.common_name, p.latin_name, p.category,
             pc.reason, pc.severity, pc.notes,
             a.name as ailment_name
      FROM plants p
      JOIN plant_contraindications pc ON p.id = pc.plant_id
      JOIN ailments a ON pc.ailment_id = a.id
    `
    const joins: string[] = []
    const conditions: string[] = []
    const queryParams: any[] = []

    if (params.ailmentId) {
      conditions.push('pc.ailment_id = ?')
      queryParams.push(params.ailmentId)
    }

    if (params.zodiacSignId) {
      joins.push('JOIN plant_zodiac_associations pza ON p.id = pza.plant_id')
      conditions.push('pza.zodiac_sign_id = ?')
      queryParams.push(params.zodiacSignId)
    }

    if (params.planetId) {
      joins.push('JOIN plant_planet_associations ppa ON p.id = ppa.plant_id')
      conditions.push('ppa.planet_id = ?')
      queryParams.push(params.planetId)
    }

    query += joins.join(' ')
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY CASE pc.severity WHEN \'high\' THEN 1 WHEN \'moderate\' THEN 2 WHEN \'low\' THEN 3 END, p.common_name'

    return db.prepare(query).all(...queryParams)
  })

  // ── Compounds ───────────────────────────────────────
  ipcMain.handle('db:compounds:getAll', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM compounds ORDER BY name').all()
  })

  // ── Body Systems ──────────────────────────────────────
  ipcMain.handle('db:bodySystems:getAll', () => {
    const db = getDb()
    return db.prepare(`
      SELECT bs.*, pl.name as ruling_planet_name, pl.symbol as ruling_planet_symbol,
             zs.name as zodiac_sign_name, zs.symbol as zodiac_sign_symbol
      FROM body_systems bs
      LEFT JOIN planets pl ON bs.ruling_planet_id = pl.id
      LEFT JOIN zodiac_signs zs ON bs.zodiac_sign_id = zs.id
      ORDER BY bs.name
    `).all()
  })

  ipcMain.handle('db:bodySystems:getById', (_event, id: number) => {
    const db = getDb()
    return getBodySystemDetail(db, 'bs.id = ?', id)
  })

  ipcMain.handle('db:bodySystems:getByName', (_event, name: string) => {
    const db = getDb()
    return getBodySystemDetail(db, 'bs.name = ?', name)
  })

  // ── Plant Teachings ──────────────────────────────────
  ipcMain.handle('db:teachings:getAll', () => {
    const db = getDb()
    return db.prepare(`
      SELECT pt.*, p.common_name, p.latin_name, p.category
      FROM plant_teachings pt
      JOIN plants p ON pt.plant_id = p.id
      ORDER BY p.common_name
    `).all()
  })

  ipcMain.handle('db:teachings:getByPlantId', (_event, plantId: number) => {
    const db = getDb()
    return db.prepare('SELECT * FROM plant_teachings WHERE plant_id = ?').get(plantId) || null
  })

  // ── Plant Presence Energetics ──────────────────────────────────
  ipcMain.handle('db:presence:getByPlantId', (_event, plantId: number) => {
    const db = getDb()
    return db.prepare('SELECT * FROM plant_presence_energetics WHERE plant_id = ?').get(plantId) || null
  })

  // ── Ethical Practice ──────────────────────────────────
  ipcMain.handle('db:ethicalPractice:getByPlantId', (_event, plantId: number) => {
    const db = getDb()
    return db.prepare('SELECT * FROM ethical_practice WHERE plant_id = ?').get(plantId) || null
  })

  // ── Journal Prompts ──────────────────────────────────
  ipcMain.handle('db:journal:getPrompts', (_event, filters?: {
    plantId?: number | null
    category?: string
  }) => {
    const db = getDb()
    let query = `
      SELECT jp.*, p.common_name as plant_name
      FROM journal_prompts jp
      LEFT JOIN plants p ON jp.plant_id = p.id
    `
    const conditions: string[] = []
    const params: any[] = []

    if (filters?.plantId !== undefined) {
      if (filters.plantId === null) {
        conditions.push('jp.plant_id IS NULL')
      } else {
        conditions.push('(jp.plant_id = ? OR jp.plant_id IS NULL)')
        params.push(filters.plantId)
      }
    }

    if (filters?.category) {
      conditions.push('jp.prompt_category = ?')
      params.push(filters.category)
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY jp.plant_id IS NOT NULL, jp.prompt_category, jp.id'

    return db.prepare(query).all(...params)
  })

  // ── Journal Entries ──────────────────────────────────
  ipcMain.handle('db:journal:getEntries', (_event, filters?: {
    plantId?: number
    search?: string
  }) => {
    const db = getDb()
    let query = `
      SELECT je.*, p.common_name as plant_name, jp.prompt_text
      FROM journal_entries je
      LEFT JOIN plants p ON je.plant_id = p.id
      LEFT JOIN journal_prompts jp ON je.prompt_id = jp.id
    `
    const conditions: string[] = []
    const params: any[] = []

    if (filters?.plantId) {
      conditions.push('je.plant_id = ?')
      params.push(filters.plantId)
    }

    if (filters?.search) {
      conditions.push('(je.title LIKE ? OR je.content LIKE ?)')
      const s = `%${filters.search}%`
      params.push(s, s)
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY je.entry_date DESC, je.created_at DESC'

    return db.prepare(query).all(...params)
  })

  ipcMain.handle('db:journal:createEntry', (_event, entry: {
    plant_id?: number | null
    prompt_id?: number | null
    title?: string | null
    content: string
    mood?: string | null
    season?: string | null
    entry_date?: string | null
  }) => {
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO journal_entries (plant_id, prompt_id, title, content, mood, season, entry_date)
      VALUES (@plant_id, @prompt_id, @title, @content, @mood, @season, COALESCE(@entry_date, date('now')))
    `).run({
      plant_id: entry.plant_id ?? null,
      prompt_id: entry.prompt_id ?? null,
      title: entry.title ?? null,
      content: entry.content,
      mood: entry.mood ?? null,
      season: entry.season ?? null,
      entry_date: entry.entry_date ?? null
    })
    return { id: result.lastInsertRowid }
  })

  ipcMain.handle('db:journal:updateEntry', (_event, id: number, updates: {
    title?: string | null
    content?: string
    mood?: string | null
    season?: string | null
    entry_date?: string | null
  }) => {
    const db = getDb()
    const fields: string[] = []
    const params: any = { id }

    if (updates.title !== undefined) { fields.push('title = @title'); params.title = updates.title }
    if (updates.content !== undefined) { fields.push('content = @content'); params.content = updates.content }
    if (updates.mood !== undefined) { fields.push('mood = @mood'); params.mood = updates.mood }
    if (updates.season !== undefined) { fields.push('season = @season'); params.season = updates.season }
    if (updates.entry_date !== undefined) { fields.push('entry_date = @entry_date'); params.entry_date = updates.entry_date }

    fields.push("updated_at = CURRENT_TIMESTAMP")

    db.prepare(`UPDATE journal_entries SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return { success: true }
  })

  ipcMain.handle('db:journal:deleteEntry', (_event, id: number) => {
    const db = getDb()
    db.prepare('DELETE FROM journal_entries WHERE id = ?').run(id)
    return { success: true }
  })

  // ── Wellness Goals ──────────────────────────────────────
  ipcMain.handle('db:wellness:getCategories', () => {
    const db = getDb()
    const categories = db.prepare(`
      SELECT wc.*, COUNT(wg.id) as goal_count
      FROM wellness_categories wc
      LEFT JOIN wellness_goals wg ON wc.id = wg.category_id
      GROUP BY wc.id
      ORDER BY wc.sort_order
    `).all()
    return categories
  })

  ipcMain.handle('db:wellness:getGoalsByCategory', (_event, categoryId: number) => {
    const db = getDb()
    const goals = db.prepare(`
      SELECT wg.*, wc.name as category_name, wc.slug as category_slug,
             COUNT(pwg.id) as plant_count
      FROM wellness_goals wg
      JOIN wellness_categories wc ON wg.category_id = wc.id
      LEFT JOIN plant_wellness_goals pwg ON wg.id = pwg.wellness_goal_id
      WHERE wg.category_id = ?
      GROUP BY wg.id
      ORDER BY wg.name
    `).all(categoryId)
    return goals
  })

  ipcMain.handle('db:wellness:getGoalById', (_event, id: number) => {
    const db = getDb()
    const goal = db.prepare(`
      SELECT wg.*, wc.name as category_name, wc.slug as category_slug, wc.icon as category_icon
      FROM wellness_goals wg
      JOIN wellness_categories wc ON wg.category_id = wc.id
      WHERE wg.id = ?
    `).get(id)
    if (!goal) return null

    const plantRecommendations = db.prepare(`
      SELECT pwg.*, p.id as plant_id, p.common_name, p.latin_name, p.category as plant_category,
             pp.part_type, pr.name as preparation_name
      FROM plant_wellness_goals pwg
      JOIN plants p ON pwg.plant_id = p.id
      LEFT JOIN plant_parts pp ON pwg.plant_part_id = pp.id
      LEFT JOIN preparations pr ON pwg.preparation_id = pr.id
      WHERE pwg.wellness_goal_id = ?
      ORDER BY p.common_name
    `).all(id)

    return { ...goal, plantRecommendations }
  })

  ipcMain.handle('db:wellness:search', (_event, search: string) => {
    const db = getDb()
    const s = `%${search}%`
    const goals = db.prepare(`
      SELECT wg.*, wc.name as category_name, wc.slug as category_slug, wc.icon as category_icon,
             COUNT(pwg.id) as plant_count
      FROM wellness_goals wg
      JOIN wellness_categories wc ON wg.category_id = wc.id
      LEFT JOIN plant_wellness_goals pwg ON wg.id = pwg.wellness_goal_id
      WHERE wg.name LIKE ? OR wg.description LIKE ? OR wg.desired_outcome LIKE ? OR wc.name LIKE ?
      GROUP BY wg.id
      ORDER BY wc.sort_order, wg.name
    `).all(s, s, s, s)
    return goals
  })

// ── HMBS Associations ────────────────────────────────────

  ipcMain.handle('db:hmbs:getPlants', (_event, domain?: string, strength?: string) => {
    const db = getDb()
    let sql = `
      SELECT h.*, p.common_name, p.latin_name, p.category, p.energetic_quality
      FROM plant_hmbs_associations h
      JOIN plants p ON h.plant_id = p.id
    `
    const conditions: string[] = []
    const params: any[] = []

    if (domain) {
      conditions.push('h.domain = ?')
      params.push(domain)
    }
    if (strength) {
      conditions.push('h.strength = ?')
      params.push(strength)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ` ORDER BY CASE h.strength WHEN 'primary' THEN 1 WHEN 'secondary' THEN 2 WHEN 'tertiary' THEN 3 END, p.common_name`

    return db.prepare(sql).all(...params)
  })

  ipcMain.handle('db:hmbs:getByPlantId', (_event, plantId: number) => {
    const db = getDb()
    return db.prepare(`
      SELECT * FROM plant_hmbs_associations WHERE plant_id = ? ORDER BY
      CASE strength WHEN 'primary' THEN 1 WHEN 'secondary' THEN 2 WHEN 'tertiary' THEN 3 END
    `).all(plantId)
  })

  ipcMain.handle('db:hmbs:getSummary', () => {
    const db = getDb()
    return db.prepare(`
      SELECT
        domain,
        COUNT(*) as total,
        SUM(CASE WHEN strength = 'primary' THEN 1 ELSE 0 END) as primary_count,
        SUM(CASE WHEN strength = 'secondary' THEN 1 ELSE 0 END) as secondary_count,
        SUM(CASE WHEN strength = 'tertiary' THEN 1 ELSE 0 END) as tertiary_count
      FROM plant_hmbs_associations
      GROUP BY domain
      ORDER BY CASE domain WHEN 'heart' THEN 1 WHEN 'mind' THEN 2 WHEN 'body' THEN 3 WHEN 'spirit' THEN 4 END
    `).all()
  })
}

/** Shared helper: fetch a body system with all its related data */
function getBodySystemDetail(db: ReturnType<typeof getDb>, where: string, param: number | string) {
  const bodySystem = db.prepare(`
    SELECT bs.*, pl.name as ruling_planet_name, pl.symbol as ruling_planet_symbol,
           zs.name as zodiac_sign_name, zs.symbol as zodiac_sign_symbol
    FROM body_systems bs
    LEFT JOIN planets pl ON bs.ruling_planet_id = pl.id
    LEFT JOIN zodiac_signs zs ON bs.zodiac_sign_id = zs.id
    WHERE ${where}
  `).get(param)

  if (!bodySystem) return null

  const bsAny = bodySystem as any

  // Ailments that affect this body system
  const ailments = db.prepare(`
    SELECT bsa.body_system_id, bsa.ailment_id, bsa.relevance, bsa.notes,
           a.name as ailment_name, a.category as ailment_category, a.description as ailment_description
    FROM body_system_ailments bsa
    JOIN ailments a ON bsa.ailment_id = a.id
    WHERE bsa.body_system_id = ?
    ORDER BY CASE bsa.relevance WHEN 'primary' THEN 1 WHEN 'secondary' THEN 2 WHEN 'associated' THEN 3 END, a.name
  `).all(bsAny.id)

  // Plant part correspondences (herbal, doctrine of signatures, etc.)
  const plantPartCorrespondences = db.prepare(`
    SELECT bspp.*, p.common_name as plant_common_name, p.latin_name as plant_latin_name
    FROM body_system_plant_parts bspp
    LEFT JOIN plants p ON bspp.plant_id = p.id
    WHERE bspp.body_system_id = ? AND bspp.is_food = 0
    ORDER BY bspp.correspondence_type, bspp.part_type
  `).all(bsAny.id)

  // Food correspondences (nutritional plants)
  const foodCorrespondences = db.prepare(`
    SELECT bspp.*, p.common_name as plant_common_name, p.latin_name as plant_latin_name
    FROM body_system_plant_parts bspp
    LEFT JOIN plants p ON bspp.plant_id = p.id
    WHERE bspp.body_system_id = ? AND bspp.is_food = 1
    ORDER BY bspp.food_name
  `).all(bsAny.id)

  return {
    ...bodySystem,
    ailments,
    plantPartCorrespondences,
    foodCorrespondences
  }
}
