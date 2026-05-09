# Design System

The 14 HEC design system. Atoms, molecules, and layout primitives live in
`src/components/design-system/`. The interactive catalog renders at
`/design-system` in dev.

## Charter

This charter defines the rules that govern how the design system is built and
used. Every principle here was selected to constrain a real decision in this
codebase — not as generic advice. When patterns conflict with these
principles, the principles win.

### Source of truth

**1. Tailwind composed in React is the only styling mechanism.**
We compose Tailwind tokens and utility classes inside React components. We do
not author custom CSS classes — global or scoped — for roles or component
styles. `globals.css` holds only what Tailwind cannot express: font imports,
keyframes, and base resets. It does not hold roles, component styles, or
utility duplicates.

*Test:* if a contributor adds `.foo-button` in CSS for a role that already
has a Button variant, the charter rejects it.

**2. Tokens before raw values.**
Brand colors come from Tailwind tokens (`botanical-*`, `celestial-*`,
`gold-*`, `earth-*`, `sanctuary-*`). No `rgba(93, 168, 126, …)` or `#5da87e`
in component files.

*Why:* hard-coded color values can't be grepped or rescaled as a single
change — different formats and alpha values defeat a flat search, and there
is no single point to shift the palette.

**3. Compound components express variants.**
Use `<Text.PageTitle>`, `<Button.Primary>`, `<LinkCard.Botanical>` at call
sites. Pass the `variant` prop directly only when the variant is genuinely
dynamic.

*Why:* call sites stay readable, variants are discoverable via autocomplete,
and it matches the pattern Text and Button already established.

**4. State styling lives in CSS/Tailwind.**
Hover, active, selected, focus, and disabled states use Tailwind variants
(`hover:`, `aria-selected:`, `data-[state=open]:`) and `:focus-visible`
defaults. `onMouseEnter` / `onMouseLeave` handlers that set inline `style`
are rejected unless the value is genuinely computed from data.

### Typography

**5. Type scale: name order equals visual order.**
`Display > PageTitle > Heading > Subheading > SectionTitle > CardTitle >
SectionLabel`. Sizes decrease monotonically in that order. No exceptions.

