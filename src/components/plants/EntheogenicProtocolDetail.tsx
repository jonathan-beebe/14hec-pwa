import { useParams } from 'react-router-dom'
import Text from '@/components/design-system/atoms/Text'
import { findProtocolBySlug } from './entheogenicProtocols'

export default function EntheogenicProtocolDetail() {
  const { slug } = useParams<{ slug: string }>()
  const protocol = findProtocolBySlug(slug)

  if (!protocol) {
    return <div className="p-8 lg:pl-2 text-earth-500 text-sm">Protocol not found.</div>
  }

  return (
    <div className="p-8 lg:pl-2">
      <div className="card-glow-botanical animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl opacity-50">{protocol.icon}</span>
          <Text.PageTitle as="h2" className="text-botanical-400">{protocol.name}</Text.PageTitle>
        </div>
        <p className="text-sm text-earth-400 mb-6 leading-relaxed">{protocol.description}</p>

        <div className="space-y-0">
          {protocol.phases.map((phase, i) => (
            <div key={i} className="relative pl-8 pb-6 last:pb-0">
              {i < protocol.phases.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gradient-to-b from-botanical-700/50 to-botanical-700/10" />
              )}
              <div
                className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-botanical-600 bg-earth-950"
                style={{ boxShadow: '0 0 8px rgba(93, 168, 126, 0.2)' }}
              />
              <div className="text-xs text-botanical-500 mb-1 font-medium">{phase.duration}</div>
              <Text.CardTitle as="h4" className="text-earth-200 mb-1.5">{phase.name}</Text.CardTitle>
              <p className="text-xs text-earth-400 leading-relaxed">{phase.guidance}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
