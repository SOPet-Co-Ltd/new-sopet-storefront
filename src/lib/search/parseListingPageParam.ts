/**
 * Parse a listing `page` query value.
 * Non-integers, empty, 0, and negatives fall back to page 1.
 */
export function parseListingPageParam(page: string | null | undefined): number {
  if (page == null || page === '') {
    return 1;
  }

  if (!/^\d+$/.test(page)) {
    return 1;
  }

  const parsed = Number(page);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}
