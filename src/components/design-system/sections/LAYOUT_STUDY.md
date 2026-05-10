# Layout Study

This document captures the analysis behind the canonical layouts in the
14 HEC design system: the principles for choosing one over another, a
critical pass over every feature in the app, and the open questions that
the layout primitives will need to answer.

The canonical layouts themselves are demonstrated in the *Layouts* section
of `/design-system`. The rules that govern them are codified in the
design system [README](../README.md) under Rule #5. This document is the
*reasoning* layer — useful when deciding which layout a new feature
belongs in, or when reconsidering where an existing feature lives.

## The primary question

What is the selector?

The selector — whatever the user actually interacts with to *find* an
item — determines the layout. Detail behavior, route behavior, and
responsive arrangement all follow from it.

| Selector shape | Layout |
|---|---|
| Domain-structured: wheel, quadrant, calendar, table, clock | **Picker + Detail** |
| Generic scrollable list of homogeneous items | **List + Detail** |
| Search + faceted filters opening to a discrete detail page | **Catalog → Detail** |
| No selector — orientation surface | **Dashboard** |
| Not a browse (form, CRUD, query builder) | **Bespoke** |

## Refining principles

**A. Domain structure earns Picker.**
Could a knowledgeable user recognize the picker's shape as *meaningful*
before reading any labels? Zodiac wheel, HMBS quadrant, hourly clock —
yes. A row of pills with category names — no. Forcing structure that
isn't there is decoration; absence of structure is honest.

**B. Filter need pushes toward Catalog — regardless of set size.**
Multi-axis filtering (category × family × evidence × energetic) requires
a search/faceted-select affordance, and that affordance only fits
Catalog. A 30-item set with three filter dimensions is a Catalog, not a
List.

**C. Detail richness drives route behavior.**
Rich detail (long read, deep scroll, multiple sub-sections) deserves its
own URL — Catalog → Detail. Short or comparative detail (a fact panel, a
paragraph) lives in-place — List/Picker + Detail. *Test:* would a user
want to share a link to a specific detail page?

**D. Comparison drives selector persistence.**
If users naturally compare siblings while reading detail (which sign am I?
what's this hour vs the next?), the selector stays visible. If users go
deep on one and don't return for a while, full-page detail is fine.

**E. Set size and growth set the default — when nothing else overrules.**
Small + fixed → Picker (if structured) or List. Medium → List. Large +
dynamic → Catalog. These are tendencies, not laws.

**F. Dashboard is for orientation, not exploration.**
Surfaces paths. Doesn't host deep reading. If a dashboard is doing
exploration work, the exploration belongs in its own view.

**G. Bespoke is for genuinely different shapes.**
Forms, CRUD applications, faceted query builders. Forcing them into a
canonical layout warps both. Accept Bespoke when the shape genuinely
doesn't fit.

## Critical pass over current features

| Feature | Layout | Verdict | Reasoning |
|---|---|---|---|
| Plants | Catalog → Detail | Strong fit | 207 items, multi-axis filtering, very rich detail. Textbook Catalog. |
| Ailments | Catalog → Detail | Strong fit | 75 items, filterable by body system, rich detail (plants for/against, contraindications). |
| Wellness | Catalog → Detail | Fit, with caveat | ~30 items, grouped. Filter use is moderate. Borderline — could be List if filtering is rarely used. Worth observing real usage. |
| Body Systems | Catalog → Detail | Fit | 25 items grouped by category (physical, energetic, etc.); rich detail (route-worthy via `/body-systems/:id`). The Catalog primitive is grouping-agnostic, so the same shell handles a flat plant grid and a grouped body-system grid. Filtering is light (search by name, optional category narrow) — borderline, but Catalog accommodates it without forcing it. |
| Entheogens | List + Detail | Strong fit | ~15 items, no filter need, comparable protocols, rich detail kept in-pane. |
| My Collections | List + Detail | Strong fit | User-created, small-medium, scan to find. |
| Doctrine Explorer | List + Detail | Strong fit | ~30 teachings, scannable, comparison across plants is natural. |
| Preparations | Picker + Detail | Needs usage check | Currently a small table. If the table genuinely supports cross-method comparison (methods × properties), Picker is right. If users just tap rows for detail, this is List + Detail dressed as a table. |
| Signs & Planets | Picker + Detail | Textbook | 12 + 7 fixed items; zodiac wheel + planet roster have inherent structure. |
| Planetary Timing | Picker + Detail | Strong fit | 24-hour clock face. *Observation:* the picker pulls double duty as selector and current-time display — worth designing that dual role explicitly. |
| HMBS | Picker + Detail | Textbook | 4 quadrants; the 2×2 arrangement is the visual identity. |
| Seasonal Guide | Picker + Detail | Textbook | 4 seasons, cyclical. |
| Plant Journal | Bespoke | Correct | CRUD with list/view/edit modes — not a browse. |
| Natal Chart | Bespoke | Correct | Form → results — not a browse. |
| Cross References | Bespoke | Correct *for now* | Faceted query → results. Likely collapses into Catalog → Detail once `<FilterBar>` (Rule #9) supports faceted selects. |

## Open questions

These surfaced from the critical pass. Each needs a decision before — or during — the layout primitives are built.

**1. Grouped list variant for List + Detail.**
*Largely resolved:* Body Systems was the original driver and now sits
in Catalog, where the primitive is grouping-agnostic and groups happen
inside the consumer's `results` slot. The question reopens only if a
future List + Detail consumer needs grouping; current consumers
(Entheogens, Collections, Doctrine) are flat.

**2. Deep-linkable selection in List + Detail.**
URL-driven selection in List + Detail. Entheogens already routes to
`/entheogens/plants/:id` and `protocols/:slug`, so the primitive needs
URL-syncable selection — pairs naturally with the URL-sync requirement
in Rule #9 (`<FilterBar>`).

**3. Preparations: is the table functional or decorative?**
If users genuinely cross-compare preparation methods × properties, Picker
is right. If they just tap a row, List. Audit the actual task before
building the primitive — the answer changes the design.

**4. Planetary Timing's dual-role picker.**
The 24-hour clock acts as both selector (tap an hour) and live display
(current hour highlighted). The Picker primitive should account for
"current state" presentation as a first-class feature, not a one-off
styling on this view.

**5. Cross References as a future Catalog variant.**
Once `<FilterBar>` supports faceted selects, Cross References likely fits
Catalog → Detail with multi-axis filtering. Re-visit after FilterBar is
built.

**6. Wellness as List + Detail?**
Wellness is currently Catalog but borderline. Worth observing whether
users actually use the search/filter, or whether they navigate by
category. If the latter, it's List + Detail (grouped).

## Implications for the primitives

The layouts and their open questions imply specific capabilities the
primitives must support:

- **List primitive** — optional grouping; URL-syncable selection; medium-set
  scroll behavior; supports inline detail (Entheogens, Collections,
  Doctrine).
- **Picker primitive** — domain-shaped layouts (grid, quadrant, clock,
  table); current-state highlighting as a first-class concern.
- **Catalog primitive** — filterable selector backed by `<FilterBar>` (Rule
  #9); routes to its own detail page.
- **Dashboard** — bento grid of mixed-size cards composed from existing
  molecules (`<StatCard>`, `<DomainCard>`, `<LinkCard>`); more a composition
  pattern than a primitive in the same sense as the others.
- **Bespoke** — explicitly outside the system's layout primitives.
