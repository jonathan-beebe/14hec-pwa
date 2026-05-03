import { Section, Subsection } from '../primitives'
import LinkCard from '../components/LinkCard'

export default function ComponentsSection() {
  return (
    <Section id="components" title="Components">
      <Subsection title="LinkCard">
        <div className="grid grid-cols-3 gap-3">
          <LinkCard.Plain
            to="/design-system"
            icon={'☘'}
            title="Plain"
            caption="Neutral surface for collections, generic destinations"
          />
          <LinkCard.Botanical
            to="/design-system"
            icon={'❁'}
            title="Botanical"
            caption="Plants, seasonal, body systems, preparations"
          />
          <LinkCard.Celestial
            to="/design-system"
            icon={'⭐'}
            title="Celestial"
            caption="Astrology, planetary timing, entheogenic guidance"
          />
        </div>
      </Subsection>
    </Section>
  )
}
