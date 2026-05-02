import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { AilmentDetail as AilmentDetailType } from '@/types'

export default function AilmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ailment, setAilment] = useState<AilmentDetailType | null>(null)

  useEffect(() => {
    api.getAilmentById(Number(id)).then(setAilment)
  }, [id])

  if (!ailment) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <div className="skeleton h-5 w-32 mb-6" />
        <div className="skeleton h-48 w-full rounded-3xl mb-8" />
        <div className="skeleton h-32 w-full rounded-2xl mb-6" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const categoryColor = ailment.category === 'physical' ? 'earth' : ailment.category === 'emotional' ? 'water' : 'air'

  const heroOrbColor = ailment.category === 'physical'
    ? 'rgba(61, 138, 94, 0.3)'
    : ailment.category === 'emotional'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(234, 179, 8, 0.3)'

  return (
    <div className="max-w-4xl animate-fade-in">
      <button
        onClick={() => navigate('/ailments')}
        className="btn-ghost mb-4 inline-flex items-center gap-1"
      >
        {'\u2190'} Back to Ailments
      </button>

      {/* Header */}
      <div className="hero-section mb-8">
        <div className="hero-orb w-64 h-64 -top-20 -right-20" style={{ background: heroOrbColor }} />
        <div className="hero-orb w-40 h-40 -bottom-10 -left-10" style={{ background: heroOrbColor, animationDelay: '2s' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-earth-100">{ailment.name}</h1>
            <span className={`badge badge-${categoryColor}`}>{ailment.category}</span>
          </div>
          <p className="text-sm text-earth-500">{ailment.body_system}</p>
          <p className="text-earth-300 mt-3 leading-relaxed">{ailment.description}</p>
          {ailment.symptoms && (
            <p className="text-sm text-earth-400 mt-3">
              <span className="text-earth-500 font-medium">Symptoms:</span> {ailment.symptoms}
            </p>
          )}
          <div className="divider-gradient mt-6" />
        </div>
      </div>

      {/* Astrological connections */}
      {(ailment.planetAssociations.length > 0 || ailment.zodiacAssociations.length > 0) && (
        <div className="card-glow-celestial mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2609'}</span>
            <h2 className="section-title mb-0">Astrological Associations</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {ailment.planetAssociations.map((assoc) => (
              <span key={assoc.planet_name} className="badge badge-celestial text-sm px-3 py-1">
                {assoc.symbol} {assoc.planet_name}
              </span>
            ))}
            {ailment.zodiacAssociations.map((assoc) => (
              <span key={assoc.sign_name} className="badge badge-celestial text-sm px-3 py-1">
                {assoc.symbol} {assoc.sign_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plant recommendations */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl opacity-50">{'\u2618'}</span>
          <h2 className="section-title mb-0">Plant Recommendations</h2>
        </div>
        {ailment.plantRecommendations.length > 0 ? (
          <div className="space-y-3">
            {ailment.plantRecommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl p-4 hover:border-earth-700/40 transition-colors inner-panel"
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => navigate('/plants/' + rec.plant_id)}
                    className="text-botanical-400 hover:text-botanical-300 font-display font-medium transition-colors"
                  >
                    {rec.common_name}
                  </button>
                  <span className={`evidence-badge evidence-${rec.evidence_level}`}>
                    {rec.evidence_level}
                  </span>
                </div>
                <p className="text-sm text-earth-500 italic mb-2">{rec.latin_name}</p>
                <div className="flex gap-4 text-xs text-earth-400">
                  {rec.part_type && (
                    <span>
                      <span className="text-earth-500 font-medium">Part:</span> {rec.part_type.replace('_', ' ')}
                    </span>
                  )}
                  {rec.preparation_name && (
                    <span>
                      <span className="text-earth-500 font-medium">Prep:</span> {rec.preparation_name}
                    </span>
                  )}
                </div>
                {rec.efficacy_notes && (
                  <p className="text-xs text-earth-400 mt-2 leading-relaxed">{rec.efficacy_notes}</p>
                )}
                {rec.dosage_notes && (
                  <p className="text-xs text-earth-500 mt-1">Dosage: {rec.dosage_notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-earth-500 text-sm">No plant recommendations found for this ailment.</p>
        )}
      </div>

      {/* Plants to Avoid */}
      {ailment.plantsToAvoid && ailment.plantsToAvoid.length > 0 && (
        <div
          className="card mt-6"
          style={{
            background: 'rgba(220, 38, 38, 0.06)',
            border: '1px solid rgba(220, 38, 38, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl text-red-400">{'\u26D4'}</span>
            <h2 className="section-title text-red-300 mb-0">Plants to Avoid</h2>
          </div>
          <div className="space-y-3">
            {ailment.plantsToAvoid.map((plant, i) => (
              <div
                key={i}
                className="rounded-xl p-4 transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(220, 38, 38, 0.08)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => navigate('/plants/' + plant.plant_id)}
                    className="text-red-300 hover:text-red-200 font-display font-medium transition-colors"
                  >
                    {plant.common_name}
                  </button>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md ring-1 ring-inset ${
                    plant.severity === 'high'
                      ? 'bg-red-500/10 text-red-300 ring-red-500/20'
                      : plant.severity === 'moderate'
                      ? 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
                      : 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20'
                  }`}>
                    {plant.severity}
                  </span>
                </div>
                <p className="text-sm text-earth-500 italic mb-2">{plant.latin_name}</p>
                {plant.reason && (
                  <p className="text-xs text-earth-400 leading-relaxed">{plant.reason}</p>
                )}
                {plant.notes && (
                  <p className="text-xs text-earth-500 mt-1 italic">{plant.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
