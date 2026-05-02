import { useState, useEffect } from 'react'
import { api } from '@/data/api'
import type { Preparation } from '../../types'

export default function PreparationMatrix() {
  const [preparations, setPreparations] = useState<Preparation[]>([])
  const [selected, setSelected] = useState<Preparation | null>(null)

  useEffect(() => {
    api.getPreparations().then(setPreparations)
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-display font-bold text-earth-100">Preparation Methods</h1>
        <p className="text-sm text-earth-500">How plant material is processed determines bioavailability</p>
      </div>

      {/* Matrix Table */}
      <div className="glass-panel p-4 mb-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <th className="pb-3 pr-4">Method</th>
              <th className="pb-3 pr-4">Solvent</th>
              <th className="pb-3 pr-4">Best Parts</th>
              <th className="pb-3 pr-4">Absorption</th>
              <th className="pb-3 pr-4">Concentration</th>
              <th className="pb-3">Shelf Life</th>
            </tr>
          </thead>
          <tbody>
            {preparations.map((prep) => (
              <tr
                key={prep.id}
                onClick={() => setSelected(prep)}
                className={`table-row cursor-pointer ${
                  selected?.id === prep.id
                    ? 'bg-botanical-950/20'
                    : ''
                }`}
              >
                <td className="py-3 pr-4 font-display font-medium text-earth-200">{prep.name}</td>
                <td className="py-3 pr-4 text-earth-400">{prep.solvent || '-'}</td>
                <td className="py-3 pr-4 text-earth-400">{prep.best_plant_parts}</td>
                <td className="py-3 pr-4">
                  <span className={`badge ${
                    prep.absorption_speed?.includes('Very Fast') ? 'bg-green-500/10 text-green-300 ring-green-500/20' :
                    prep.absorption_speed?.includes('Fast') ? 'bg-green-500/8 text-green-400 ring-green-500/15' :
                    prep.absorption_speed?.includes('Moderate') ? 'bg-amber-500/10 text-amber-300 ring-amber-500/20' :
                    'bg-earth-700/20 text-earth-400 ring-earth-600/20'
                  }`}>
                    {prep.absorption_speed}
                  </span>
                </td>
                <td className="py-3 pr-4 text-earth-400">{prep.concentration_level}</td>
                <td className="py-3 text-earth-400">{prep.shelf_life}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="card-glow-botanical animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl opacity-50">{'\u2697'}</span>
            <h2 className="section-title mb-0">{selected.name}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Solvent', value: selected.solvent || 'None' },
              { label: 'Best Plant Parts', value: selected.best_plant_parts },
              { label: 'Shelf Life', value: selected.shelf_life }
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3"
                   style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="section-subtitle">{item.label}</div>
                <div className="text-earth-200 text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          {selected.general_instructions && (
            <div className="mb-4">
              <div className="section-subtitle mb-2">Instructions</div>
              <div className="rounded-xl p-4 space-y-1.5"
                   style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                {selected.general_instructions.split('\n').map((step, i) => (
                  <p key={i} className="text-sm text-earth-300 leading-relaxed">{step}</p>
                ))}
              </div>
            </div>
          )}

          {selected.safety_notes && (
            <div className="rounded-xl p-4"
                 style={{
                   background: 'rgba(245, 158, 11, 0.04)',
                   border: '1px solid rgba(245, 158, 11, 0.1)'
                 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500">{'\u26A0'}</span>
                <span className="text-sm font-medium text-amber-400">Safety Notes</span>
              </div>
              <p className="text-sm text-earth-400 leading-relaxed">{selected.safety_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
