import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlantDetail as PlantDetailType } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import EthicalPracticePanel from './EthicalPracticePanel'

export default function EntheogenicPlantDetail() {
  const { id } = useParams<{ id: string }>()
  const [plant, setPlant] = useState<PlantDetailType | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    const numericId = Number(id)
    if (Number.isNaN(numericId)) {
      setNotFound(true)
      return
    }
    setPlant(null)
    setNotFound(false)
    api.getPlantById(numericId).then((detail) => {
      if (!detail) {
        setNotFound(true)
        return
      }
      setPlant(detail)
    })
  }, [id])

  if (notFound) {
    return <div className="p-8 lg:pl-2 text-earth-500 text-sm">Plant not found.</div>
  }

  if (!plant) {
    return <div className="p-8 lg:pl-2 text-earth-500 text-sm">Loading…</div>
  }

  return (
    <div className="p-8 lg:pl-2">
      <div className="card-glow-celestial animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Text.PageTitle as="h2" className="text-celestial-400">{plant.common_name}</Text.PageTitle>
            <p className="text-sm text-earth-500 italic">{plant.latin_name}</p>
          </div>
          <Button.Ghost route={`/plants/${plant.id}`} className="text-xs">
            Full profile →
          </Button.Ghost>
        </div>

        <p className="text-sm text-earth-300 mb-5 leading-relaxed">{plant.description}</p>

        {plant.compounds.filter((c) => c.psychoactive).length > 0 && (
          <div className="mb-5">
            <Text.SectionLabel className="mb-2">Psychoactive Compounds</Text.SectionLabel>
            <div className="space-y-2">
              {plant.compounds
                .filter((c) => c.psychoactive)
                .map((compound) => (
                  <div
                    key={compound.id}
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(26, 25, 21, 0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="text-sm text-celestial-300 font-medium">{compound.name}</div>
                    <div className="text-xs text-earth-500">{compound.compound_type}</div>
                    <p className="text-xs text-earth-400 mt-1 leading-relaxed">{compound.pharmacological_action}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {plant.planetAssociations.length > 0 && (
          <div className="mb-5">
            <Text.SectionLabel className="mb-2">Celestial Governance</Text.SectionLabel>
            {plant.planetAssociations.map((assoc) => (
              <div
                key={assoc.planet_id}
                className="flex items-center gap-3 mb-2 rounded-xl p-3"
                style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-xl">{assoc.planet_symbol}</span>
                <span className="text-earth-200">{assoc.planet_name}</span>
                {assoc.notes && <span className="text-xs text-earth-500">- {assoc.notes}</span>}
              </div>
            ))}
          </div>
        )}

        {plant.ailmentAssociations.filter((a) => a.evidence_level === 'clinical').length > 0 && (
          <div className="mb-5">
            <Text.SectionLabel className="mb-2">Clinical Evidence</Text.SectionLabel>
            <div className="space-y-2">
              {plant.ailmentAssociations
                .filter((a) => a.evidence_level === 'clinical')
                .map((assoc) => (
                  <div
                    key={assoc.id}
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(61, 138, 94, 0.05)', border: '1px solid rgba(61, 138, 94, 0.1)' }}
                  >
                    <div className="text-sm text-green-300">{assoc.ailment_name}</div>
                    <p className="text-xs text-earth-400 mt-1 leading-relaxed">{assoc.efficacy_notes}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {plant.safety_notes && !plant.ethicalPractice && (
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400">⚠</span>
              <span className="text-sm font-medium text-red-400">Safety & Contraindications</span>
            </div>
            <p className="text-xs text-earth-400 leading-relaxed">{plant.safety_notes}</p>
          </div>
        )}

        {plant.doctrine_of_signatures && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <Text.SectionLabel className="mb-1">Doctrine of Signatures</Text.SectionLabel>
            <p className="text-xs text-earth-400 italic leading-relaxed">{plant.doctrine_of_signatures}</p>
          </div>
        )}

        {plant.ethicalPractice && <EthicalPracticePanel data={plant.ethicalPractice} />}
      </div>
    </div>
  )
}
