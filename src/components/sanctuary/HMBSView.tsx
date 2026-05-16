import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/data/api'
import type { HMBSDomainSummary } from '../../types'
import CatalogLayout from '@/components/design-system/layouts/CatalogLayout'
import Text from '@/components/design-system/atoms/Text'
import { HMBS_DOMAINS, DOMAIN_CSS_MAP } from './hmbs-domains'

export default function HMBSView() {
  const [summary, setSummary] = useState<HMBSDomainSummary[]>([])

  useEffect(() => {
    api.getHMBSSummary().then(setSummary)
  }, [])

  const getDomainCount = (key: string) => {
    const s = summary.find((d) => d.domain === key)
    return s ? s.total : 0
  }

  return (
    <CatalogLayout
      header={
        <div className="px-4 md:px-8 pt-6 pb-4">
          <div className="hero-section mb-0">
            <div className="hero-orb w-60 h-60 bg-purple-500 top-0 right-0" />
            <div className="hero-orb w-40 h-40 bg-rose-500 bottom-0 left-0" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-1 h-10 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to bottom, #f43f5e, #3b82f6, #3d8a5e, #a855f7)',
                  }}
                />
                <div>
                  <Text.PageTitle className="text-gradient-hmbs">
                    Heart {'·'} Mind {'·'} Body {'·'} Spirit
                  </Text.PageTitle>
                  <p className="text-earth-400 text-sm mt-1">
                    The four domains of the Sanctuary {'—'} each a doorway into plant
                    intelligence
                  </p>
                </div>
              </div>
              <p className="text-earth-500 text-xs mt-3 font-display italic">
                {'“'}The digital tool becomes the brain; the sanctuary becomes the body.
                {'”'}
              </p>
            </div>
          </div>
        </div>
      }
      results={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 md:px-8 pt-3 pb-8">
          {HMBS_DOMAINS.map((domain) => (
            <Link
              key={domain.key}
              to={`/hmbs/${domain.key}`}
              className={`block hmbs-card hmbs-${DOMAIN_CSS_MAP[domain.name]} text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-400`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-3xl opacity-50 block mb-2" aria-hidden="true">
                    {domain.icon}
                  </span>
                  <Text.PageTitle as="h2" className={domain.textColor}>
                    {domain.name}
                  </Text.PageTitle>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`badge badge-${DOMAIN_CSS_MAP[domain.name]}`}>
                    {domain.element}
                  </span>
                  <span className="text-[10px] text-earth-500">
                    {getDomainCount(domain.key)} plants
                  </span>
                </div>
              </div>
              <p className="text-xs text-earth-400 leading-relaxed line-clamp-3">
                {domain.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-earth-600">{domain.frequency}</span>
              </div>
            </Link>
          ))}
        </div>
      }
      itemCount={4}
    />
  )
}
