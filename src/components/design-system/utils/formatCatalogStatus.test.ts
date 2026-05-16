import { formatCatalogStatus } from './formatCatalogStatus'

describe('formatCatalogStatus — shared phrasing for catalog status regions', () => {
  it('reports the total with the plural noun when no filters are active', () => {
    expect(formatCatalogStatus(12, 12, false, { noun: 'plant' })).toBe('12 plants')
  })

  it('uses the singular noun when the unfiltered total is 1', () => {
    expect(formatCatalogStatus(1, 1, false, { noun: 'plant' })).toBe('1 plant')
  })

  it('uses 0 with the plural noun when the unfiltered total is 0', () => {
    expect(formatCatalogStatus(0, 0, false, { noun: 'plant' })).toBe('0 plants')
  })

  it('announces the empty state when filters are active and nothing matches', () => {
    expect(formatCatalogStatus(0, 75, true, { noun: 'ailment' })).toBe(
      'No ailments match your filters',
    )
  })

  it('announces a count-of-total when filters narrow the results', () => {
    expect(formatCatalogStatus(3, 75, true, { noun: 'ailment' })).toBe(
      '3 of 75 ailments match your filters',
    )
  })

  it('respects an explicit plural override (e.g. body systems)', () => {
    expect(
      formatCatalogStatus(5, 25, true, { noun: 'body system', nounPlural: 'body systems' }),
    ).toBe('5 of 25 body systems match your filters')

    expect(
      formatCatalogStatus(25, 25, false, { noun: 'body system', nounPlural: 'body systems' }),
    ).toBe('25 body systems')
  })
})
