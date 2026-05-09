import { Section, Subsection } from '../primitives'
import Button from '../atoms/Button'
import { Icon } from '../atoms/Icon'

const iconSet: Array<[name: string, node: JSX.Element]> = [
  ['Plant', <Icon.Plant size={24} />],
  ['Ailment', <Icon.Ailment size={24} />],
  ['Zodiac', <Icon.Zodiac size={24} />],
  ['Heart', <Icon.Heart size={24} />],
  ['Mind', <Icon.Mind size={24} />],
  ['Body', <Icon.Body size={24} />],
  ['Spirit', <Icon.Spirit size={24} />],
]

export default function AtomsSection() {
  return (
    <Section id="atoms" title="Atoms">
      <Subsection title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button.Primary onClick={() => alert('Primary clicked')}>
            Primary
          </Button.Primary>
          <Button.Celestial onClick={() => alert('Celestial clicked')}>
            Celestial
          </Button.Celestial>
          <Button.Ghost onClick={() => alert('Ghost clicked')}>
            Ghost
          </Button.Ghost>
          <Button.Primary disabled onClick={() => alert('Disabled clicked')}>
            Disabled
          </Button.Primary>
        </div>
      </Subsection>

      <Subsection title="Icon">
        <p className="text-earth-400 text-xs font-system mb-3 leading-relaxed">
          Named icon components. Today they render unicode glyphs at a controlled
          size; SVGs can replace the implementations later without touching call
          sites. Canonical sizes: 16 / 20 / 24. Color flows from the parent's
          text color.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {iconSet.map(([name, node]) => (
            <div
              key={name}
              className="card flex flex-col items-center gap-2 text-earth-300"
            >
              {node}
              <code className="text-[10px] uppercase tracking-[0.18em] text-earth-500">
                Icon.{name}
              </code>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  )
}
