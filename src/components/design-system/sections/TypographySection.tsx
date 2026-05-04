import { Section, Subsection } from '../primitives'
import Text from '../atoms/Text'

export default function TypographySection() {
  return (
    <Section id="typography" title="Typography">
      <Subsection title="Display">
        <Text.Display>14 HEC Plant Intelligence</Text.Display>
      </Subsection>

      <Subsection title="Page Title">
        <Text.PageTitle>Plants</Text.PageTitle>
      </Subsection>

      <Subsection title="Heading">
        <Text.Heading>Plant Journal</Text.Heading>
      </Subsection>

      <Subsection title="Subheading">
        <Text.Subheading>Chart Synthesis</Text.Subheading>
      </Subsection>

      <Subsection title="Section Title">
        <Text.SectionTitle>Plant Recommendations</Text.SectionTitle>
      </Subsection>

      <Subsection title="Section Label">
        <Text.SectionLabel>Ruling Planet</Text.SectionLabel>
      </Subsection>

      <Subsection title="Card Title">
        <Text.CardTitle>Yarrow</Text.CardTitle>
      </Subsection>

      <Subsection title="Tone overrides">
        <div className="space-y-2">
          <Text.Display className="text-gradient-botanical">
            Botanical gradient
          </Text.Display>
          <Text.PageTitle className="text-gradient-celestial">
            Celestial gradient
          </Text.PageTitle>
          <Text.SectionTitle className="text-red-300">
            Plants to Avoid
          </Text.SectionTitle>
          <Text.CardTitle className="text-botanical-400">
            Botanical accent
          </Text.CardTitle>
        </div>
      </Subsection>
    </Section>
  )
}
