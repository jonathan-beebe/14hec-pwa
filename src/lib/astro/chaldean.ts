export const CHALDEAN_ORDER = [
  'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon',
] as const

export const DAY_RULERS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
] as const

export function getDayRuler(date: Date): string {
  return DAY_RULERS[date.getUTCDay()]
}

export function getPlanetForHour(hourIndex: number, dayOfWeek: number): string {
  const dayRuler = DAY_RULERS[dayOfWeek]
  const startIdx = CHALDEAN_ORDER.indexOf(dayRuler)
  return CHALDEAN_ORDER[(startIdx + hourIndex) % 7]
}
