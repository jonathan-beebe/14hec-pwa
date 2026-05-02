import { Section, Subsection } from '../primitives'
import Button from '../atoms/Button'

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
    </Section>
  )
}
