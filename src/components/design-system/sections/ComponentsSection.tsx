import { useState } from 'react'
import { Section, Subsection } from '../primitives'
import LinkCard from '../components/LinkCard'
import StatCard from '../components/StatCard'
import DomainCard from '../components/DomainCard'
import InfoTile from '../components/InfoTile'
import { Icon } from '../atoms/Icon'

export default function ComponentsSection() {
  const [showSand, setShowSand] = useState(true)

  const segBase = 'px-2.5 py-1 text-[11px] font-system transition-colors'
  const segActive = 'bg-earth-700/60 text-earth-100'
  const segInactive = 'text-earth-400 hover:text-earth-200'

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
        <p className="text-earth-400 text-xs font-system mb-4 leading-relaxed">
          Numeric tiles pass <code>aria-label</code> so screen readers hear
          "207 plants in the library" instead of just "207, Plants." Text
          tiles (Heart, Mind, Body, Spirit) omit <code>aria-label</code>:
          the visible primary + secondary text already names the link.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500">
            Icon variant
          </div>
          <div
            role="group"
            aria-label="Icon variant"
            className="inline-flex rounded-md border border-earth-700/60 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setShowSand(false)}
              aria-pressed={!showSand}
              className={`${segBase} ${!showSand ? segActive : segInactive}`}
            >
              Static
            </button>
            <button
              type="button"
              onClick={() => setShowSand(true)}
              aria-pressed={showSand}
              className={`${segBase} border-l border-earth-700/60 ${showSand ? segActive : segInactive}`}
            >
              Sand
            </button>
          </div>
        </div>
        <div className="text-[10px] text-earth-500 font-system mb-3 leading-relaxed">
          Drifting particles + wind tail; falls back to static when reduced motion is on.
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <InfoTile.Botanical to="/design-system" icon={<Icon.Shamrock />}    sandIcon={showSand ? Icon.Shamrock.source    : undefined} primary={207} secondary="Plants"   aria-label="207 plants in the library" />
          <InfoTile.Celestial to="/design-system" icon={<Icon.Aesculapius />} sandIcon={showSand ? Icon.Aesculapius.source : undefined} primary={75}  secondary="Ailments" aria-label="75 ailments catalogued" />
          <InfoTile.Gold      to="/design-system" icon={<Icon.Sun />}         sandIcon={showSand ? Icon.Sun.source         : undefined} primary={12}  secondary="Zodiac"   aria-label="12 zodiac signs" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
          Domain tiles
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoTile.Heart  to="/design-system" icon={<Icon.Heart />}         sandIcon={showSand ? Icon.Heart.source         : undefined} primary="Heart"  secondary="Love, connection, empathy" />
          <InfoTile.Mind   to="/design-system" icon={<Icon.Atom />}          sandIcon={showSand ? Icon.Atom.source          : undefined} primary="Mind"   secondary="Clarity, focus, cognition" />
          <InfoTile.Body   to="/design-system" icon={<Icon.Ankh />}          sandIcon={showSand ? Icon.Ankh.source          : undefined} primary="Body"   secondary="Vitality, strength, healing" />
          <InfoTile.Spirit to="/design-system" icon={<Icon.StarFourPoint />} sandIcon={showSand ? Icon.StarFourPoint.source : undefined} primary="Spirit" secondary="Transcendence, intuition" />
        </div>
      </Subsection>
    </Section>
  )
}
