import { describe, expect, it } from 'vitest';
import {
  buildOptionGroups,
  getDefaultSelectedOptions,
  getDefaultVariant,
  resolveSelectedOptionsFromSearchParams,
  type ProductVariant,
} from './variantUtils';

function variant(
  overrides: Partial<ProductVariant> & Pick<ProductVariant, 'id' | 'price' | 'optionsJson'>,
): ProductVariant {
  return {
    sku: overrides.sku ?? overrides.id,
    stockQuantity: overrides.stockQuantity ?? 10,
    ...overrides,
  };
}

describe('buildOptionGroups', () => {
  it('returns option values in stable sorted order regardless of variant order', () => {
    const variantsA = [
      variant({ id: 'v1', price: 100, optionsJson: '{"test":"test2"}' }),
      variant({ id: 'v2', price: 80, optionsJson: '{"test":"Test"}' }),
      variant({ id: 'v3', price: 90, optionsJson: '{"test":"test"}' }),
    ];
    const variantsB = [...variantsA].reverse();

    expect(buildOptionGroups(variantsA).test).toEqual(buildOptionGroups(variantsB).test);
    // Stable th-locale order (numeric + case/variant sensitive)
    expect(buildOptionGroups(variantsA).test).toEqual(['test', 'Test', 'test2']);
  });

  it('sorts option keys stably', () => {
    const variants = [
      variant({ id: 'v1', price: 100, optionsJson: '{"size":"M","color":"Red"}' }),
      variant({ id: 'v2', price: 100, optionsJson: '{"size":"L","color":"Blue"}' }),
    ];

    expect(Object.keys(buildOptionGroups(variants))).toEqual(['color', 'size']);
  });
});

describe('getDefaultVariant / getDefaultSelectedOptions', () => {
  it('selects the cheapest in-stock variant', () => {
    const variants = [
      variant({ id: 'expensive', price: 200, optionsJson: '{"test":"test2"}', stockQuantity: 5 }),
      variant({ id: 'cheap', price: 80, optionsJson: '{"test":"Test"}', stockQuantity: 3 }),
      variant({ id: 'mid', price: 120, optionsJson: '{"test":"test"}', stockQuantity: 2 }),
    ];

    expect(getDefaultVariant(variants)?.id).toBe('cheap');
    expect(getDefaultSelectedOptions(variants)).toEqual({ test: 'Test' });
  });

  it('on equal price, picks the first by stable id order', () => {
    const variants = [
      variant({ id: 'z-id', price: 100, optionsJson: '{"test":"test2"}' }),
      variant({ id: 'a-id', price: 100, optionsJson: '{"test":"Test"}' }),
      variant({ id: 'm-id', price: 100, optionsJson: '{"test":"test"}' }),
    ];

    expect(getDefaultVariant(variants)?.id).toBe('a-id');
    expect(getDefaultSelectedOptions(variants)).toEqual({ test: 'Test' });
  });

  it('skips out-of-stock cheaper variants when an in-stock option exists', () => {
    const variants = [
      variant({ id: 'oos-cheap', price: 50, optionsJson: '{"test":"test2"}', stockQuantity: 0 }),
      variant({ id: 'in-stock', price: 100, optionsJson: '{"test":"Test"}', stockQuantity: 4 }),
    ];

    expect(getDefaultVariant(variants)?.id).toBe('in-stock');
  });

  it('falls back to cheapest overall when every variant is out of stock', () => {
    const variants = [
      variant({ id: 'expensive', price: 200, optionsJson: '{"test":"test2"}', stockQuantity: 0 }),
      variant({ id: 'cheap', price: 80, optionsJson: '{"test":"Test"}', stockQuantity: 0 }),
    ];

    expect(getDefaultVariant(variants)?.id).toBe('cheap');
  });

  it('returns null / empty options when there are no variants', () => {
    expect(getDefaultVariant([])).toBeNull();
    expect(getDefaultSelectedOptions([])).toEqual({});
    expect(getDefaultSelectedOptions(null)).toEqual({});
  });
});

describe('resolveSelectedOptionsFromSearchParams', () => {
  const variants = [
    variant({ id: 'v-test2', price: 200, optionsJson: '{"test":"test2"}' }),
    variant({ id: 'v-Test', price: 80, optionsJson: '{"test":"Test"}' }),
    variant({ id: 'v-test', price: 120, optionsJson: '{"test":"test"}' }),
  ];

  it('selects the variant matching shared query params', () => {
    const params = new URLSearchParams('test=test');
    expect(resolveSelectedOptionsFromSearchParams(variants, params)).toEqual({ test: 'test' });
  });

  it('falls back to cheapest default when query has no option keys', () => {
    const params = new URLSearchParams('utm_source=share');
    expect(resolveSelectedOptionsFromSearchParams(variants, params)).toEqual({ test: 'Test' });
  });

  it('ignores invalid option values and falls back to default', () => {
    const params = new URLSearchParams('test=unknown');
    expect(resolveSelectedOptionsFromSearchParams(variants, params)).toEqual({ test: 'Test' });
  });

  it('fills remaining options from the cheapest matching variant', () => {
    const multi = [
      variant({
        id: 'red-m',
        price: 150,
        optionsJson: '{"color":"Red","size":"M"}',
      }),
      variant({
        id: 'blue-l',
        price: 100,
        optionsJson: '{"color":"Blue","size":"L"}',
      }),
      variant({
        id: 'blue-m',
        price: 120,
        optionsJson: '{"color":"Blue","size":"M"}',
      }),
    ];

    expect(
      resolveSelectedOptionsFromSearchParams(multi, new URLSearchParams('color=Blue')),
    ).toEqual({ color: 'Blue', size: 'L' });
  });
});
