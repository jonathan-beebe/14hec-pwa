import { Section, Subsection } from '../primitives'

function DemoPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
      <p className="text-earth-500 text-[11px] uppercase tracking-[0.18em] font-system">
        Demo forthcoming
      </p>
    </div>
  )
}

const META_LABEL = 'uppercase tracking-[0.18em] text-earth-600'

export default function LayoutsSection() {
  return (
    <Section id="layouts" title="Layouts">
      <Subsection title="Dashboard">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            An entry-point overview surfacing multiple data axes at once: stat
            tiles, navigation cards, featured items, quick-access lists.
            Composed as a bento-style grid of mixed-size cards.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Dashboard</code>
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="Catalog → Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A large set of items, filterable and searchable in one view;
            selecting an item navigates to a dedicated full-page detail with
            back navigation. The list and the detail are separate routes —
            the list does not stay visible while viewing detail.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is large enough to need filtering, items are homogeneous,
            and detail is rich enough to warrant its own page.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Plants</code>,{' '}
            <code className="text-earth-400">Ailments</code>,{' '}
            <code className="text-earth-400">Wellness</code>
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="List + Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A scrollable list paired with a persistent detail pane. Selection
            updates the detail in place; no route change. The list is generic
            in shape (vertical scroll of similar items) — work happens by
            scanning down the list.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is medium-sized (~10–50 items), items are homogeneous,
            and keeping the list visible while reading detail aids
            comparison.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Entheogens</code>,{' '}
            <code className="text-earth-400">My Collections</code>,{' '}
            <code className="text-earth-400">Doctrine Explorer</code>,{' '}
            <code className="text-earth-400">Body Systems</code> (grouped)
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="Picker + Detail">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            A small, structured selector paired with a persistent detail
            pane. The picker's shape reflects the structure of the data — a
            quadrant, a calendar, a zodiac grid, an hourly clock, a small
            table — and is itself part of the visual language. Selection
            updates the detail in place.
          </p>
          <p className="text-earth-300 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Use when:</span>{' '}
            the set is small and fixed (typically ≤24 items), and the
            picker's arrangement carries domain meaning (compass directions,
            the four seasons, the seven planets, etc.).
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Preparations</code>,{' '}
            <code className="text-earth-400">Signs &amp; Planets</code>,{' '}
            <code className="text-earth-400">Planetary Timing</code>,{' '}
            <code className="text-earth-400">HMBS</code>,{' '}
            <code className="text-earth-400">Seasonal Guide</code>
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>

      <Subsection title="Other / Bespoke">
        <div className="space-y-4">
          <p className="text-earth-300 text-sm font-system leading-relaxed">
            Interactive tools that don't fit a browse-and-detail pattern:
            forms, CRUD applications, multi-axis query builders. Each is
            bespoke for now. A canonical pattern may emerge later (e.g. a
            shared form layout for natal-chart-style inputs) but is not
            pre-emptively designed.
          </p>
          <p className="text-earth-500 text-xs font-system leading-relaxed">
            <span className={META_LABEL}>Currently in app:</span>{' '}
            <code className="text-earth-400">Natal Chart</code> (form →
            results);{' '}
            <code className="text-earth-400">Plant Journal</code> (CRUD with
            list / view / edit modes);{' '}
            <code className="text-earth-400">Cross References</code>{' '}
            (faceted query builder)
          </p>
          <DemoPlaceholder />
        </div>
      </Subsection>
    </Section>
  )
}