**6. Typography optimizes for readability and scannability.**
This is a data- and text-heavy app. The type system favors comfortable
reading and density first, expressive treatments second. Display fonts,
gradient text, and ornamental treatments are reserved for intentional
surfaces (see #14).

**7. System fonts carry UI; Playfair Display marks branded moments.**
The `system-ui` stack is the default for navigation, buttons, body copy,
data, and most headings — it is the most readable and scannable face on
every device the PWA runs on, and it fits the data-heavy nature of the app.
Playfair Display is reserved for genuine branded moments: hero titles, key
section headings where distinction matters, Latin botanical names, and
editorial passages such as quotes and prompts. Numeric data uses tabular
figures (`tabular-nums`) so values align in lists, tables, and stat cards.
No monospace face is loaded.

**8. Density floor: 12px is the minimum body size.**
Card titles ≥ 16px. List-item primary text ≥ 14px. 10–11px is reserved for
eyebrows and metadata. `text-[9px]` is not used outside one-off compliance
footers.

### Layout

**9. Layout lives in primitives, not in feature components.**
Feature components compose `<PageHeader>`, `<SplitPane>`, `<FilterBar>`,
`<Tabs>`, `<SectionCard>`. They do not hand-roll page chrome, grids, or
gradient hero orbs.

**10. Atoms from the ground up; canonical layouts from the top down.**
Two parallel tracks meet in the middle: we build a strong atomic foundation
upward (tokens → atoms → molecules), and we define canonical browsing
layouts downward, tailored to the nature of the data each view explores
(plant catalog, ailment cross-reference, astrology, journal, etc.). Feature
implementation lives at the meeting point.

### Quality bars

**11. Accessibility is a gate, not an afterthought.**
Every component meets WCAG 2.1 AA: keyboard navigable, screen-reader
labeled, contrast-checked, focus-visible, motion-respectful. A component
that does not pass accessibility review is not done.

**12. Responsive: first-class small and large screen support.**
Layouts are designed for both ends of the spectrum — handheld and large
desktop — not for one with the other treated as an afterthought.
Breakpoints, reflow, touch targets, and pointer affordances are
design-time concerns, not retrofit work.

**13. Icons are named components.**
Icons live in a typed icon library inside the design system, exported as
named components (`<Icon.Plant>`, `<Icon.Heart>`, `<Icon.PlanetMars>`).
Inline unicode glyphs and ad-hoc emoji are not used in source.

### Aesthetic

**14. Calm foundation, expressive moments.**
The base UI is quiet — earth surfaces, single-color glass, restrained
motion. Domain expression (HMBS gradients, planetary color maps, aurora
orbs, animated borders, gradient text) is reserved for intentional surfaces:
heroes, dashboards, domain-themed details. It is not the default. A
navigator list page should read as ordinary relative to a planetary-timing
or HMBS surface.

### Process

**15. New UI replaces old; no ad-hoc migration.**
We do not retrofit existing pages piecemeal as we touch them. We design the
canonical layouts, build the atoms and molecules they need, and compose new
views that replace the old ones outright. Ad-hoc migration is how drift
returns; intentional replacement is how cohesion holds.

**16. The catalog is the doc; new patterns are proposed before added.**
The `/design-system` page is the living catalog. New atoms, molecules, or
layout primitives appear there with a short usage rationale before they
propagate. One-off treatments inside a feature are fine — they do not
graduate to primitives without intentional review.

## Rules

The Charter is *how we work*. The Rules are *what the system commits to
producing and maintaining*. Each rule below names a concrete artifact or
pattern that must exist, be documented in the catalog, and be the canonical
answer for its problem domain.

### Foundations

**1. Typography scale.**
The system defines a named, hierarchically-ordered type scale. Every variant
has a single canonical size, weight, and family assignment. Starting point
(to be re-anchored when the `Text` atom is rebuilt under the charter):

| Variant | Current | Proposed |
|---|---|---|
| Display | 30px | 36–40px |
| PageTitle (h1) | 20px | 28–30px |
| Heading (h2) | 24px | 22px |
| Subheading (h3) | 18px | 18px |
| SectionTitle | 16px | 16–17px |
| CardTitle | 14px | 16px |
| SectionLabel | 11px upper | 11px upper |

Family assignment (system vs Playfair) follows charter principle #7. Numeric
values use `tabular-nums`.

**2. Color tokens.**
All colors are defined as Tailwind tokens — none are authored as raw `#hex`
or `rgba(...)` in components. The `/design-system` catalog demos every token
as a labeled color chip and every gradient (botanical, celestial, gold,
hmbs, warm, teal) as a labeled gradient chip. Adding a new color requires
adding the token first; the chip then appears in the catalog automatically.

**3. Spacing scale.**
The system declares which Tailwind spacing steps are canonical and what
each is for: component internal padding, stack gap inside a card, gap
between cards in a grid, gap between sections within a view, and page-margin
gutters at each breakpoint. Spacing values outside this scale require
justification — drift here erodes rhythm even when type and color are
correct.

**4. Iconography.**
A defined icon set lives in the design system, exported as named components
(`<Icon.Plant>`, `<Icon.Heart>`, `<Icon.PlanetMars>`). The set declares:
which icons exist, the canonical sizes (e.g. 16 / 20 / 24), the stroke
weight, and the rules for adding new icons. Inline unicode glyphs and
ad-hoc emoji are not used in source (per charter #13).

### Patterns

**5. Cards and canonical layouts.**
The system defines canonical card components and the canonical layouts
they compose into. The canonical set:

- *Dashboard* — entry-point overview; bento-style grid of cards.
- *Catalog → Detail* — large filterable set; selecting an item routes to a
  dedicated detail page with back navigation. List and detail are separate
  routes.
- *List + Detail* — medium scrollable list paired with a persistent detail
  pane; selection updates detail in place; no route change.
- *Picker + Detail* — small, domain-shaped selector (quadrant, season,
  zodiac grid, hourly clock, small table) paired with a persistent detail
  pane.

Each layout owns its responsive behavior — small and large screens are
both first-class. Each names its primitives, specifies behavior, and shows
a worked example in the catalog. Feature views compose these; they do not
redefine them.

Views that don't fit a canonical layout — forms, CRUD tools, faceted query
builders — are *bespoke for now* and live in an Other category in the
catalog. Canonical patterns may emerge later (e.g. a shared form layout)
but are not pre-emptively designed.

**6. Page-header pattern.**
A canonical `<PageHeader>` covers all top-of-view headers. Variants: plain
(title + subtitle), hero (title + subtitle + ambient gradient/orb), and
hero-with-embedded-action (search or primary CTA). Variant selection is
parameterized; bespoke per-page heroes are not built.

**7. Chip / badge taxonomy.**
Chips and badges are categorized by *semantic role*, not just color:
- *Category* (entheogenic vs conventional, plant category)
- *Element* (fire / water / air / earth)
- *Domain* (heart / mind / body / spirit)
- *Evidence level* (clinical / traditional / ethnobotanical / anecdotal)
- *Severity* (mild / moderate / severe — for contraindications)

Each role has a defined color mapping rooted in the color tokens. New
badges declare which role they belong to; ad-hoc one-offs do not enter the
system.

**8. Tabs / pills.**
A canonical `<Tabs>` (and/or `<Pills>`) covers all tabbed and pill-toggle
surfaces. The four current hand-rolled implementations (EntheogenicGuide,
AstrologyView, DoctrineExplorer, HMBSView) are replaced by it. Keyboard
navigation, ARIA roles, and active-state styling are defined once and
inherited everywhere.

**9. Filter behavior.**
A canonical `<FilterBar>` covers all list-view filtering. It composes:
search input, faceted selects, applied-filter chips, and a clear/reset
action. Filter state is URL-synced so filtered views are linkable.
Debouncing, empty results, and "no matches" state are specified once and
shared across every list.

**10. Empty, loading, and error states.**
Every list, detail, and async surface declares its three non-happy-path
states:
- *Loading* — uses a `<Skeleton>` primitive that mirrors the eventual
  layout, not a generic spinner.
- *Empty* — uses an `<EmptyState>` with icon + headline + body + optional
  action.
- *Error* — uses an `<ErrorState>` with a retry affordance.

These are first-class surfaces. Inline strings ("No results found") and
unstyled fallbacks are not acceptable.
