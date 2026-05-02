import type { ReactNode } from 'react'

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
    <section id={id} className="mb-12 scroll-mt-6">
      <h2 className="text-2xl font-display font-bold text-earth-100 pb-3 border-b border-white/5">
        {title}
      </h2>
      <div className="pt-6 space-y-6">{children}</div>
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
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-earth-500 mb-3 font-medium">
        {title}
      </h3>
      <div className="rounded-xl border border-white/5 bg-earth-900/30 p-5">
        {children}
      </div>
    </div>
  )
}
