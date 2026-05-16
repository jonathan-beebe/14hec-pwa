export interface FormatCatalogStatusOptions {
  /**
   * Singular form of the thing being catalogued (e.g. `'plant'`,
   * `'ailment'`). Naive English pluralization adds an `s` — pass a
   * pre-pluralized `nounPlural` when that does not work.
   */
  noun: string
  /** Override the naive pluralization (e.g. `'body systems'`). */
  nounPlural?: string
}

/**
 * Shared phrasing for the `role="status"` region above a Catalog's
 * results. Three shapes:
 *
 *   - no filters active: `"12 plants"`
 *   - filters active, empty: `"No plants match your filters"`
 *   - filters active, some matches: `"3 of 207 plants match your filters"`
 *
 * Total is pluralized; singular falls back when `total === 1` (and the
 * no-filter case never mixes a count of 1 with the plural noun).
 *
 * Lifted out of CatalogDemo so every catalog announces in the same
 * voice — and so future i18n is a one-file change.
 */
export function formatCatalogStatus(
  count: number,
  total: number,
  hasActiveFilters: boolean,
  options: FormatCatalogStatusOptions,
): string {
  const { noun, nounPlural = `${noun}s` } = options

  if (!hasActiveFilters) {
    return `${count} ${count === 1 ? noun : nounPlural}`
  }

  if (count === 0) {
    return `No ${nounPlural} match your filters`
  }

  return `${count} of ${total} ${total === 1 ? noun : nounPlural} match your filters`
}
