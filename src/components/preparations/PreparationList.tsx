import { useEffect, useState } from 'react'
import { api } from '@/data/api'
import type { Preparation } from '@/types'
import CatalogHeader from '@/components/design-system/components/CatalogHeader'
import RecordTable, {
  type TableColumn,
} from '@/components/design-system/components/RecordTable'
import TableLayout from '@/components/design-system/layouts/TableLayout'

function absorptionBadgeClass(speed: string | null | undefined) {
  if (!speed) return 'bg-earth-700/20 text-earth-400 ring-earth-600/20'
  if (speed.includes('Very Fast'))
    return 'bg-green-500/10 text-green-300 ring-green-500/20'
  if (speed.includes('Fast'))
    return 'bg-green-500/8 text-green-400 ring-green-500/15'
  if (speed.includes('Moderate'))
    return 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
  return 'bg-earth-700/20 text-earth-400 ring-earth-600/20'
}

function AbsorptionBadge({ speed }: { speed: string }) {
  const cls =
    'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ring-1 ring-inset ' +
    absorptionBadgeClass(speed)
  return <span className={cls}>{speed}</span>
}

const COLUMNS: TableColumn<Preparation>[] = [
  {
    key: 'name',
    header: 'Method',
    primary: true,
    render: (p) => (
      <span className="font-medium text-earth-100">{p.name}</span>
    ),
  },
  {
    key: 'solvent',
    header: 'Solvent',
    render: (p) => p.solvent || '—',
  },
  {
    key: 'parts',
    header: 'Best parts',
    render: (p) => p.best_plant_parts || '—',
  },
  {
    key: 'absorption',
    header: 'Absorption',
    badge: true,
    render: (p) =>
      p.absorption_speed ? (
        <AbsorptionBadge speed={p.absorption_speed} />
      ) : (
        <span className="text-earth-500">—</span>
      ),
  },
  {
    key: 'concentration',
    header: 'Concentration',
    render: (p) => p.concentration_level || '—',
  },
  {
    key: 'shelf',
    header: 'Shelf life',
    render: (p) => p.shelf_life || '—',
  },
]

export default function PreparationList() {
  const [preparations, setPreparations] = useState<Preparation[]>([])

  useEffect(() => {
    api.getPreparations().then(setPreparations)
  }, [])

  return (
    <TableLayout
      header={
        <CatalogHeader
          title="Preparation Methods"
          count={preparations.length}
          subtitle="How plant material is processed determines bioavailability. Tap a row for instructions and safety notes."
        />
      }
      itemCount={preparations.length}
    >
      <div className="px-4 md:px-8 pt-3 pb-8">
        <RecordTable
          rows={preparations}
          columns={COLUMNS}
          rowKey={(p) => p.id}
          rowHref={(p) => `/preparations/${p.id}`}
          rowLabel={(p) => `${p.name}, view preparation details`}
          caption="Preparation methods compared across solvent, best plant parts, absorption speed, concentration, and shelf life."
        />
      </div>
    </TableLayout>
  )
}
