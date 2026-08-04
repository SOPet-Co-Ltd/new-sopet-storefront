/**
 * Format order-line snapshot variantOptions for display (AC-014).
 * Omit when null/empty/`{}` or unparseable; never throw.
 */
export function formatOrderVariantOptions(
  variantOptions: string | Record<string, string> | null | undefined,
): string | null {
  if (variantOptions == null || variantOptions === '') {
    return null;
  }

  let options: Record<string, string>;

  if (typeof variantOptions === 'string') {
    if (variantOptions === '{}') {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(variantOptions);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return null;
      }
      options = parsed as Record<string, string>;
    } catch {
      return null;
    }
  } else {
    options = variantOptions;
  }

  const entries = Object.entries(options);
  if (entries.length === 0) {
    return null;
  }

  return entries
    .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0))
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ');
}
