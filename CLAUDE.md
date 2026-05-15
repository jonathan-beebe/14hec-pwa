# 14 HEC — Plant Intelligence System (PWA)

## What This Is
14 HEC is a Progressive Web App that serves as a comprehensive herbal,
energetic, and celestial plant intelligence system. It cross-references
207+ plants with their medicinal properties, astrological associations, chemical
compounds, body system correspondences, and traditional teachings.

Shareable via URL — no app store, no downloads. Installable on home screen,
launches in standalone mode, and works offline.

Ported from the [Electron desktop app](../14hec/).

**"14 HEC"** = Herbal, Energetic, Celestial — the three pillars of plant knowledge.

**Core philosophy:** Plants activate what is already within us. They are mirrors
and catalysts, not additions. The teachings section reflects this — plants do not
add compounds to our bodies; they activate our innate intelligence.

## Tech Stack
- **Runtime:** Browser (any modern browser)
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS 3.4 with custom dark theme (glassmorphism design)
- **Data:** In-memory from bundled JSON (no database, no server)
- **Build:** Vite 6 + vite-plugin-pwa
- **Routing:** react-router-dom v6 (URL-based, every view is routable)
- **Package manager:** npm (not yarn, not pnpm)
- **Fonts:** Inter (body) + Playfair Display (headings) via Google Fonts

## Project Structure
```
src/
  main.tsx                  # React root mount with BrowserRouter
  App.tsx                   # Route definitions (19 routable views)
  vite-env.d.ts             # Vite + PWA type declarations
  styles/
    globals.css             # Global styles + Tailwind directives (744 lines)
  types/
    index.ts                # All TypeScript interfaces
  data/
    db.ts                   # In-memory database built from seed JSON
    api.ts                  # 60+ query methods (mirrors Electron IPC API)
    journal-store.ts        # Journal entries in localStorage
    seed/                   # JSON data files (SOURCE OF TRUTH for plant data)
      plants.json           # 207 plants with parts, associations, compounds (1.3MB)
      ailments.json         # 75 ailments (physical/emotional/spiritual)
      body-systems.json     # 25 body systems with ailment + plant mappings
      plant-teachings.json  # 30 teachings + 93 journal prompts
      compounds.json        # 91 chemical compounds
      preparations.json     # Herbal preparation methods
      wellness-goals.json   # Wellness categories, goals, and plant mappings
      hmbs-associations.json # Heart/Mind/Body/Spirit plant domain mappings
      ethical-practice.json # Ethical practice guidance per plant
      zodiac.json           # 12 zodiac signs
      planets.json          # Astrological planets
  components/
    Dashboard.tsx           # Landing page with stats, featured plant, nav cards
    plants/                 # PlantList, PlantDetail, EntheogenicGuide
    ailments/               # AilmentNavigator, AilmentDetail
    astrology/              # AstrologyView, NatalInput, PlanetaryTiming
    bodysystems/            # BodySystemsView (list + detail via URL param)
    journal/                # JournalView (CRUD journal with guided prompts)
    sanctuary/              # HMBSView, SeasonalGuide, DoctrineExplorer
    crossref/               # CrossReference (multi-axis query engine)
    preparations/           # PreparationMatrix
    wellness/               # WellnessNavigator, WellnessDetail
    layout/                 # Layout (Outlet wrapper), Sidebar (Link-based nav)
    common/                 # DisclaimerModal, UpdateBanner
```

## How the Data Layer Works
- All plant data is bundled as JSON and loaded into memory on page load
- `src/data/db.ts` imports the 11 seed JSON files, assigns sequential IDs, and
  builds indexed `Map` structures for fast lookup — mirrors the Electron app's
  `seed-data.ts` resolution logic (name-to-ID mappings)
- `src/data/api.ts` exports the same method signatures as the Electron
  `window.api`, so components use the same async patterns (`api.getPlantById(42)`)
- Journal entries (the only mutable data) are stored in `localStorage`
  via `src/data/journal-store.ts`
- The seed JSON files in `src/data/seed/` ARE the data source of truth
- To update data: edit the JSON files and restart the dev server (or rebuild)
- No database reset step — data is bundled at build time
- CHECK constraints from the Electron schema are enforced by the seed data itself:
  - plant_parts.part_type: only 'root','bark','stem','leaf','flower','seed_fruit','resin_sap','fungal_body','whole'
  - plants.latin_name is unique

## Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server with hot reload
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview the production build locally
```

## Architecture Patterns

### Data Access (replaces Electron IPC)
```
Component: api.getPlantById(42)
  → api.ts: queries in-memory Maps from db.ts
    → Returns Promise<PlantDetail> (same shape as Electron)
```
All data access goes through the `api` module imported from `@/data/api`.
Components never access `db.ts` directly.

### URL-Based Routing (react-router-dom v6)
Every view has a URL. Detail views use path params:
```
/                    → Dashboard
/plants              → PlantList
/plants/:id          → PlantDetail
/ailments            → AilmentNavigator
/ailments/:id        → AilmentDetail
/wellness            → WellnessNavigator
/wellness/:id        → WellnessDetail
/body-systems        → BodySystemsView (list)
/body-systems/:id    → BodySystemsView (detail)
/astrology           → AstrologyView
/natal-chart         → NatalInput
/planetary-timing    → PlanetaryTiming
/entheogens          → EntheogenicGuide
/preparations        → PreparationMatrix
/crossref            → CrossReference
/hmbs                → HMBSView
/seasonal            → SeasonalGuide
/doctrine            → DoctrineExplorer
/journal             → JournalView
```

Navigation uses `useNavigate()` hook and `<Link>` components.
Detail components use `useParams()` to read `:id` from the URL.
Layout wraps all routes via `<Outlet />`.

### PWA
- `vite-plugin-pwa` with `registerType: 'prompt'` — shows an update banner
  instead of auto-reloading
- Web app manifest: `display: standalone`, dark theme, app icons
- Workbox precaches all build assets for offline use
- Google Fonts cached via workbox runtime caching (CacheFirst, 1-year expiry)
- `UpdateBanner` component renders "Update" / "Dismiss" when a new service
  worker is detected

### Design System
Premium dark theme with glassmorphism. Custom Tailwind color palettes:
- `botanical` (green) — plants, nature
- `earth` (warm neutrals) — text, backgrounds
- `celestial` (purple) — astrology, mystical
- `gold` (amber) — teachings, journal, sacred
- `teal/silver` — presence energetics, living with plants
- HMBS domains: heart (rose), mind (blue), body (green), spirit (purple)

### Domain Language
The codebase has two domains, and only two:

1. **Plants and plant medicine** — herbal, energetic, and celestial
   vocabulary: *yarrow*, *contraindication*, *entheogen*, *quadrant*,
   *retrograde*, *teaching*, *latin name*.
2. **The web and PWAs** — the established vocabulary of HTML, ARIA, CSS,
   React, react-router, and browser APIs: *link*, *selected*, *hovered*,
   *focus-visible*, *aria-current*, *route*, *form control*, *transition*.

Names in code come from one of these two vocabularies. Don't invent a
third one. If a contributor reads a symbol in isolation and can't tell
whether it came from the herbal materia medica or from MDN, it shouldn't
exist.

*Recent example:* "engaged" was a coined alias for `selected || hovered`.
It is gone — the expression is inlined where it's used, and the CSS
values it once labeled are named by what they render (`glowShadow`,
`selectedBackground`), not by a state meta-term.

This applies to props, locals, CSS-string identifiers, comments, and
file names. The two domain vocabularies are already large and
expressive; use them.

## Accessibility

All new work strives to adhere to [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
guidelines. Accessibility is not a follow-up pass — it is part of the
definition of done for any feature, component, or change. Aim for WCAG
2.2 AA as the baseline.

Concretely, this means: semantic HTML over `<div>` soup, proper roles
and ARIA where semantics aren't enough, keyboard operability for every
interactive element, visible focus indicators, sufficient color
contrast, alt text on meaningful imagery, and form controls with real
labels. When in doubt, run the `/my-accessibility-audit` skill.

## Testing & TDD

We use **Vitest + React Testing Library**. TDD is the default workflow —
write the test first, watch it fail, make it pass, refactor.

### Functional core, imperative shell
Push logic out of React components and into pure functions. Pure
functions are fast to test (no DOM, no jsdom, no async rendering).
Components become thin shells that wire data to the UI.

- **Functional core** — pure functions that take data in and return data
  out: engines (`crossref-engine.ts`, `natal-engine.ts`), calculators
  (`natal-chart-calc.ts`), formatters (`formatCatalogStatus.ts`), query
  helpers (`api.ts`). These live in `.ts` files and run under the `node`
  test environment (no jsdom overhead).
- **Imperative shell** — React components that call the core, manage
  state, and render UI. These live in `.tsx` files and opt into jsdom
  via `// @vitest-environment jsdom`.

