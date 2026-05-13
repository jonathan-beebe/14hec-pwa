import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { Preparation } from '@/types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import Notice from '@/components/design-system/components/Notice'

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
    'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide ring-1 ring-inset ' +
    absorptionBadgeClass(speed)
  return <span className={cls}>{speed}</span>
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
    >
      <Text.SectionLabel>{label}</Text.SectionLabel>
      <div className="text-earth-200 text-sm mt-1">{value || '—'}</div>
    </div>
  )
}

export default function PreparationDetail() {
  const { id } = useParams<{ id: string }>()
  const [prep, setPrep] = useState<Preparation | null>(null)

  useEffect(() => {
    if (id === undefined) return
    api.getPreparationById(Number(id)).then(setPrep)
  }, [id])

  if (!prep) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <div className="skeleton h-5 w-40 mb-6" />
        <div className="skeleton h-12 w-72 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-48 w-full rounded-2xl mb-4" />
        <div className="skeleton h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <article className="max-w-4xl animate-fade-in">
      <Button.Ghost
        route="/preparations"
        className="mb-4 inline-flex items-center gap-1"
      >
        {'←'} All preparations
      </Button.Ghost>

      <div className="flex items-center gap-3 mb-1">
        <Text.PageTitle>{prep.name}</Text.PageTitle>
        {prep.absorption_speed && (
          <AbsorptionBadge speed={prep.absorption_speed} />
        )}
      </div>
      <p className="text-earth-500 text-sm mb-6">
        How {prep.name.toLowerCase()} is prepared, and what to keep in mind
        while doing so.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Attribute label="Solvent" value={prep.solvent} />
        <Attribute label="Best plant parts" value={prep.best_plant_parts} />
        <Attribute label="Concentration" value={prep.concentration_level} />
        <Attribute label="Shelf life" value={prep.shelf_life} />
      </div>

      {prep.general_instructions && (
        <section className="mb-6">
          <Text.SectionLabel as="h2" className="mb-2">
            Instructions
          </Text.SectionLabel>
          <div
            className="rounded-xl p-4 space-y-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.03)' }}
          >
            {prep.general_instructions
              .split('\n')
              .filter((s) => s.trim().length > 0)
              .map((step, i) => (
                <p key={i} className="text-sm text-earth-300 leading-relaxed">
                  {step}
                </p>
              ))}
          </div>
        </section>
      )}

      {prep.safety_notes && (
        <Notice title="Safety notes">{prep.safety_notes}</Notice>
      )}
    </article>
  )
}
