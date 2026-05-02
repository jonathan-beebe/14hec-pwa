# 14 HEC — Electron to PWA Port

## Overview

Ported the 14 HEC desktop app (Electron 33 + better-sqlite3) to a Progressive Web App using Vite, React, TypeScript, Tailwind CSS, and vite-plugin-pwa. The PWA is installable, works offline, and every view is URL-routable.

## Stack

| Layer | Electron (before) | PWA (after) |
|---|---|---|
| Runtime | Electron 33 / Node 24 | Browser (any modern) |
| Build | electron-vite | Vite 6 |
| Database | SQLite via better-sqlite3 | In-memory JS from bundled JSON |
| Data access | IPC bridge (`window.api.*`) | Imported module (`api.*`) |
| Mutable storage | SQLite (journal entries) | localStorage |
| Navigation | Custom `Page` union + `useState` | react-router-dom v6 (URL-based) |
| Installability | Electron `.dmg` / `.exe` | PWA manifest + service worker |
| Updates | Electron auto-updater | Service worker prompt banner |

## Architecture

### Data layer (`src/data/`)

- **`db.ts`** — Imports all 11 seed JSON files as ES modules. On module load, assigns sequential IDs and builds indexed `Map` structures (by ID, by name) for every entity and junction table. Mirrors the resolution logic from `seed-data.ts` (name-to-ID lookups for planets, zodiac signs, ailments, compounds, preparations, etc.).

- **`api.ts`** — Exports an `api` object with the exact same method signatures as the Electron `window.api`. Each of the 60+ methods queries the in-memory Maps/arrays from `db.ts` using plain JS (filter, map, sort). Returns Promises to maintain the async interface components already expect.

- **`journal-store.ts`** — Reads/writes journal entries to `localStorage`. Implements `getEntries`, `createEntry`, `updateEntry`, `deleteEntry` with auto-incrementing IDs.

### Routing (`src/App.tsx`)

Replaced the `Page` union type + `useState` navigation with react-router-dom v6 routes:

| Path | Component |
|------|-----------|
| `/` | Dashboard |
| `/plants` | PlantList |
| `/plants/:id` | PlantDetail |
| `/ailments` | AilmentNavigator |
| `/ailments/:id` | AilmentDetail |
| `/wellness` | WellnessNavigator |
| `/wellness/:id` | WellnessDetail |
| `/preparations` | PreparationMatrix |
| `/entheogens` | EntheogenicGuide |
| `/body-systems` | BodySystemsView |
| `/body-systems/:id` | BodySystemsView |
| `/astrology` | AstrologyView |
| `/natal-chart` | NatalInput |
| `/planetary-timing` | PlanetaryTiming |
| `/hmbs` | HMBSView |
| `/seasonal` | SeasonalGuide |
| `/doctrine` | DoctrineExplorer |
| `/journal` | JournalView |
| `/crossref` | CrossReference |

Layout wraps all routes via `<Outlet />`. Sidebar uses `<Link>` components and `useLocation()` for active state.

### PWA features (`vite.config.ts`)

- `vite-plugin-pwa` with `registerType: 'prompt'` — does not auto-reload; triggers a callback when a new service worker is available
- Web app manifest: `display: standalone`, themed icons, dark background
- Workbox precaches all build assets (JS, CSS, HTML, icons)
- Runtime caching for Google Fonts (CacheFirst, 1-year expiry)
- `UpdateBanner` component shows "Update" / "Dismiss" buttons when a new version is deployed

## Changes per component

Every component received three mechanical changes:

1. **`window.api.*` → `import { api } from '@/data/api'`** then `api.*`
2. **`navigate` prop removed** → `useNavigate()` hook from react-router-dom
3. **`id` prop removed** (detail views) → `useParams()` hook, `Number(id)`

Additionally:
- `Layout.tsx` — uses `<Outlet />` instead of `{children}`
- `Sidebar.tsx` — uses `<Link>` + `useLocation()` instead of `<button onClick={navigate}>`
- `App.tsx` — full rewrite: `<Routes>` with all 19 routes, `ScrollToTop`, `UpdateBanner`, `DisclaimerModal`

## Files copied verbatim

- `src/styles/globals.css` — all 744 lines of Tailwind layers
- `src/data/seed/*.json` — all 11 seed data files (~3.2 MB)
- `tailwind.config.cjs` — custom color palettes, animations, shadows (updated `content` paths only)
- `postcss.config.cjs` — no changes
- `src/types/index.ts` — all TypeScript interfaces (removed `declare global` block)

## Files written from scratch

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite + React + PWA plugin configuration |
| `src/data/db.ts` | In-memory database from JSON seed files |
| `src/data/api.ts` | 60+ API methods as JS array operations |
| `src/data/journal-store.ts` | localStorage CRUD for journal entries |
| `src/components/common/UpdateBanner.tsx` | Service worker update prompt |
| `src/App.tsx` | React Router route definitions |
| `src/main.tsx` | BrowserRouter + React root mount |
| `public/favicon.svg` | App icon source |

## Build output

- Dev server: ~160ms startup
- Production: ~1.1s build, 677 KB gzipped
- Service worker precaches 12 entries
- Zero TypeScript errors

## Known limitations

- Journal entries from the Electron SQLite database are not migrated — the PWA starts fresh with localStorage
- No mobile-responsive sidebar yet (the Electron app assumed a fixed desktop window)
- `plant_research_notes` table is empty in seed data — the API returns `[]` for research notes
- `ailment_planet_associations` and `ailment_zodiac_associations` have no seed data — these junction tables return empty arrays
