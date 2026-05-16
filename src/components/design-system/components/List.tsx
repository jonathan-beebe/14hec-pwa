import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface ListItemViewModel {
  id: string | number
  to: string
}

interface ListProps<T extends ListItemViewModel> {
  items: T[]
  renderItem: (item: T) => ReactNode
  keyOf?: (item: T) => string | number
}

export function List<T extends ListItemViewModel>({
  items,
  renderItem,
  keyOf = (item) => item.id,
}: ListProps<T>) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <Fragment key={keyOf(item)}>{renderItem(item)}</Fragment>
      ))}
    </div>
  )
}

interface ListItemProps {
  to: string
  children: ReactNode
  trailing?: ReactNode
}

export function ListItem({ to, children, trailing }: ListItemProps) {
  return (
    <Link to={to} className="block py-2 pr-3 group">
      <div className="flex justify-between items-center">
        <span className="text-sm text-earth-100 group-hover:text-botanical-400 transition-colors">
          {children}
        </span>
        {trailing}
      </div>
    </Link>
  )
}
