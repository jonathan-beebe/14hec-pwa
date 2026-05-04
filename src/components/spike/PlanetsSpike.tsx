import ParticlePlanet from './ParticlePlanet'
import { allPlanets } from './planetConfig'

export default function PlanetsSpike() {
  return (
    <div className="min-h-[80vh] flex items-center overflow-x-auto">
      <div className="flex items-end gap-6 px-8 py-12 mx-auto">
        {allPlanets.map((p) => (
          <ParticlePlanet key={p.name} config={p} />
        ))}
      </div>
    </div>
  )
}
