import type { ReactNode } from 'react'
import Type from '@/components/design-system/atoms/Type'

interface DashboardSectionProps {
  title?: string
  columns?: 2 | 3
  children: ReactNode
}

export function DashboardSection({ title, columns = 2, children }: DashboardSectionProps) {
  const gridCols = columns === 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2'
  return (
    <section className="mb-8">
      {title && <Type.Subheading className="mb-3">{title}</Type.Subheading>}
      <div className={`grid ${gridCols} gap-3`}>
        {children}
      </div>
    </section>
  )
}
