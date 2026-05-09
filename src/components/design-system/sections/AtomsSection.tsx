import type { ComponentType } from 'react'
import { Section, Subsection } from '../primitives'
import Button from '../atoms/Button'
import { Icon, type IconProps } from '../atoms/Icon'

type IconEntry = { name: string; component: ComponentType<IconProps> }
type IconGroup = { label: string; entries: IconEntry[] }

const iconGroups: IconGroup[] = [
  {
    label: 'Botanical / domain',
    entries: [
      { name: 'Shamrock', component: Icon.Shamrock },
      { name: 'Aesculapius', component: Icon.Aesculapius },
      { name: 'Heart', component: Icon.Heart },
      { name: 'HeartExclamation', component: Icon.HeartExclamation },
      { name: 'Atom', component: Icon.Atom },
      { name: 'Ankh', component: Icon.Ankh },
      { name: 'Lotus', component: Icon.Lotus },
    ],
  },
  {
    label: 'Celestial bodies',
    entries: [
      { name: 'Sun', component: Icon.Sun },
      { name: 'Moon', component: Icon.Moon },
      { name: 'Mercury', component: Icon.Mercury },
      { name: 'Venus', component: Icon.Venus },
      { name: 'Mars', component: Icon.Mars },
      { name: 'Jupiter', component: Icon.Jupiter },
      { name: 'Saturn', component: Icon.Saturn },
      { name: 'Uranus', component: Icon.Uranus },
      { name: 'Neptune', component: Icon.Neptune },
      { name: 'Pluto', component: Icon.Pluto },
      { name: 'Comet', component: Icon.Comet },
    ],
  },
  {
    label: 'Stars / decorative',
    entries: [
      { name: 'Star', component: Icon.Star },
      { name: 'StarFourPoint', component: Icon.StarFourPoint },
      { name: 'StarFourPointOutline', component: Icon.StarFourPointOutline },
      { name: 'StarSixPoint', component: Icon.StarSixPoint },
      { name: 'StarEightPoint', component: Icon.StarEightPoint },
      { name: 'StarPinwheel', component: Icon.StarPinwheel },
      { name: 'Sparkles', component: Icon.Sparkles },
      { name: 'Snowflake', component: Icon.Snowflake },
      { name: 'Florette', component: Icon.Florette },
      { name: 'FloretteOutlined', component: Icon.FloretteOutlined },
    ],
  },
  {
    label: 'Emblems / objects',
    entries: [
      { name: 'House', component: Icon.House },
      { name: 'Scales', component: Icon.Scales },
      { name: 'Alembic', component: Icon.Alembic },
      { name: 'Hexagon', component: Icon.Hexagon },
      { name: 'Hourglass', component: Icon.Hourglass },
      { name: 'SquareInSquare', component: Icon.SquareInSquare },
      { name: 'DharmaWheel', component: Icon.DharmaWheel },
      { name: 'Watch', component: Icon.Watch },
      { name: 'Pencil', component: Icon.Pencil },
      { name: 'Infinity', component: Icon.Infinity },
    ],
  },
  {
    label: 'Status / control',
    entries: [
      { name: 'Warning', component: Icon.Warning },
      { name: 'NoEntry', component: Icon.NoEntry },
      { name: 'Check', component: Icon.Check },
      { name: 'MultiplicationX', component: Icon.MultiplicationX },
      { name: 'BallotX', component: Icon.BallotX },
      { name: 'Circle', component: Icon.Circle },
      { name: 'Fisheye', component: Icon.Fisheye },
      { name: 'CircledBullet', component: Icon.CircledBullet },
      { name: 'TriangleRight', component: Icon.TriangleRight },
    ],
  },
  {
    label: 'Arrows',
    entries: [
      { name: 'ArrowLeft', component: Icon.ArrowLeft },
      { name: 'ArrowRight', component: Icon.ArrowRight },
      { name: 'ArrowUp', component: Icon.ArrowUp },
    ],
  },
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
        <p className="text-earth-400 text-xs font-system mb-4 leading-relaxed">
          Named icon components. Icons are named after the glyph itself, not
          the role it plays — a "Body" tile picks <code>Icon.Ankh</code> or
          <code>Icon.Shamrock</code>; the library doesn't decide. Today most
          icons render unicode glyphs at a controlled size; <code>Icon.Lotus</code>
          renders inline SVG. Both inherit color from the parent text color.
          Canonical sizes: 16 / 20 / 24.
        </p>
        <div className="flex flex-col gap-6">
          {iconGroups.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
                {group.label}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {group.entries.map(({ name, component: IconComponent }) => (
                  <div
                    key={name}
                    className="card flex flex-col items-center gap-3 py-5 text-earth-300"
                  >
                    <IconComponent size={48} />
                    <code className="text-[10px] uppercase tracking-[0.18em] text-earth-500 text-center break-all">
                      Icon.{name}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-earth-500 mb-2">
              Accessibility
            </div>
            <p className="text-earth-400 text-xs font-system mb-3 leading-relaxed">
              Decorative by default — the wrapper is <code>aria-hidden</code>,
              so screen readers skip it. When an icon stands alone (no
              adjacent text label), pass <code>label</code>: the wrapper
              becomes <code>role="img"</code> with that name, and unicode
              glyph names like "white heart suit" no longer leak through.
              Don't pass <code>label</code> when the icon sits next to a
              visible text label that already names it.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="card flex flex-col items-center gap-3 py-5 text-earth-300">
                <Icon.Heart size={48} />
                <code className="text-[10px] uppercase tracking-[0.18em] text-earth-500 text-center break-all">
                  &lt;Icon.Heart /&gt;
                </code>
                <span className="text-[10px] text-earth-500 text-center">
                  decorative — SR skips it
                </span>
              </div>
              <div className="card flex flex-col items-center gap-3 py-5 text-earth-300">
                <Icon.Heart size={48} label="Heart" />
                <code className="text-[10px] uppercase tracking-[0.18em] text-earth-500 text-center break-all">
                  &lt;Icon.Heart label="Heart" /&gt;
                </code>
                <span className="text-[10px] text-earth-500 text-center">
                  meaningful — SR announces "Heart, image"
                </span>
              </div>
            </div>
          </div>
        </div>
      </Subsection>
    </Section>
  )
}
