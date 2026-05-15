import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { api } from '@/data/api'
import type { Ailment, HMBSPlant } from '../../types'
import Text from '@/components/design-system/atoms/Text'
import { getDomainByKey, DOMAIN_CSS_MAP, STRENGTH_LABELS } from './hmbs-domains'

export default function HMBSDomainDetail() {
  const { domain: domainKey } = useParams<{ domain: string }>()
  const navigate = useNavigate()
  const domain = domainKey ? getDomainByKey(domainKey) : undefined

  const [ailments, setAilments] = useState<Ailment[]>([])
  const [domainPlants, setDomainPlants] = useState<HMBSPlant[]>([])
  const [strengthFilter, setStrengthFilter] = useState<string>('')

  useEffect(() => {
    if (domain) {
      api.getAilments().then(setAilments)
    }
  }, [domain])

  useEffect(() => {
    if (domain) {
      api.getHMBSPlants(domain.key, strengthFilter || undefined).then(setDomainPlants)
    }
  }, [domain, strengthFilter])

  if (!domain) {
    return <Navigate to="/hmbs" replace />
  }

  const cssKey = DOMAIN_CSS_MAP[domain.name]
  const findAilmentByName = (name: string) =>
    ailments.find((a) => a.name.toLowerCase() === name.toLowerCase())

  return (
    <div className="animate-fade-in">
      <Link
        to="/hmbs"
        className="text-[11px] text-earth-500 hover:text-earth-200 transition-colors"
      >
        {'← '}Heart · Mind · Body · Spirit
      </Link>

      <div className="space-y-6 mt-4">
        {/* Domain Header */}
        <div className="glass-panel p-6" style={{ background: domain.gradient }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl opacity-40">{domain.icon}</span>
            <div>
              <Text.Heading className={domain.textColor}>
                The {domain.name} Domain
              </Text.Heading>
              <p className="text-xs text-earth-500 mt-1">{domain.frequency}</p>
            </div>
          </div>
          <p className="text-sm text-earth-300 leading-relaxed">{domain.description}</p>
          <div
            className="mt-4 rounded-xl p-3"
            style={{ background: 'rgba(26, 25, 21, 0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <Text.SectionLabel>Body Areas</Text.SectionLabel>
            <p className="text-sm text-earth-300">{domain.bodyAreas}</p>
          </div>
        </div>

        {/* Associated Plants */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-50">{'☘'}</span>
              <Text.SectionTitle as="h3" className="mb-0">
                {domain.name} Plants
              </Text.SectionTitle>
              <span className="text-xs text-earth-500">({domainPlants.length})</span>
            </div>
            <div className="flex gap-1.5">
              {['', 'primary', 'secondary', 'tertiary'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStrengthFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                    strengthFilter === s
                      ? `${domain.textColor}`
                      : 'text-earth-500 hover:text-earth-300'
                  }`}
                  style={{
                    background: strengthFilter === s ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border:
                      strengthFilter === s
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid transparent',
                  }}
                >
                  {s === '' ? 'All' : STRENGTH_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {domainPlants.map((p) => (
              <button
                key={p.plant_id}
                onClick={() => navigate(`/plants/${p.plant_id}`)}
                className="text-left rounded-xl p-3 transition-all duration-200 ease-out-expo group"
                style={{
                  background: 'rgba(26, 25, 21, 0.5)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-botanical-400 font-medium group-hover:text-botanical-300 transition-colors">
                      {p.common_name}
                    </span>
                    <span className="text-earth-500 text-xs ml-2 italic">{p.latin_name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ring-1 ring-inset ${
                      p.strength === 'primary'
                        ? `bg-${domain.color}-500/10 text-${domain.color}-300 ring-${domain.color}-500/20`
                        : p.strength === 'secondary'
                          ? 'bg-earth-700/30 text-earth-300 ring-earth-600/20'
                          : 'bg-earth-800/30 text-earth-500 ring-earth-700/20'
                    }`}
                  >
                    {p.strength}
                  </span>
                </div>
                {p.reason && (
                  <p className="text-xs text-earth-500 mt-1.5 line-clamp-1">{p.reason}</p>
                )}
                {p.plant_part_affinity && (
                  <span className="text-[10px] text-earth-600 mt-1 block">
                    Part: {p.plant_part_affinity}
                  </span>
                )}
              </button>
            ))}
          </div>
          {domainPlants.length === 0 && (
            <p className="text-earth-500 text-sm text-center py-4">
              No plants found for this filter.
            </p>
          )}
        </div>

        {/* Associated Ailments */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'⚕'}</span>
            <Text.SectionTitle as="h3" className="mb-0">
              {domain.name} Ailments
            </Text.SectionTitle>
          </div>
          <div className="flex flex-wrap gap-3">
            {domain.supportAilments.map((name) => {
              const ailment = findAilmentByName(name)
              return ailment ? (
                <button
                  key={name}
                  onClick={() => navigate(`/ailments/${ailment.id}`)}
                  className={`badge badge-${cssKey} px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {name}
                </button>
              ) : (
                <span key={name} className={`badge badge-${cssKey} px-3 py-1.5`}>
                  {name}
                </span>
              )
            })}
          </div>
        </div>

        {/* Sanctuary Rituals */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl opacity-50">{'☸'}</span>
            <Text.SectionTitle as="h3" className="mb-0">
              Sanctuary Rituals
            </Text.SectionTitle>
          </div>
          <p className="text-xs text-earth-500 mb-4">
            Practices for the {domain.name} Room in the physical sanctuary
          </p>
          <div className="space-y-2">
            {domain.rituals.map((ritual, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: 'rgba(26, 25, 21, 0.4)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className={`w-2 h-2 rounded-full bg-${domain.color}-400/50`} />
                <span className="text-sm text-earth-300">{ritual}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
