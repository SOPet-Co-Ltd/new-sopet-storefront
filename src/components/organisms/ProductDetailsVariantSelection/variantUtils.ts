import type { ProductDetail } from '@/lib/hooks/useProduct';

export type ProductVariant = NonNullable<ProductDetail['variants']>[number];

export type VariantOptions = Record<string, string>;

const LOCALE = 'th';

function compareStrings(a: string, b: string): number {
  // Use accent/case-sensitive compare so values like "Test" vs "test" stay deterministic.
  return a.localeCompare(b, LOCALE, { numeric: true, sensitivity: 'variant' });
}

export function parseVariantOptions(optionsJson: string | null): VariantOptions {
  if (!optionsJson) return {};

  try {
    const parsed: unknown = JSON.parse(optionsJson);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: VariantOptions = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Build option groups with stable key/value order so chips do not shuffle
 * when the API returns variants in a different order between requests.
 */
export function buildOptionGroups(
  variants: ProductVariant[] | null | undefined,
): Record<string, string[]> {
  const groups: Record<string, Set<string>> = {};

  for (const variant of variants ?? []) {
    const options = parseVariantOptions(variant.optionsJson);
    for (const [key, value] of Object.entries(options)) {
      if (!groups[key]) {
        groups[key] = new Set();
      }
      groups[key].add(value);
    }
  }

  const sortedKeys = Object.keys(groups).sort(compareStrings);

  return Object.fromEntries(sortedKeys.map((key) => [key, [...groups[key]].sort(compareStrings)]));
}

export function findVariantByOptions(
  variants: ProductVariant[] | null | undefined,
  selectedOptions: VariantOptions,
): ProductVariant | null {
  const entries = Object.entries(selectedOptions);
  if (entries.length === 0) {
    return getDefaultVariant(variants);
  }

  return (
    variants?.find((variant) => {
      const options = parseVariantOptions(variant.optionsJson);
      return entries.every(([key, value]) => options[key] === value);
    }) ?? null
  );
}

/**
 * Prefer the cheapest in-stock variant. On a price tie, pick the first by
 * stable id order. If every variant is out of stock, fall back to cheapest overall.
 */
export function getDefaultVariant(
  variants: ProductVariant[] | null | undefined,
): ProductVariant | null {
  if (!variants?.length) return null;

  const byPriceThenId = (a: ProductVariant, b: ProductVariant) =>
    a.price - b.price || compareStrings(a.id, b.id);

  const inStock = variants.filter((variant) => variant.stockQuantity > 0);
  const pool = inStock.length > 0 ? inStock : variants;

  return [...pool].sort(byPriceThenId)[0] ?? null;
}

export function getDefaultSelectedOptions(
  variants: ProductVariant[] | null | undefined,
): VariantOptions {
  const defaultVariant = getDefaultVariant(variants);
  if (!defaultVariant) return {};
  return parseVariantOptions(defaultVariant.optionsJson);
}

/**
 * Resolve selection from shared PDP query params (e.g. `?test=test`).
 * Valid option keys/values from the URL win; remaining dimensions come from the
 * cheapest matching in-stock variant. Invalid or unknown params fall back to default.
 */
export function resolveSelectedOptionsFromSearchParams(
  variants: ProductVariant[] | null | undefined,
  searchParams: Pick<URLSearchParams, 'get'> | null | undefined,
): VariantOptions {
  const defaults = getDefaultSelectedOptions(variants);
  if (!searchParams || !variants?.length) return defaults;

  const groups = buildOptionGroups(variants);
  const urlOptions: VariantOptions = {};

  for (const [key, values] of Object.entries(groups)) {
    const raw = searchParams.get(key);
    if (raw != null && values.includes(raw)) {
      urlOptions[key] = raw;
    }
  }

  if (Object.keys(urlOptions).length === 0) return defaults;

  const matching = variants.filter((variant) => {
    const options = parseVariantOptions(variant.optionsJson);
    return Object.entries(urlOptions).every(([key, value]) => options[key] === value);
  });

  if (matching.length === 0) return defaults;

  const best = getDefaultVariant(matching);
  return best ? parseVariantOptions(best.optionsJson) : defaults;
}

export function formatOptionLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}
