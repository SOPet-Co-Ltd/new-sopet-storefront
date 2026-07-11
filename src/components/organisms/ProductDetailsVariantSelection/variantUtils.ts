import type { ProductDetail } from '@/lib/hooks/useProduct';

export type ProductVariant = NonNullable<ProductDetail['variants']>[number];

export type VariantOptions = Record<string, string>;

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

  return Object.fromEntries(Object.entries(groups).map(([key, values]) => [key, [...values]]));
}

export function findVariantByOptions(
  variants: ProductVariant[] | null | undefined,
  selectedOptions: VariantOptions,
): ProductVariant | null {
  const entries = Object.entries(selectedOptions);
  if (entries.length === 0) {
    return variants?.[0] ?? null;
  }

  return (
    variants?.find((variant) => {
      const options = parseVariantOptions(variant.optionsJson);
      return entries.every(([key, value]) => options[key] === value);
    }) ?? null
  );
}

export function getDefaultSelectedOptions(
  variants: ProductVariant[] | null | undefined,
): VariantOptions {
  const firstVariant = variants?.[0];
  if (!firstVariant) return {};
  return parseVariantOptions(firstVariant.optionsJson);
}

export function formatOptionLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}
