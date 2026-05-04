import ParticlePlanet from './ParticlePlanet'
import { earth, jupiter, saturn, uranus } from './planetConfig'

export default function PlanetsSpike() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex items-end gap-12">
        <ParticlePlanet config={earth} />
        <ParticlePlanet config={uranus} />
        <ParticlePlanet config={saturn} />
        <ParticlePlanet config={jupiter} />
      </div>
    </div>
  )
}
