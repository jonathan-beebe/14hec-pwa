import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { BodySystemDetail } from '@/types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'
import { usePageMeta } from '@/components/layout/MobileTopBar'

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  organ:     { bg: 'bg-rose-500/10',   text: 'text-rose-300',   ring: 'ring-rose-500/20' },
  system:    { bg: 'bg-blue-500/10',   text: 'text-blue-300',   ring: 'ring-blue-500/20' },
  tissue:    { bg: 'bg-amber-500/10',  text: 'text-amber-300',  ring: 'ring-amber-500/20' },
  gland:     { bg: 'bg-purple-500/10', text: 'text-purple-300', ring: 'ring-purple-500/20' },
  structure: { bg: 'bg-green-500/10',  text: 'text-green-300',  ring: 'ring-green-500/20' },
}

const RELEVANCE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  primary:    { bg: 'bg-green-500/10',  text: 'text-green-300',  ring: 'ring-green-500/20' },
  secondary:  { bg: 'bg-amber-500/10',  text: 'text-amber-300',  ring: 'ring-amber-500/20' },
  associated: { bg: 'bg-blue-500/10',   text: 'text-blue-300',   ring: 'ring-blue-500/20' },
}

const CORRESPONDENCE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  doctrine_of_signatures: { bg: 'bg-amber-500/10',    text: 'text-amber-300',    ring: 'ring-amber-500/20' },
  traditional_herbalism:  { bg: 'bg-green-500/10',    text: 'text-green-300',    ring: 'ring-green-500/20' },
  nutritional:            { bg: 'bg-emerald-500/10',  text: 'text-emerald-300',  ring: 'ring-emerald-500/20' },
  tcm:                    { bg: 'bg-red-500/10',      text: 'text-red-300',      ring: 'ring-red-500/20' },
  ayurvedic:              { bg: 'bg-orange-500/10',   text: 'text-orange-300',   ring: 'ring-orange-500/20' },
  clinical:               { bg: 'bg-blue-500/10',     text: 'text-blue-300',     ring: 'ring-blue-500/20' },
}

const CORRESPONDENCE_LABELS: Record<string, string> = {
  doctrine_of_signatures: 'Doctrine of Signatures',
  traditional_herbalism:  'Traditional Herbalism',
  nutritional:            'Nutritional',
  tcm:                    'TCM',
  ayurvedic:              'Ayurvedic',
  clinical:               'Clinical',
}

