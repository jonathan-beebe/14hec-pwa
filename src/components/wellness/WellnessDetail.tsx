import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/data/api'
import type { WellnessGoalDetail as WellnessGoalDetailType } from '@/types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'

export default function WellnessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [goal, setGoal] = useState<WellnessGoalDetailType | null>(null)

  useEffect(() => {
    api.getWellnessGoalById(Number(id)).then(setGoal)
  }, [id])

  if (!goal) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <div className="skeleton h-5 w-32 mb-6" />
        <div className="skeleton h-48 w-full rounded-3xl mb-8" />
        <div className="skeleton h-32 w-full rounded-2xl mb-6" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <Button.Ghost
        route="/wellness"
        className="mb-4 inline-flex items-center gap-1"
      >
        {'\u2190'} Back to Wellness Goals
      </Button.Ghost>

      {/* Header */}
      <div className="hero-section mb-8">
        <div className="hero-orb w-64 h-64 -top-20 -right-20" style={{ background: 'rgba(93, 168, 126, 0.2)' }} />
        <div className="hero-orb w-40 h-40 -bottom-10 -left-10" style={{ background: 'rgba(93, 168, 126, 0.1)', animationDelay: '2s' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg opacity-50">{goal.category_icon}</span>
            <span className="text-[10px] text-earth-500 uppercase tracking-[0.15em]">{goal.category_name}</span>
          </div>
          <Text.Display className="mb-2">{goal.name}</Text.Display>
          <p className="text-earth-300 leading-relaxed">{goal.description}</p>

          {goal.desired_outcome && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(93, 168, 126, 0.06)', border: '1px solid rgba(93, 168, 126, 0.1)' }}>
              <span className="text-[10px] text-botanical-500 uppercase tracking-wider font-medium">Desired Outcome</span>
              <p className="text-sm text-botanical-300 mt-1">{goal.desired_outcome}</p>
            </div>
          )}

          {goal.body_system && (
            <p className="text-sm text-earth-500 mt-3">
              <span className="text-earth-400 font-medium">Body System:</span> {goal.body_system}
            </p>
          )}
          <div className="divider-gradient mt-6" />
        </div>
      </div>

      {/* Evidence & Lifestyle */}
      {(goal.evidence_summary || goal.lifestyle_notes) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {goal.evidence_summary && (
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm opacity-40">{'\u2696'}</span>
                <h3 className="text-sm font-display font-medium text-earth-300">Evidence Summary</h3>
              </div>
              <p className="text-xs text-earth-400 leading-relaxed">{goal.evidence_summary}</p>
            </div>
          )}
          {goal.lifestyle_notes && (
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm opacity-40">{'\u2618'}</span>
                <h3 className="text-sm font-display font-medium text-earth-300">Lifestyle Notes</h3>
              </div>
              <p className="text-xs text-earth-400 leading-relaxed">{goal.lifestyle_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Plant Recommendations */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl opacity-50">{'\u2618'}</span>
          <Text.SectionTitle className="mb-0">Plant Allies</Text.SectionTitle>
          <span className="text-xs text-earth-500">({goal.plantRecommendations.length} plants)</span>
        </div>
        {goal.plantRecommendations.length > 0 ? (
          <div className="space-y-3">
            {goal.plantRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl p-4 hover:border-earth-700/40 transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
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
                {rec.mechanism && (
                  <p className="text-xs text-earth-400 mt-2 leading-relaxed">
                    <span className="text-earth-500 font-medium">How it works:</span> {rec.mechanism}
                  </p>
                )}
                {rec.efficacy_notes && (
                  <p className="text-xs text-earth-400 mt-1 leading-relaxed">{rec.efficacy_notes}</p>
                )}
                {rec.dosage_notes && (
                  <p className="text-xs text-earth-500 mt-1">
                    <span className="font-medium">Dosage:</span> {rec.dosage_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-earth-500 text-sm">No plant recommendations mapped yet for this goal.</p>
        )}
      </div>
    </div>
  )
}
