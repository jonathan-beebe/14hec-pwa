import { Section, Subsection } from '../primitives'
import Type from '../atoms/Type'

export default function TypeSection() {
  return (
    <Section id="type" title="Type">
      <Subsection title="Branded — Display">
        <Type.Branded.Display>14 HEC</Type.Branded.Display>
      </Subsection>

      <Subsection title="Branded — Page Title">
        <Type.Branded.PageTitle>Sanctuary</Type.Branded.PageTitle>
      </Subsection>

      <Subsection title="Branded — Heading">
        <Type.Branded.Heading>Heart of the Garden</Type.Branded.Heading>
      </Subsection>

      <Subsection title="Branded — Latin (inline)">
        <div className="space-y-2">
          <Type.CardTitle>
            Yarrow{' '}
            <Type.Branded.Latin className="text-earth-300">
              Achillea millefolium
            </Type.Branded.Latin>
          </Type.CardTitle>
          <Type.Body>
            The teachings of{' '}
            <Type.Branded.Latin>Salvia apiana</Type.Branded.Latin> describe
            a plant that listens before it speaks.
          </Type.Body>
        </div>
      </Subsection>

      <Subsection title="System — Display">
        <Type.Display>14 HEC Plant Intelligence</Type.Display>
      </Subsection>

      <Subsection title="System — Page Title">
        <Type.PageTitle>Plants</Type.PageTitle>
      </Subsection>

      <Subsection title="System — Heading">
        <Type.Heading>Plant Journal</Type.Heading>
      </Subsection>

      <Subsection title="System — Subheading">
        <Type.Subheading>Chart Synthesis</Type.Subheading>
      </Subsection>

      <Subsection title="System — Section Title">
        <Type.SectionTitle>Plant Recommendations</Type.SectionTitle>
      </Subsection>

      <Subsection title="System — Card Title">
        <Type.CardTitle>Yarrow</Type.CardTitle>
      </Subsection>

      <Subsection title="System — Body">
        <Type.Body>
          Plants activate what is already within us. They are mirrors and
          catalysts, not additions — the body recognizes itself in their
          presence and responds with what it already knows how to do.
        </Type.Body>
      </Subsection>

      <Subsection title="System — Body Small">
        <Type.BodySmall>
          A compact register for secondary content, captions in dense
          layouts, and supporting passages that sit beneath a primary line.
        </Type.BodySmall>
      </Subsection>

      <Subsection title="System — Caption">
        <Type.Caption>Last updated 3 days ago</Type.Caption>
      </Subsection>

      <Subsection title="System — Section Label">
        <Type.SectionLabel>Ruling Planet</Type.SectionLabel>
      </Subsection>

      <Subsection title="System — Numeric">
        <Type.Body>
          A catalog of <Type.Numeric>207</Type.Numeric> plants,{' '}
          <Type.Numeric>75</Type.Numeric> ailments, and{' '}
          <Type.Numeric>91</Type.Numeric> compounds.
        </Type.Body>
      </Subsection>

      <Subsection title="Tone overrides">
        <div className="space-y-2">
          <Type.Branded.Display className="text-gradient-botanical">
            Botanical gradient
          </Type.Branded.Display>
          <Type.Branded.PageTitle className="text-gradient-celestial">
            Celestial gradient
          </Type.Branded.PageTitle>
          <Type.SectionTitle className="text-red-300">
            Plants to Avoid
          </Type.SectionTitle>
          <Type.CardTitle className="text-botanical-400">
            Botanical accent
          </Type.CardTitle>
        </div>
      </Subsection>
    </Section>
  )
}
