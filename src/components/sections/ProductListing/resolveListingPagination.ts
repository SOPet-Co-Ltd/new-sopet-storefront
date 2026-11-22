/** Prefer SSR pagination totals until the client products query returns pagination. */
export function resolveListingTotal(options: {
  hasPagination: boolean;
  useInitialProducts: boolean;
  fetchedTotal: number;
  initialTotal?: number;
}): number {
  if (options.hasPagination || !options.useInitialProducts || options.initialTotal === undefined) {
    return options.fetchedTotal;
  }
  return options.initialTotal;
}

export function resolveListingTotalPages(options: {
  hasPagination: boolean;
  useInitialProducts: boolean;
  fetchedTotalPages: number;
  initialTotalPages?: number;
}): number {
  if (
    options.hasPagination ||
    !options.useInitialProducts ||
    options.initialTotalPages === undefined
  ) {
    return options.fetchedTotalPages;
  }
  return options.initialTotalPages;
}