When adding new behavior, ask: *can this be a pure function?* If yes,
write it as one and unit-test it in a `.test.ts` file. The component
that consumes it needs only a thin integration test.

### Test pyramid — optimize for speed
1. **Unit tests (fast, many)** — test the functional core. Pure `.ts`
   files, `node` environment, no DOM. Sub-millisecond per test.
   Also unit-test individual components in isolation where practical
   (render one component, assert on its output).
2. **Integration tests (slower, fewer)** — test assembled flows: route
   transitions, filter-to-URL sync, list-to-detail navigation. These
   render a scoped route table in jsdom. Keep them focused on the
   interaction, not on re-verifying logic the unit tests already cover.

Favor many fast unit tests over fewer slow integration tests. If a test
needs jsdom, make sure the behavior can't be tested as a pure function
instead.

### TDD flow
1. **Red** — write a failing test that describes the new behavior.
2. **Green** — write the minimum code to make it pass.
3. **Refactor** — clean up while tests stay green.

For refactors of existing code, add characterization tests first
(passing, against current code), then refactor, then verify green.

### Conventions
- **Real data over fixtures.** Tests import the real `src/data/api.ts`
  and the real seed JSON. No mocks unless isolation truly cannot be
  achieved otherwise.
- **No non-null assertions (`!`).** After `expect(x).not.toBeNull()`,
  narrow with `if (!x) throw new Error('...')` so TypeScript narrows
  the type and the failure message is informative.
- **Colocate tests** next to the source: `Foo.tsx` → `Foo.test.tsx`,
  `api.ts` → `api.test.ts`.
- **Default environment is `node`.** Only `.test.tsx` files that render
  components opt into jsdom with `// @vitest-environment jsdom` on
  line 1. Pure-logic `.test.ts` files must not pay the jsdom tax.
- **Integration tests use scoped route tables** — only the routes the
  test exercises, never the full `App.tsx` tree. Use `renderWithRouter`
  from `@/test/render`.
- **Query by role first**, then label, then text. Avoid querying by
  class. Use `findBy*` for async-rendered content; reach for manual
  `waitFor` only when `findBy*` cannot express the condition.
- **Prefer `userEvent` over `fireEvent`** — closer to real user
  behavior. Always `userEvent.setup()` first.
- **jsdom is not a browser.** It cannot validate layout, CSS, or
  service-worker behavior. Don't try to test those here — that is the
  line where Playwright (not currently installed) would take over.

### Commands
```
npm test          # watch mode
npm run test:run  # single CI-style run
npm run test:ui   # browser dashboard with DOM snapshots
```

### Skills (entry points for agentic flows)
- `/test-unit <target>` — write a unit test for a function or module
- `/test-integration <flow>` — write an integration test for a user flow
- `/test-verify [pattern]` — run tests and interpret results
- `/tdd-refactor <change>` — full identify → test → change → verify workflow

Canonical examples: `src/data/api.test.ts` (unit), `src/components/Dashboard.test.tsx` (integration).

## Adding a New Feature (checklist)
1. Add seed data JSON in `src/data/seed/` if needed
2. Update `src/data/db.ts` to import and index the new data
3. Add query methods in `src/data/api.ts`
4. Add TypeScript types in `src/types/index.ts`
5. Create component(s) in `src/components/`
6. Add route in `src/App.tsx`
7. Add navigation link in `src/components/layout/Sidebar.tsx`
8. Optionally add Dashboard card in `src/components/Dashboard.tsx`
9. Restart dev server to pick up new seed data

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
- `src/App.tsx` — route definitions
- `src/components/layout/Sidebar.tsx` — navigation links
- `src/data/api.ts` — query methods
- `src/data/db.ts` — data indexing
- `src/types/index.ts` — type definitions

## What NOT to Commit
- `node_modules/` — installed via `npm install`
- `dist/` — build artifacts, regenerated
- `.DS_Store` — macOS metadata
- `.env` / `.env.local` — secrets
- Personal Claude settings

## Current Data Counts
- 207 plants, 75 ailments, 91 compounds
- 25 body systems, 219 body-ailment mappings
- 30 plant teachings, 35 presence energetics, 105 journal prompts
- 806 contraindications, 797 plant-ailment associations
- 441 plant parts, 48 body-system plant part correspondences
