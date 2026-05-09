import { Section, Subsection } from '../primitives'
import LinkCard from '../components/LinkCard'
import StatCard from '../components/StatCard'
import DomainCard from '../components/DomainCard'
import InfoTile from '../components/InfoTile'
import { Icon } from '../atoms/Icon'

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

      <Subsection title="StatCard">
        <div className="grid grid-cols-3 gap-3">
          <StatCard.Botanical to="/design-system" icon={'☘'} count={207} label="Plants" />
          <StatCard.Celestial to="/design-system" icon={'⚕'} count={75} label="Ailments" />
          <StatCard.Gold to="/design-system" icon={'☉'} count={12} label="Zodiac" />
        </div>
      </Subsection>

      <Subsection title="DomainCard">
        <div className="grid grid-cols-4 gap-3">
          <DomainCard domain="heart"  to="/design-system" icon={'♡'} title="Heart"  description="Love, connection, empathy" />
          <DomainCard domain="mind"   to="/design-system" icon={'☉'} title="Mind"   description="Clarity, focus, cognition" />
          <DomainCard domain="body"   to="/design-system" icon={'☘'} title="Body"   description="Vitality, strength, healing" />
          <DomainCard domain="spirit" to="/design-system" icon={'✦'} title="Spirit" description="Transcendence, intuition" />
        </div>
      </Subsection>

      <Subsection title="InfoTile">
        <div className="grid grid-cols-3 gap-3">
          <InfoTile.Botanical to="/design-system" icon={<Icon.Shamrock />}      primary={207}    secondary="Plants" />
          <InfoTile.Celestial to="/design-system" icon={<Icon.Aesculapius />}   primary={75}     secondary="Ailments" />
          <InfoTile.Gold      to="/design-system" icon={<Icon.Sun />}           primary={12}     secondary="Zodiac" />
          <InfoTile.Heart     to="/design-system" icon={<Icon.Heart />}         primary="Heart"  secondary="Love, connection, empathy" />
          <InfoTile.Mind      to="/design-system" icon={<Icon.Atom />}          primary="Mind"   secondary="Clarity, focus, cognition" />
          <InfoTile.Body      to="/design-system" icon={<Icon.Ankh />}          primary="Body"   secondary="Vitality, strength, healing" />
          <InfoTile.Spirit    to="/design-system" icon={<Icon.StarFourPoint />} primary="Spirit" secondary="Transcendence, intuition" />
        </div>
      </Subsection>
    </Section>
  )
}
