# astro — Astronomical Calculations for 14 HEC

Pure functional library for planetary timing calculations. Computes real
sunrise/sunset times and traditional planetary hours based on geographic
coordinates and date.

## Design Principles

### Functional core, imperative shell

Every calculation in this library is a **pure function**. No function calls
`new Date()`, reads `navigator.geolocation`, or touches `localStorage`. Time
and location are always passed as arguments. This makes the library trivially
testable and completely decoupled from the browser environment.

The component that consumes this library is the imperative shell — it owns the
clock tick, the geolocation request, and the React state. This library owns
the math.

### One dependency

The library uses `astronomy-engine` (MIT, ~24 KB gzipped after tree-shaking)
for sunrise/sunset via the same algorithms used by professional planetarium
software. It also provides planetary positions, moon phase, and ecliptic
coordinates for future features — all from a single dependency with built-in
TypeScript types.

### Three layers, each independently testable

```
chaldean.ts          Pure constants and index arithmetic. No dependencies.
                     Exports the Chaldean order, day rulers, and the function
                     that maps (hourIndex, dayOfWeek) → planet name.

sun-times.ts         Wraps astronomy-engine to compute sunrise and sunset
                     for a given date and location. Handles polar edge cases
                     (midnight sun, polar night) explicitly via a discriminated
                     union return type.

planetary-hours.ts   Computes 24 temporal (unequal) planetary hours from
                     sunrise, sunset, and next sunrise. Pure arithmetic —
                     receives Date objects, returns PlanetaryHour objects.
```

`index.ts` re-exports everything and provides `getPlanetaryTiming()`, the
single integration point that composes all three layers.

### Temporal hours, not clock hours

Traditional planetary hours divide the actual daylight period into 12 equal
parts and the actual night into 12 equal parts. A summer day hour at 40°N
latitude is roughly 75 minutes; a winter day hour at 64°N might be 20 minutes.
This library computes those real durations from real sunrise/sunset data.

### Polar graceful degradation

At extreme latitudes during polar day or polar night, sunrise/sunset don't
exist. `getSunTimes()` returns a discriminated union:

```typescript
type SunTimesResult =
  | { kind: 'normal'; sunrise: Date; sunset: Date }
  | { kind: 'polar'; condition: 'polar-day' | 'polar-night' }
```

`getPlanetaryTiming()` returns `null` for polar conditions. The UI layer
decides how to handle that (fallback message, equal-hours mode, etc.).

### UTC throughout

All calculations operate in UTC. The library never applies timezone offsets.
Display-layer formatting (via `toLocaleTimeString()` or `Intl.DateTimeFormat`)
handles local time conversion, including DST, automatically.

## Public API

```typescript
// The integration point — everything the component needs in one call
getPlanetaryTiming(now: Date, latitude: number, longitude: number)
  → PlanetaryTiming | null

// Individual layers for fine-grained use
getDayRuler(date: Date) → string
getSunTimes(date: Date, lat: number, lon: number) → SunTimesResult
getNextSunrise(date: Date, lat: number, lon: number) → Date | null
computePlanetaryHours(sunrise: Date, sunset: Date, nextSunrise: Date, dayOfWeek: number)
  → PlanetaryHour[]
findCurrentHour(now: Date, hours: PlanetaryHour[]) → PlanetaryHour | null
```

## Types

```typescript
interface PlanetaryTiming {
  dayRuler: string
  sunTimes: SunTimes
  hours: PlanetaryHour[]
  currentHour: PlanetaryHour | null
}

interface PlanetaryHour {
  planet: string
  hourNumber: number        // 1-12
  isDay: boolean
  startTime: Date
  endTime: Date
  durationMinutes: number
}

interface SunTimes {
  sunrise: Date
  sunset: Date
}
```

## Testing

50 tests across 4 files. Run with:

```bash
npx vitest run src/lib/astro/
```

Test strategy:
- **chaldean.test.ts** — Verifies constants, day ruler mapping, Chaldean
  sequence continuity, and the critical invariant that 24 hours of sequence
  always land on the next day's ruler.
- **sun-times.test.ts** — Validates sunrise/sunset against reference data
  for NYC, London, Reykjavik, Sydney, and the equator. Tests polar day/night
  detection for Tromsø. Verifies the sunrise-before-sunset invariant.
- **planetary-hours.test.ts** — Tests temporal hour computation: contiguity,
  24-hour coverage, day/night partitioning, unequal durations at solstices,
  Chaldean sequence across the day-night boundary.
- **index.test.ts** — Integration tests composing all layers through
  `getPlanetaryTiming()`.

Reference data sourced from NOAA Solar Calculator and cross-checked against
timeanddate.com. Tolerance: ±2 minutes for sunrise/sunset, ±5 minutes for
day length.

## Future extensions

The `astronomy-engine` dependency also provides:
- `EclipticLongitude(body, date)` — planetary zodiac positions
- `SunPosition(date).elon` — Sun's ecliptic longitude
- `MoonPhase(date)` — lunar phase angle
- `SearchRiseSet()` for moon rise/set
- `Seasons(year)` — equinox and solstice dates

These can be added as new modules in this library without changing the
existing API or introducing new dependencies.
