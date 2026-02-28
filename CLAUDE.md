# 14 HEC — Plant Intelligence System

## What This Is
14 HEC is a desktop application (Electron 33) that serves as a comprehensive
herbal, energetic, and celestial plant intelligence system. It cross-references
207+ plants with their medicinal properties, astrological associations, chemical
compounds, body system correspondences, and traditional teachings.

**"14 HEC"** = Herbal, Energetic, Celestial — the three pillars of plant knowledge.

**Core philosophy:** Plants activate what is already within us. They are mirrors
and catalysts, not additions. The teachings section reflects this — plants do not
add compounds to our bodies; they activate our innate intelligence.

## Tech Stack
- **Runtime:** Electron 33 (Node 24)
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS 3.4 with custom dark theme (glassmorphism design)
- **Database:** better-sqlite3 with WAL mode, foreign keys enabled
- **Build:** electron-vite 2.3
- **Package manager:** npm (not yarn, not pnpm)
- **Fonts:** Inter (body) + Playfair Display (headings) via Google Fonts

## Project Structure
```
src/
  main/                   # Electron main process
    index.ts              # App entry: creates window, inits DB, registers IPC
    database.ts           # SQLite init, schema migrations, WAL mode
    seed-data.ts          # Loads JSON seed files into fresh database
    ipc-handlers.ts       # All IPC handlers (the backend API)
    migrations/           # SQL schema files applied in order
      001-initial-schema.sql
      002-body-systems.sql
      003-teachings-journal.sql
  preload/
    index.ts              # Context bridge: exposes window.api with 20+ methods
  renderer/               # React SPA
    App.tsx               # Page routing via Page union type + useState
    main.tsx              # React root mount
    types/index.ts        # All TypeScript interfaces
    styles/globals.css    # Global styles + Tailwind directives
    components/
      Dashboard.tsx       # Landing page with stats, featured plant, nav cards
      plants/             # PlantList, PlantDetail, EntheogenicGuide
      ailments/           # AilmentNavigator, AilmentDetail
      astrology/          # AstrologyView, NatalInput, PlanetaryTiming
      bodysystems/        # BodySystemsView (list + detail)
      journal/            # JournalView (CRUD journal with guided prompts)
      sanctuary/          # HMBSView, SeasonalGuide, DoctrineExplorer
      crossref/           # CrossReference (multi-axis query engine)
      preparations/       # PreparationMatrix
      layout/             # Layout, Sidebar
      common/             # DisclaimerModal
  seed/                   # JSON data files (SOURCE OF TRUTH for plant data)
    plants.json           # 207 plants with parts, associations, compounds (1.3MB)
    ailments.json         # 75 ailments (physical/emotional/spiritual)
    body-systems.json     # 25 body systems with ailment + plant mappings
    plant-teachings.json  # 30 teachings + 93 journal prompts
    compounds.json        # 91 chemical compounds
    preparations.json     # Herbal preparation methods
    zodiac.json           # 12 zodiac signs
    planets.json          # Astrological planets
```

## How the Database Works
- SQLite database lives at `~/Library/Application Support/14hec/14hec.db`
- Created automatically on first app launch from seed JSON files
- NEVER commit .db files — they are machine-specific, generated from seed data
- To reset the database: `rm ~/Library/Application\ Support/14hec/14hec.db*` then relaunch
- Schema is defined in `src/main/migrations/*.sql` (applied in numeric order)
- Seed data is loaded by `src/main/seed-data.ts` from `src/seed/*.json`
- The seed JSON files ARE the data source of truth, not the SQLite file
- CHECK constraint on plant_parts.part_type: only 'root','bark','stem','leaf','flower','seed_fruit','resin_sap','fungal_body','whole'
- plants.latin_name has a UNIQUE constraint

## Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev mode (electron-vite dev)
npm run build            # Production build (electron-vite build)
npx electron-vite dev    # Alternative dev start
```

## Architecture Patterns

### IPC Bridge Pattern (main ↔ renderer)
```
Renderer: window.api.getPlantById(42)
  → Preload: ipcRenderer.invoke('db:plants:getById', 42)
    → Main: ipcMain.handle('db:plants:getById', handler)
      → SQLite query → return result
```
All data access goes through this bridge. No direct DB access from renderer.

### State-Based Navigation (no URL routing)
App.tsx uses a `Page` union type with `useState` — not react-router URL-based routing.
```typescript
type Page =
  | { view: 'dashboard' }
  | { view: 'plant-detail'; id: number }
  | { view: 'journal' }
  // ... etc
```

### Design System
Premium dark theme with glassmorphism. Custom Tailwind color palettes:
- `botanical` (green) — plants, nature
- `earth` (warm neutrals) — text, backgrounds
- `celestial` (purple) — astrology, mystical
- `gold` (amber) — teachings, journal, sacred
- `teal/silver` — presence energetics, living with plants
- HMBS domains: heart (rose), mind (blue), body (green), spirit (purple)

## Adding a New Feature (checklist)
1. Add SQL schema in new migration: `src/main/migrations/00X-name.sql`
2. Add migration filename to array in `src/main/database.ts`
3. Add seed data JSON in `src/seed/` if needed
4. Update `src/main/seed-data.ts` to load new seed data
5. Add IPC handlers in `src/main/ipc-handlers.ts`
6. Expose new methods in `src/preload/index.ts`
7. Add TypeScript types in `src/renderer/types/index.ts`
8. Create component(s) in `src/renderer/components/`
9. Add view to the `Page` type union in `src/renderer/App.tsx`
10. Add navigation in `src/renderer/components/layout/Sidebar.tsx`
11. Optionally add Dashboard card in `src/renderer/components/Dashboard.tsx`
12. Delete old DB and relaunch to test: `rm ~/Library/Application\ Support/14hec/14hec.db*`

## Git Workflow
- **Remote:** GitHub (private repo)
- **Main branch:** `main` — stable "best version", only merged via pull request
- **Personal branches:** `james/*`, `shannon/*`, `rafa/*`
- **Before starting work:** `bash scripts/sync.sh`
- **When done:** `bash scripts/publish.sh` then create PR
- **Merge strategy:** regular merge commits (preserves full history)
- **Branch naming:** `yourname/short-description` (e.g., `shannon/add-search-filters`)

## High-Conflict Files (coordinate before editing)
These files are touched by almost every feature. If two people edit them simultaneously,
merge conflicts are likely. Coordinate via the workstreams doc in Google Drive.
- `src/renderer/App.tsx` — page routing
- `src/renderer/components/layout/Sidebar.tsx` — navigation
- `src/main/ipc-handlers.ts` — backend API
- `src/preload/index.ts` — API bridge
- `src/renderer/types/index.ts` — type definitions

## What NOT to Commit
- `node_modules/` — installed via `npm install`
- `out/`, `dist/` — build artifacts, regenerated
- `*.db`, `*.db-wal`, `*.db-shm` — generated per machine
- `.DS_Store` — macOS metadata
- `.env` / `.env.local` — secrets
- Personal Claude settings

## Current Database Counts
- 207 plants, 75 ailments, 91 compounds
- 25 body systems, 219 body-ailment mappings
- 30 plant teachings, 35 presence energetics, 105 journal prompts
- 806 contraindications, 797 plant-ailment associations
- 441 plant parts, 48 body-system plant part correspondences
