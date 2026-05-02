import { Section, Subsection } from '../primitives'

export default function TypographySection() {
  return (
    <Section id="typography" title="Typography">
      <Subsection title="Placeholder">
        <h1 className="text-3xl font-display font-bold text-earth-100">
          Heading 1
        </h1>
      </Subsection>
    </Section>
  )
}