export default function BodySystemsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  usePageMeta({ back: `/body-systems${search}` })
  const [detail, setDetail] = useState<BodySystemDetail | null>(null)

  useEffect(() => {
    if (id === undefined) return
    api.getBodySystemById(Number(id)).then(setDetail)
  }, [id])

  if (!detail) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <div className="skeleton h-5 w-32 mb-6" />
        <div className="skeleton h-48 w-full rounded-3xl mb-8" />
        <div className="skeleton h-32 w-full rounded-2xl mb-6" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const catStyle = CATEGORY_COLORS[detail.category] || CATEGORY_COLORS.system

  const heroOrbColor = detail.category === 'organ'
    ? 'rgba(244, 63, 94, 0.25)'
    : detail.category === 'system'
    ? 'rgba(59, 130, 246, 0.25)'
    : detail.category === 'gland'
    ? 'rgba(168, 85, 247, 0.25)'
    : detail.category === 'tissue'
    ? 'rgba(245, 158, 11, 0.25)'
    : 'rgba(61, 138, 94, 0.25)'

  return (
    <div className="max-w-4xl animate-fade-in">
      <Button.Ghost
        route={`/body-systems${search}`}
        className="mb-4 hidden lg:inline-flex items-center gap-1"
      >
        {'←'} Back to Body Systems
      </Button.Ghost>

      <div className="hero-section mb-8">
        <div className="hero-orb w-64 h-64 -top-20 -right-20" style={{ background: heroOrbColor }} />
        <div className="hero-orb w-40 h-40 -bottom-10 -left-10" style={{ background: heroOrbColor, animationDelay: '2s' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Text.Display>{detail.name}</Text.Display>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide ring-1 ring-inset ${catStyle.bg} ${catStyle.text} ${catStyle.ring}`}>
              {detail.category}
            </span>
          </div>
          <p className="text-earth-300 mt-3 leading-relaxed">{detail.description}</p>
          <div className="divider-gradient mt-6" />
        </div>
      </div>

      {(detail.ruling_planet_name || detail.zodiac_sign_name) && (
        <div className="card-glow-celestial mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'☉'}</span>
            <h2 className="text-xl font-display font-semibold text-earth-100">Planetary & Zodiac Correspondences</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {detail.ruling_planet_name && (
              <div className="rounded-xl p-4 flex-1 min-w-[200px] inner-panel">
                <div className="text-[10px] text-earth-500 uppercase tracking-[0.15em] mb-2">Ruling Planet</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-celestial-400">{detail.ruling_planet_symbol}</span>
                  <span className="text-sm font-display font-medium text-earth-200">{detail.ruling_planet_name}</span>
                </div>
              </div>
            )}
            {detail.zodiac_sign_name && (
              <div className="rounded-xl p-4 flex-1 min-w-[200px] inner-panel">
                <div className="text-[10px] text-earth-500 uppercase tracking-[0.15em] mb-2">Zodiac Sign</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-celestial-400">{detail.zodiac_sign_symbol}</span>
                  <span className="text-sm font-display font-medium text-earth-200">{detail.zodiac_sign_name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(detail.tcm_element || detail.ayurvedic_dosha) && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'☸'}</span>
            <h2 className="text-xl font-display font-semibold text-earth-100">Eastern Medicine Correspondences</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {detail.tcm_element && (
              <div className="rounded-xl p-4 flex-1 min-w-[200px] inner-panel">
                <div className="text-[10px] text-earth-500 uppercase tracking-[0.15em] mb-2">TCM Element</div>
                <span className="text-sm font-display font-medium text-earth-200">{detail.tcm_element}</span>
              </div>
            )}
            {detail.ayurvedic_dosha && (
              <div className="rounded-xl p-4 flex-1 min-w-[200px] inner-panel">
                <div className="text-[10px] text-earth-500 uppercase tracking-[0.15em] mb-2">Ayurvedic Dosha</div>
                <span className="text-sm font-display font-medium text-earth-200">{detail.ayurvedic_dosha}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {detail.ailments.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'⚕'}</span>
            <h2 className="text-xl font-display font-semibold text-earth-100">Associated Ailments</h2>
            <span className="text-[10px] text-earth-600">{detail.ailments.length}</span>
          </div>
          <div className="space-y-2">
            {detail.ailments.map((ailment) => {
              const relStyle = RELEVANCE_COLORS[ailment.relevance] || RELEVANCE_COLORS.associated
              return (
                <button
                  key={`${ailment.body_system_id}-${ailment.ailment_id}`}
                  onClick={() => navigate('/ailments/' + ailment.ailment_id)}
                  className="w-full text-left rounded-xl p-4 transition-all duration-200 ease-out-expo group hover:border-earth-700/40 inner-panel"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm text-earth-200 group-hover:text-botanical-400 transition-colors font-display font-medium">
                      {ailment.ailment_name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ring-1 ring-inset ${relStyle.bg} ${relStyle.text} ${relStyle.ring}`}>
                      {ailment.relevance}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ring-1 ring-inset ${
                      ailment.ailment_category === 'physical' ? 'bg-green-500/10 text-green-300 ring-green-500/20' :
                      ailment.ailment_category === 'emotional' ? 'bg-blue-500/10 text-blue-300 ring-blue-500/20' :
                      'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20'
                    }`}>
                      {ailment.ailment_category}
                    </span>
                  </div>
                  {ailment.notes && (
                    <p className="text-xs text-earth-500 mt-2 leading-relaxed">{ailment.notes}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {detail.plantPartCorrespondences.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'☘'}</span>
            <h2 className="text-xl font-display font-semibold text-earth-100">Plant Correspondences</h2>
            <span className="text-[10px] text-earth-600">{detail.plantPartCorrespondences.length}</span>
          </div>
          <div className="space-y-3">
            {detail.plantPartCorrespondences.map((corr) => {
              const corrStyle = CORRESPONDENCE_COLORS[corr.correspondence_type] || CORRESPONDENCE_COLORS.traditional_herbalism
              return (
                <div
                  key={corr.id}
                  className="rounded-xl p-4 transition-colors hover:border-earth-700/40 inner-panel"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {corr.plant_common_name ? (
                        <button
                          onClick={() => corr.plant_id && navigate('/plants/' + corr.plant_id)}
                          className="text-botanical-400 hover:text-botanical-300 font-display font-medium transition-colors text-sm"
                        >
                          {corr.plant_common_name}
                        </button>
                      ) : (
                        <span className="text-sm text-earth-200 font-display font-medium">Unknown Plant</span>
                      )}
                      {corr.plant_latin_name && (
                        <span className="text-earth-500 text-xs ml-2 italic">{corr.plant_latin_name}</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ring-1 ring-inset ${corrStyle.bg} ${corrStyle.text} ${corrStyle.ring}`}>
                      {CORRESPONDENCE_LABELS[corr.correspondence_type] || corr.correspondence_type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-earth-400 mb-2">
                    {corr.part_type && (
                      <span>
                        <span className="text-earth-500 font-medium">Part:</span> {corr.part_type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  {corr.signature_description && (
                    <p className="text-sm text-earth-300 leading-relaxed mb-1">{corr.signature_description}</p>
                  )}
                  {corr.therapeutic_action && (
                    <p className="text-xs text-earth-400 leading-relaxed">
                      <span className="text-earth-500 font-medium">Therapeutic action:</span> {corr.therapeutic_action}
                    </p>
                  )}
                  {corr.notes && (
                    <p className="text-xs text-earth-500 mt-1 italic">{corr.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {detail.foodCorrespondences.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'❧'}</span>
            <h2 className="text-xl font-display font-semibold text-earth-100">Food Correspondences</h2>
            <span className="text-[10px] text-earth-600">{detail.foodCorrespondences.length}</span>
          </div>
          <p className="text-xs text-earth-500 mb-4">Foods that support this body system through nutritional and signature correspondences</p>
          <div className="space-y-3">
            {detail.foodCorrespondences.map((food) => {
              const corrStyle = CORRESPONDENCE_COLORS[food.correspondence_type] || CORRESPONDENCE_COLORS.nutritional
              return (
                <div
                  key={food.id}
                  className="rounded-xl p-4 transition-colors hover:border-earth-700/40 inner-panel"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-earth-200 font-display font-medium">
                      {food.food_name || food.plant_common_name || 'Unknown food'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide ring-1 ring-inset ${corrStyle.bg} ${corrStyle.text} ${corrStyle.ring}`}>
                      {CORRESPONDENCE_LABELS[food.correspondence_type] || food.correspondence_type}
                    </span>
                  </div>
                  {food.signature_description && (
                    <p className="text-sm text-earth-300 leading-relaxed mb-1 italic">
                      {food.signature_description}
                    </p>
                  )}
                  {food.therapeutic_action && (
                    <p className="text-xs text-earth-400 leading-relaxed">
                      <span className="text-earth-500 font-medium">Therapeutic action:</span> {food.therapeutic_action}
                    </p>
                  )}
                  {food.notes && (
                    <p className="text-xs text-earth-500 mt-1 italic">{food.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
