# 14 HEC — Plant Intelligence System (PWA)

A Progressive Web App for exploring herbal, energetic, and celestial plant intelligence. Cross-references 207+ plants with ailments, astrology, body systems, and traditional teachings.

Share it with anyone by sending them a link — no app store, no downloads. Installable on home screen, launches full screen, works offline.

Built with Vite, React 18, TypeScript, Tailwind CSS, and vite-plugin-pwa. Ported from the [Electron desktop app](../14hec/).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Opens at `http://localhost:5173/`. All plant data is bundled — no database setup needed.

## Commands

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Production build (TypeScript check + Vite build)
npm run preview   # Preview the production build locally
```

## Architecture

```
src/
  main.tsx                    # React root with BrowserRouter
  App.tsx                     # Route definitions (19 views)
  styles/globals.css          # Tailwind directives + custom design system
  types/index.ts              # All TypeScript interfaces
  data/
    db.ts                     # In-memory database from seed JSON
    api.ts                    # 60+ query methods (drop-in replacement for Electron IPC)
    journal-store.ts          # Journal entries in localStorage
    seed/                     # 11 JSON data files (source of truth)
  components/
    Dashboard.tsx             # Landing page with stats and navigation
    layout/                   # Layout (Outlet wrapper), Sidebar (Link-based nav)
    plants/                   # PlantList, PlantDetail, EntheogenicGuide
    ailments/                 # AilmentNavigator, AilmentDetail
    astrology/                # AstrologyView, NatalInput, PlanetaryTiming
    bodysystems/              # BodySystemsView (list + detail)
    journal/                  # JournalView (localStorage CRUD)
    sanctuary/                # HMBSView, SeasonalGuide, DoctrineExplorer
    crossref/                 # CrossReference (multi-axis query)
    preparations/             # PreparationMatrix
    wellness/                 # WellnessNavigator, WellnessDetail
    common/                   # DisclaimerModal, UpdateBanner
```

### Data Layer

All plant data is bundled as JSON and loaded into memory on page load. No SQLite, no IndexedDB, no server — the full dataset (~3.2 MB, ~677 KB gzipped) ships with the app.

- **`db.ts`** imports the 11 seed JSON files, assigns IDs, and builds indexed `Map` structures for fast lookup
- **`api.ts`** exports the same method signatures as the Electron `window.api`, so components use the same async patterns
- **`journal-store.ts`** persists journal entries (the only mutable data) to `localStorage`

### Routing

Every view has a URL via react-router-dom v6. Detail views use path params (`/plants/:id`, `/ailments/:id`, etc.). The sidebar uses `<Link>` components with `useLocation()` for active state.

### PWA

- Installable in standalone mode (web app manifest with `display: standalone`)
- Service worker precaches all assets for offline use
- When a new version is deployed, an update banner appears with "Update" and "Dismiss" buttons
- Google Fonts cached for 1 year via workbox runtime caching

## Updating Seed Data

The seed JSON files in `src/data/seed/` are the source of truth for all plant data. After editing them, restart the dev server or rebuild — the data is bundled at build time, so changes appear immediately.

No database reset step needed (unlike the Electron app).

## Using Claude Code

Open a Claude Code session in the project directory. Claude will automatically read `CLAUDE.md` and understand the full architecture, conventions, and workflow. Just describe what you want to build and Claude will follow the project patterns.

## Team

- **James** — Co-founder
- **Shannon** — Co-founder
- **Rafa** — Co-founder

Coordination docs, design assets, and releases live in the shared Google Drive folder.
