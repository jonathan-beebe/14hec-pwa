import { Link, useParams } from 'react-router-dom'
import { RoutedListDetailLayout } from '../ListDetailLayout'
import BrowseTile from '../../components/BrowseTile'

export const LIST_DETAIL_DEMO_ITEMS = [
  { id: 'rosemary', name: 'Rosemary', latin: 'Salvia rosmarinus', summary: 'Memory, circulation, sun-aligned. A perennial guardian of clarity.' },
  { id: 'lavender', name: 'Lavender', latin: 'Lavandula angustifolia', summary: 'Calm, sleep, mercurial. Soothes a restless nervous system.' },
  { id: 'mugwort', name: 'Mugwort', latin: 'Artemisia vulgaris', summary: 'Dream, threshold, lunar. Carries one across edges.' },
  { id: 'tulsi', name: 'Tulsi', latin: 'Ocimum sanctum', summary: 'Adaptogen, clarity, devotional. Holy basil of the heart.' },
  { id: 'yarrow', name: 'Yarrow', latin: 'Achillea millefolium', summary: 'Boundary, blood, martial. Closes what is open and opens what is closed.' },
  { id: 'nettle', name: 'Nettle', latin: 'Urtica dioica', summary: 'Mineral nourishment, kidney support. Stings, then feeds.' },
] as const

export type ListDetailDemoItem = (typeof LIST_DETAIL_DEMO_ITEMS)[number]

function DemoTop() {
  return (
    <div className="px-5 py-3 border-b border-white/5">
      <Link
        to="/design-system"
        className="text-[11px] text-earth-500 hover:text-earth-200 transition-colors"
      >
        ← Back to catalog
      </Link>
      <h4 className="text-base font-system font-semibold text-earth-100 mt-1">Sample Botanicals</h4>
      <p className="text-[11px] text-earth-500 mt-0.5">
        List + Detail layout demo. Selection updates the URL — deep-linkable, real history.
      </p>
    </div>
  )
}

function DemoList() {
  return (
    <ul className="p-2 space-y-2">
      {LIST_DETAIL_DEMO_ITEMS.map((item) => (
        <li key={item.id}>
          <BrowseTile to={item.id}>
            <div className="text-sm font-medium text-earth-100">{item.name}</div>
            <div className="text-[11px] text-earth-500 italic">{item.latin}</div>
          </BrowseTile>
        </li>
      ))}
    </ul>
  )
}

function DemoEmpty() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-earth-500 text-sm">Select an item from the list.</p>
    </div>
  )
}

/**
 * Route-driven demo of `ListDetailLayout`. Mounted at
 * `/design-system/layouts/list-detail` with a `:id` child route. Composes
 * the layout exactly like a real feature would.
 */
export default function ListDetailDemo() {
  return (
    <RoutedListDetailLayout
      top={<DemoTop />}
      list={<DemoList />}
      emptyDetail={<DemoEmpty />}
    />
  )
}

export function ListDetailDemoDetail() {
  const { id } = useParams<{ id: string }>()
  const item = LIST_DETAIL_DEMO_ITEMS.find((i) => i.id === id)
  if (!item) {
    return <div className="p-6 text-earth-500 text-sm">Not found.</div>
  }
  return (
    <article className="p-6">
      <h4 className="text-2xl font-system font-bold text-earth-100">{item.name}</h4>
      <p className="text-earth-500 italic mt-1 text-sm">{item.latin}</p>
      <p className="text-earth-300 text-sm mt-4 leading-relaxed">{item.summary}</p>
      <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-earth-500">
        Detail content scrolls within the right column. The list keeps its own scroll on the left.
      </div>
    </article>
  )
}
