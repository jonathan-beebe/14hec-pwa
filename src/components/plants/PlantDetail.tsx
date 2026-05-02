import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { PlantDetail as PlantDetailType, CollectionForPlant } from '../../types'

export default function PlantDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [plant, setPlant] = useState<PlantDetailType | null>(null)
  const [collections, setCollections] = useState<CollectionForPlant[]>([])
  const [showCollections, setShowCollections] = useState(false)

  useEffect(() => {
    const plantId = Number(id)
    api.getPlantById(plantId).then(setPlant)
    api.getCollectionsForPlant(plantId).then(setCollections).catch(() => {})
  }, [id])

  async function toggleCollection(collectionId: number, currentlyIn: boolean) {
    const plantId = Number(id)
    if (currentlyIn) {
      await api.removePlantFromCollection(collectionId, plantId)
    } else {
      await api.addPlantToCollection(collectionId, plantId)
    }
    const updated = await api.getCollectionsForPlant(plantId)
    setCollections(updated)
  }

  if (!plant) {
    return (
      <div className="max-w-5xl animate-fade-in">
        <div className="skeleton h-8 w-32 mb-4" />
        <div className="skeleton h-64 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
          <div className="lg:col-span-2 skeleton h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/plants')}
        className="btn-ghost mb-4 inline-flex items-center gap-1"
      >
        {'\u2190'} Back to Plants
      </button>

      {/* Header */}
      <div className="hero-section mb-8"
           style={{
             background: plant.category === 'entheogenic'
               ? 'linear-gradient(135deg, rgba(52, 28, 115, 0.15) 0%, rgba(16, 15, 12, 0.85) 50%, rgba(124, 94, 237, 0.04) 100%)'
               : plant.category === 'both'
               ? 'linear-gradient(135deg, rgba(26, 90, 58, 0.1) 0%, rgba(16, 15, 12, 0.85) 50%, rgba(52, 28, 115, 0.08) 100%)'
               : 'linear-gradient(135deg, rgba(26, 90, 58, 0.12) 0%, rgba(16, 15, 12, 0.85) 50%, rgba(93, 168, 126, 0.04) 100%)',
             border: '1px solid rgba(255, 255, 255, 0.06)'
           }}>
        <div className="hero-orb top-0 right-0 w-60 h-60 bg-botanical-500" />

        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-botanical-400 tracking-wide">{plant.common_name}</h1>
            <p className="text-lg text-earth-500 italic font-display mt-1">{plant.latin_name}</p>
            <p className="text-sm text-earth-600 mt-1">{plant.family}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Add to Collection */}
            <div className="relative">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="btn-ghost text-xs flex items-center gap-1.5"
                style={{
                  background: collections.some(c => c.contains_plant) ? 'rgba(244, 63, 94, 0.08)' : undefined,
                  borderColor: collections.some(c => c.contains_plant) ? 'rgba(244, 63, 94, 0.15)' : undefined,
                  color: collections.some(c => c.contains_plant) ? 'rgba(244, 63, 94, 0.8)' : undefined
                }}
              >
                {'\u2661'} {collections.some(c => c.contains_plant) ? 'Saved' : 'Save'}
              </button>
              {showCollections && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-glass-dense rounded-xl overflow-hidden shadow-depth-xl z-30 animate-fade-in-down"
                     style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="p-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                    <span className="text-[10px] text-earth-500 uppercase tracking-[0.12em] font-medium">
                      Add to Collection
                    </span>
                  </div>
                  {collections.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-earth-500 text-xs mb-2">No collections yet</p>
                      <button
                        onClick={() => { setShowCollections(false); navigate('/collections') }}
                        className="text-xs text-botanical-400 hover:text-botanical-300 transition-colors"
                      >
                        Create one {'\u2192'}
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {collections.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => toggleCollection(col.id, !!col.contains_plant)}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors duration-100"
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          <span className="text-sm opacity-50">{col.icon}</span>
                          <span className="text-earth-200 text-xs flex-1">{col.name}</span>
                          {col.contains_plant ? (
                            <span className="text-botanical-400 text-xs">{'\u2713'}</span>
                          ) : (
                            <span className="text-earth-600 text-xs">+</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="p-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                    <button
                      onClick={() => { setShowCollections(false); navigate('/collections') }}
                      className="w-full text-center text-[10px] text-earth-500 hover:text-earth-300 py-1.5 transition-colors"
                    >
                      Manage Collections
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className={`badge badge-${plant.category} text-sm`}>{plant.category}</span>
          </div>
        </div>
        <p className="text-earth-300 mt-4 leading-relaxed relative">{plant.description}</p>
        {plant.category === 'entheogenic' && (
          <div className="mt-4 inline-flex">
            <span className="badge badge-entheogenic text-[10px] leading-relaxed max-w-none whitespace-normal text-left py-1.5 px-3">
              <strong>Legal Notice:</strong> This plant may be classified as a controlled substance under federal and/or state law.
              This entry is provided solely for educational, historical, and ethnobotanical reference. Nothing herein should
              be construed as encouraging illegal activity. Users are responsible for complying with all applicable laws.
            </span>
          </div>
        )}
        {plant.energetic_quality && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-celestial-500 text-xs">Energetic Quality:</span>
            <span className="text-sm text-celestial-300">{plant.energetic_quality}</span>
          </div>
        )}
        <div className="divider-gradient mt-6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Doctrine of Signatures */}
        {plant.doctrine_of_signatures && (
          <div className="lg:col-span-2 card-glow-botanical p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl opacity-50">{'\u2638'}</span>
              <h2 className="section-title mb-0">Doctrine of Signatures</h2>
            </div>
            <p className="text-earth-300 text-sm italic leading-relaxed pl-10">{plant.doctrine_of_signatures}</p>
          </div>
        )}

        {/* Plant Parts */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2618'}</span>
            <h2 className="section-title mb-0">Plant Parts</h2>
          </div>
          <div className="space-y-2.5">
            {plant.parts.map((part) => (
              <div key={part.id} className="inner-panel rounded-xl p-3.5 transition-colors duration-200 ease-out-expo">
                <div className="text-sm font-medium text-botanical-300 capitalize mb-1.5">
                  {part.part_type.replace('_', ' ')}
                </div>
                {part.typical_compounds && (
                  <p className="text-xs text-earth-400 mb-1">
                    <span className="text-earth-500 font-medium">Compounds:</span> {part.typical_compounds}
                  </p>
                )}
                {part.therapeutic_properties && (
                  <p className="text-xs text-earth-400">
                    <span className="text-earth-500 font-medium">Properties:</span> {part.therapeutic_properties}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Astrological Correspondences */}
        <div className="card-glow-celestial p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2609'}</span>
            <h2 className="section-title mb-0">Astrology</h2>
          </div>
          {plant.planetAssociations.length > 0 && (
            <div className="mb-4">
              <div className="section-subtitle">Planetary Rulers</div>
              {plant.planetAssociations.map((assoc) => (
                <div key={assoc.planet_id} className="inner-panel flex items-center gap-3 mb-2.5 rounded-xl p-3">
                  <span className="text-2xl">{assoc.planet_symbol}</span>
                  <div>
                    <span className="text-earth-200 font-medium">{assoc.planet_name}</span>
                    <span className="text-xs text-earth-500 ml-2">({assoc.association_type.replace('_', ' ')})</span>
                    {assoc.notes && <p className="text-xs text-earth-400 mt-0.5">{assoc.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {plant.zodiacAssociations.length > 0 && (
            <div>
              <div className="section-subtitle">Zodiac Signs</div>
              <div className="flex flex-wrap gap-2">
                {plant.zodiacAssociations.map((assoc) => (
                  <span
                    key={assoc.zodiac_sign_id}
                    className={`badge badge-${assoc.element} px-3 py-1`}
                    title={assoc.notes}
                  >
                    {assoc.sign_symbol} {assoc.sign_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ailments & Preparations */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'\u2695'}</span>
            <h2 className="section-title mb-0">Ailments & Preparations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header border-b border-earth-800/40">
                  <th className="pb-2.5 pr-3 text-left">Ailment</th>
                  <th className="pb-2.5 pr-3 text-left">Plant Part</th>
                  <th className="pb-2.5 pr-3 text-left">Preparation</th>
                  <th className="pb-2.5 pr-3 text-left">Evidence</th>
                  <th className="pb-2.5 text-left">Dosage</th>
                </tr>
              </thead>
              <tbody>
                {plant.ailmentAssociations.map((assoc) => (
                  <tr key={assoc.id} className="table-row">
                    <td className="py-2.5 pr-3">
                      <button
                        onClick={() => navigate(`/ailments/${assoc.ailment_id}`)}
                        className="text-earth-200 hover:text-botanical-400 transition-colors duration-150 ease-out-expo"
                      >
                        {assoc.ailment_name}
                      </button>
                      <span className={`ml-2 badge badge-${assoc.ailment_category === 'physical' ? 'earth' : assoc.ailment_category === 'emotional' ? 'water' : 'air'}`}>
                        {assoc.ailment_category}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-earth-400 capitalize text-xs">
                      {assoc.part_type?.replace('_', ' ') || '-'}
                    </td>
                    <td className="py-2.5 pr-3 text-earth-400 text-xs">{assoc.preparation_name || '-'}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`evidence-badge evidence-${assoc.evidence_level}`}>
                        {assoc.evidence_level}
                      </span>
                    </td>
                    <td className="py-2.5 text-earth-400 text-xs">{assoc.dosage_notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Compounds */}
        {plant.compounds.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl opacity-50">{'\u269B'}</span>
              <h2 className="section-title mb-0">Active Compounds</h2>
            </div>
            <div className="space-y-2">
              {plant.compounds.map((compound) => (
                <div key={compound.id} className="inner-panel rounded-xl p-3 transition-colors duration-200 ease-out-expo">
                  <div className="flex items-center gap-2">
                    <span className="text-earth-200 font-medium text-sm">{compound.name}</span>
                    <span className="text-xs text-earth-600">{compound.compound_type}</span>
                    {compound.psychoactive === 1 && (
                      <span className="badge badge-entheogenic text-[10px]">psychoactive</span>
                    )}
                  </div>
                  <p className="text-xs text-earth-400 mt-1">{compound.pharmacological_action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What This Plant Teaches */}
        {plant.teachings && (
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-6"
               style={{
                 background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(16, 15, 12, 0.88) 40%, rgba(168, 85, 247, 0.04) 100%)',
                 border: '1px solid rgba(245, 158, 11, 0.1)',
                 boxShadow: 'inset 0 1px 0 0 rgba(245, 158, 11, 0.06), 0 0 40px -12px rgba(245, 158, 11, 0.08), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
               }}>
            {/* Warm ambient orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
                 style={{ background: 'rgba(245, 158, 11, 0.06)', filter: 'blur(80px)' }} />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl opacity-60" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>{'\u2726'}</span>
                <h2 className="section-title mb-0 text-gradient-gold">What This Plant Teaches</h2>
              </div>
              <p className="text-earth-400 text-xs italic mb-5 pl-10 font-display">
                "Plants don't add to us {'\u2014'} they activate what is already within us."
              </p>

              {/* 2x2 Dimension Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Energetic */}
                <div className="rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       background: 'rgba(255, 255, 255, 0.03)',
                       border: '1px solid rgba(255, 255, 255, 0.04)',
                       borderTop: '2px solid rgba(251, 191, 36, 0.3)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>{'\u2726'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>
                      Energetic
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.teachings.energetic_teaching}</p>
                </div>

                {/* Mental */}
                <div className="rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       background: 'rgba(255, 255, 255, 0.03)',
                       border: '1px solid rgba(255, 255, 255, 0.04)',
                       borderTop: '2px solid rgba(59, 130, 246, 0.3)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(59, 130, 246, 0.8)' }}>{'\u2609'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(59, 130, 246, 0.7)' }}>
                      Mental
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.teachings.mental_teaching}</p>
                </div>

                {/* Physical */}
                <div className="rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       background: 'rgba(255, 255, 255, 0.03)',
                       border: '1px solid rgba(255, 255, 255, 0.04)',
                       borderTop: '2px solid rgba(61, 138, 94, 0.3)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(61, 138, 94, 0.8)' }}>{'\u2618'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(61, 138, 94, 0.7)' }}>
                      Physical
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.teachings.physical_teaching}</p>
                </div>

                {/* Spiritual */}
                <div className="rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       background: 'rgba(255, 255, 255, 0.03)',
                       border: '1px solid rgba(255, 255, 255, 0.04)',
                       borderTop: '2px solid rgba(168, 85, 247, 0.3)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(168, 85, 247, 0.8)' }}>{'\u2727'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(168, 85, 247, 0.7)' }}>
                      Spiritual
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.teachings.spiritual_teaching}</p>
                </div>
              </div>

              {/* Activation Principle */}
              <div className="rounded-xl p-4"
                   style={{
                     background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.06), rgba(168, 85, 247, 0.04))',
                     border: '1px solid rgba(251, 191, 36, 0.12)',
                     boxShadow: 'inset 0 1px 0 0 rgba(251, 191, 36, 0.06)'
                   }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>{'\u2736'}</span>
                  <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gradient-gold">
                    Activation Principle
                  </span>
                </div>
                <p className="text-earth-200 text-sm leading-relaxed font-display italic">
                  {plant.teachings.activation_principle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Living Presence — The Gift of Proximity */}
        {plant.presenceEnergetics && (
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-6"
               style={{
                 background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.06) 0%, rgba(16, 15, 12, 0.88) 40%, rgba(148, 163, 184, 0.04) 100%)',
                 border: '1px solid rgba(94, 234, 212, 0.10)',
                 boxShadow: 'inset 0 1px 0 0 rgba(94, 234, 212, 0.06), 0 0 40px -12px rgba(94, 234, 212, 0.08), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
               }}>
            {/* Cool ambient orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
                 style={{ background: 'rgba(94, 234, 212, 0.05)', filter: 'blur(80px)' }} />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl opacity-60" style={{ color: 'rgba(94, 234, 212, 0.8)' }}>{'\u2734'}</span>
                <h2 className="section-title mb-0" style={{
                  background: 'linear-gradient(135deg, #5eead4, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Living Presence</h2>
              </div>
              <p className="text-earth-400 text-xs italic mb-5 pl-10 font-display">
                When we live with plants, their field becomes part of ours {'\u2014'} no consumption needed.
              </p>

              {/* 3+2 Dimension Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Home Placement */}
                <div className="inner-panel-dark rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       borderTop: '2px solid rgba(94, 234, 212, 0.3)',
                       boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{'\uD83C\uDFE0'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(94, 234, 212, 0.7)' }}>
                      Home Placement
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.presenceEnergetics.home_placement}</p>
                </div>

                {/* Field Interaction */}
                <div className="inner-panel-dark rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       borderTop: '2px solid rgba(167, 139, 250, 0.3)',
                       boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(167, 139, 250, 0.8)' }}>{'\u25C9'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(167, 139, 250, 0.7)' }}>
                      Field Interaction
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.presenceEnergetics.field_interaction}</p>
                </div>

                {/* Energetic Gift */}
                <div className="inner-panel-dark rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       borderTop: '2px solid rgba(251, 191, 36, 0.3)',
                       boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>{'\u2726'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>
                      Energetic Gift
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.presenceEnergetics.energetic_gift}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Presence Practice */}
                <div className="inner-panel-dark rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       borderTop: '2px solid rgba(244, 114, 182, 0.3)',
                       boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{'\uD83E\uDDD8'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(244, 114, 182, 0.7)' }}>
                      Presence Practice
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.presenceEnergetics.presence_practice}</p>
                </div>

                {/* Spatial Influence */}
                <div className="inner-panel-dark rounded-xl p-4 transition-all duration-200 ease-out-expo"
                     style={{
                       borderTop: '2px solid rgba(148, 163, 184, 0.3)',
                       boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02)'
                     }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>{'\u2727'}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                      Spatial Influence
                    </span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">{plant.presenceEnergetics.spatial_influence}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contraindications */}
        {plant.contraindications && plant.contraindications.length > 0 && (
          <div className="card p-5 lg:col-span-2"
               style={{
                 background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.06), rgba(16, 15, 12, 0.85))',
                 border: '1px solid rgba(220, 38, 38, 0.1)'
               }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl text-red-400">{'\u26D4'}</span>
              <h2 className="section-title text-red-300 mb-0">Contraindications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header border-b border-earth-800/40">
                    <th className="pb-2.5 pr-3 text-left">Condition</th>
                    <th className="pb-2.5 pr-3 text-left">Severity</th>
                    <th className="pb-2.5 pr-3 text-left">Reason</th>
                    <th className="pb-2.5 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {plant.contraindications.map((ci) => (
                    <tr key={ci.id} className="table-row">
                      <td className="py-2.5 pr-3">
                        <button
                          onClick={() => navigate(`/ailments/${ci.ailment_id}`)}
                          className="text-earth-200 hover:text-red-300 transition-colors duration-150 ease-out-expo"
                        >
                          {ci.ailment_name}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={`badge ${
                          ci.severity === 'high'
                            ? 'bg-red-500/10 text-red-300 ring-red-500/20'
                            : ci.severity === 'moderate'
                            ? 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
                            : 'bg-yellow-500/10 text-yellow-300 ring-yellow-500/20'
                        }`}>
                          {ci.severity}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-earth-400 text-xs">{ci.reason || '-'}</td>
                      <td className="py-2.5 text-earth-500 text-xs italic">{ci.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Safety */}
        {plant.safety_notes && (
          <div className="card p-5"
               style={{
                 background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(16, 15, 12, 0.85))',
                 border: '1px solid rgba(245, 158, 11, 0.08)'
               }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl text-amber-500">{'\u26A0'}</span>
              <h2 className="section-title text-amber-400 mb-0">Safety Notes</h2>
            </div>
            <p className="text-earth-300 text-sm leading-relaxed">{plant.safety_notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
