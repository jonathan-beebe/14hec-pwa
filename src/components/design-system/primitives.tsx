import type { ReactNode } from 'react'

const LABEL_COL = 'w-48 flex-shrink-0 text-right'

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <div className="flex gap-8 mb-8">
        <div className={LABEL_COL}>
          <h2 className="text-2xl font-system font-bold text-earth-100">
            {title}
          </h2>
        </div>
        <div className="flex-1" />
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  )
}

export function Subsection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-8">
      <div className={`${LABEL_COL} pt-1`}>
        <h3 className="text-[11px] uppercase tracking-[0.18em] -mr-[0.18em] text-earth-500 font-system font-medium">
          {title}
        </h3>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
