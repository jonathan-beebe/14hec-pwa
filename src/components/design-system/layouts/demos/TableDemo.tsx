import { useNavigate, useParams } from 'react-router-dom'
import TableLayout from '../TableLayout'
import Badge from '../../atoms/Badge'
import Button from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import Text from '../../atoms/Text'
import CatalogHeader from '../../components/CatalogHeader'
import RecordTable, { type TableColumn } from '../../components/RecordTable'
import { CATALOG_DEMO_ITEMS, type CatalogDemoItem } from './CatalogDemo'

const COLUMNS: TableColumn<CatalogDemoItem>[] = [
  {
    key: 'name',
    header: 'Botanical',
    primary: true,
    render: (item) => (
      <span className="font-medium text-earth-100">{item.name}</span>
    ),
  },
  {
    key: 'latin',
    header: 'Latin',
    render: (item) => <span className="italic">{item.latin}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    badge: true,
    render: (item) => <Badge variant={item.category}>{item.category}</Badge>,
  },
  {
    key: 'summary',
    header: 'Summary',
    render: (item) => <span className="text-earth-400">{item.summary}</span>,
  },
]

/**
 * Route-driven reference demo for `TableLayout` + `RecordTable`. Mounted
 * at `/design-system/layouts/table` with a `:id` sibling route. Uses the
 * same dataset as the Catalog demos so the two layouts can be compared
 * side-by-side at every viewport.
 */
export default function TableDemo() {
  return (
    <TableLayout
      header={
        <CatalogHeader
          title="Botanicals (table)"
          count={CATALOG_DEMO_ITEMS.length}
          backTo={{ to: '/design-system', label: 'Back to catalog' }}
          subtitle="Table + Detail layout demo. Same dataset as the Catalog demos — narrow the viewport to see the responsive reflow."
        />
      }
      itemCount={CATALOG_DEMO_ITEMS.length}
    >
      <div className="px-4 md:px-8 pt-3 pb-8">
        <RecordTable
          rows={CATALOG_DEMO_ITEMS as readonly CatalogDemoItem[] as CatalogDemoItem[]}
          columns={COLUMNS}
          rowKey={(item) => item.id}
          rowHref={(item) => `/design-system/layouts/table/${item.id}`}
          rowLabel={(item) => `${item.name}, view details`}
          caption="Sample botanicals, comparison table"
        />
      </div>
    </TableLayout>
  )
}

export function TableDemoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const item = CATALOG_DEMO_ITEMS.find((i) => i.id === id)

  if (!item) {
    return (
      <div className="animate-fade-in px-8 py-6">
        <Button.Ghost
          onClick={() => navigate('..', { relative: 'path' })}
          className="mb-4"
        >
          <Icon.ArrowLeft className="mr-1.5" /> Back
        </Button.Ghost>
        <p className="text-earth-500 text-sm">Not found.</p>
      </div>
    )
  }

  return (
    <article className="animate-fade-in px-8 py-6">
      <Button.Ghost
        onClick={() => navigate('..', { relative: 'path' })}
        className="mb-4"
      >
        <Icon.ArrowLeft className="mr-1.5" /> Back
      </Button.Ghost>
      <div className="flex items-center gap-3">
        <Text.PageTitle>{item.name}</Text.PageTitle>
        <Badge variant={item.category}>{item.category}</Badge>
      </div>
      <p className="text-earth-500 italic mt-1 text-sm">{item.latin}</p>
      <p className="text-earth-300 text-sm mt-4 leading-relaxed">{item.summary}</p>
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-earth-500">
        Detail is its own route — refresh the page or share the URL and you land back here.
      </div>
    </article>
  )
}
