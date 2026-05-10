import { useState } from 'react'
import { Section, Subsection } from '../primitives'
import LinkCard from '../components/LinkCard'
import StatCard from '../components/StatCard'
import DomainCard from '../components/DomainCard'
import InfoTile from '../components/InfoTile'
import BrowseTile from '../components/BrowseTile'
import PlanetTile from '../components/PlanetTile'
import FlatListRow from '../components/FlatListRow'
import Badge from '../atoms/Badge'
import { Icon } from '../atoms/Icon'
import {
  sun,
  moon,
  mercury,
  venus,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto,
  type PlanetVisual,
} from '@/components/spike/planetConfig'

type PlanetTileEntry = { config: PlanetVisual; signs: string }
const planetTileEntries: PlanetTileEntry[] = [
  { config: sun, signs: 'Leo' },
  { config: moon, signs: 'Cancer' },
  { config: mercury, signs: 'Gemini, Virgo' },
  { config: venus, signs: 'Taurus, Libra' },
  { config: mars, signs: 'Aries, Scorpio' },
  { config: jupiter, signs: 'Sagittarius, Pisces' },
  { config: saturn, signs: 'Capricorn, Aquarius' },
  { config: uranus, signs: 'Aquarius' },
  { config: neptune, signs: 'Pisces' },
  { config: pluto, signs: 'Scorpio' },
]

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

      <Subsection title="BrowseTile">
        <p className="text-earth-400 text-xs font-system mb-4 leading-relaxed">
          The catalog/list counterpart to <code>InfoTile</code>: black
          surface, system text, hover glow, click zoom. No icon column,
          no gradient frame, no sand — designed to read calmly when dozens
          appear together in a grouped or filterable view.
        </p>

        <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
          States
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <BrowseTile onClick={() => {}}>
            <div className="text-sm font-medium text-earth-100">Default</div>
            <p className="text-xs text-earth-500 mt-1 leading-relaxed">
              Resting tile. Hover to glow, press to zoom.
            </p>
          </BrowseTile>
          <BrowseTile onClick={() => {}} active>
            <div className="text-sm font-medium text-earth-100">Active</div>
            <p className="text-xs text-earth-500 mt-1 leading-relaxed">
              Selected item — brighter bg, botanical-tinted border.
            </p>
          </BrowseTile>
        </div>

        <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
          In a catalog grid
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <BrowseTile to="/design-system">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-sm font-medium text-earth-100">Rosemary</span>
              <Badge.Conventional>conventional</Badge.Conventional>
            </div>
            <p className="text-xs text-earth-500 italic mb-1.5">Salvia rosmarinus</p>
            <p className="text-xs text-earth-400 line-clamp-2">
              Memory, circulation, sun-aligned. A perennial guardian of clarity.
            </p>
          </BrowseTile>
          <BrowseTile to="/design-system">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-sm font-medium text-earth-100">Mugwort</span>
              <Badge.Both>both</Badge.Both>
            </div>
            <p className="text-xs text-earth-500 italic mb-1.5">Artemisia vulgaris</p>
            <p className="text-xs text-earth-400 line-clamp-2">
              Dream, threshold, lunar. Carries one across edges.
            </p>
          </BrowseTile>
          <BrowseTile to="/design-system">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-sm font-medium text-earth-100">Datura</span>
              <Badge.Entheogenic>entheogenic</Badge.Entheogenic>
            </div>
            <p className="text-xs text-earth-500 italic mb-1.5">Datura stramonium</p>
            <p className="text-xs text-earth-400 line-clamp-2">
              Threshold plant of the witches. Approached only with rigor.
            </p>
          </BrowseTile>
        </div>
      </Subsection>

      <Subsection title="FlatListRow">
        <p className="text-earth-400 text-xs font-system mb-4 leading-relaxed">
          Edge-to-edge list row for sidebar/list surfaces. At rest the
          row is fully transparent and inherits whatever bg sits behind
          the list. Hover and select fade in a left-edge bar, a soft
          left-side glow, and a black-to-transparent wash that darkens
          the left side so the glow pops — all anchored on the left,
          nothing on the right.
        </p>

        <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
          Tinted — drives icon, glow, and edge bar
        </div>
        <ul className="mb-6 max-w-md">
          <li>
            <FlatListRow
              to="/design-system"
              tintHex="#dc2626"
              icon={<Icon.Sun />}
              sandIcon={showSand ? Icon.Sun.source : undefined}
              primary="Aries"
              secondary={<span className="capitalize">fire · cardinal</span>}
            />
          </li>
          <li>
            <FlatListRow
              to="/design-system"
              tintHex="#16a34a"
              icon={<Icon.Shamrock />}
              sandIcon={showSand ? Icon.Shamrock.source : undefined}
              primary="Taurus"
              secondary={<span className="capitalize">earth · fixed</span>}
              selected
            />
          </li>
          <li>
            <FlatListRow
              to="/design-system"
              tintHex="#facc15"
              icon={<Icon.StarFourPoint />}
              sandIcon={showSand ? Icon.StarFourPoint.source : undefined}
              primary="Gemini"
              secondary={<span className="capitalize">air · mutable</span>}
            />
          </li>
        </ul>

        <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
          Neutral — no <code>tintHex</code>, white wash + bar
        </div>
        <ul className="max-w-md">
          <li>
            <FlatListRow
              to="/design-system"
              icon={<Icon.Heart />}
              sandIcon={showSand ? Icon.Heart.source : undefined}
              primary="Heart"
              secondary="Love, connection, empathy"
            />
          </li>
          <li>
            <FlatListRow
              to="/design-system"
              icon={<Icon.Atom />}
              sandIcon={showSand ? Icon.Atom.source : undefined}
              primary="Mind"
              secondary="Clarity, focus, cognition"
              selected
            />
          </li>
          <li>
            <FlatListRow
              to="/design-system"
              icon={<Icon.Ankh />}
              sandIcon={showSand ? Icon.Ankh.source : undefined}
              primary="Body"
              secondary="Vitality, strength, healing"
            />
          </li>
        </ul>
      </Subsection>

      <Subsection title="PlanetTile">
        <p className="text-earth-400 text-xs font-system mb-4 leading-relaxed">
          Astrology picker tile. The icon slot hosts a live WebGL canvas
          rendering the planet (body + ring + sparkle) with a wind tail
          drifting past the text — same role the sand tail plays in{' '}
          <code>InfoTile</code>. Hover or focus morphs the planet into its
          astrological glyph. Reduced motion shows the static glyph
          instead. Each tile owns its own GL context, so very dense grids
          will need a shared overlay canvas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {planetTileEntries.map(({ config, signs }) => (
            <PlanetTile
              key={config.name}
              config={config}
              primary={config.name}
              secondary={signs}
              onClick={() => {}}
              aria-label={`${config.name} — ${signs}`}
            />
          ))}
        </div>
      </Subsection>
    </Section>
  )
}
