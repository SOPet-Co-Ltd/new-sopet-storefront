import { describe, expect, it } from 'vitest';
import {
  computeCompareAtFromDiscountPercent,
  pickCampaignItem,
  resolveCompareAtPrice,
  type ActiveSaleCampaignItem,
} from './resolve-compare-at-price';

function campaignItem(overrides: Partial<ActiveSaleCampaignItem>): ActiveSaleCampaignItem {
  return {
    campaignId: 'campaign-1',
    productId: 'product-1',
    variantId: null,
    compareAtPrice: null,
    discountPercent: null,
    priority: 0,
    expiresAt: null,
    ...overrides,
  };
}

describe('computeCompareAtFromDiscountPercent', () => {
  it('computes compare-at from a discount percent, rounded to 2 decimals', () => {
    expect(computeCompareAtFromDiscountPercent(90, 10)).toBe(100);
    expect(computeCompareAtFromDiscountPercent(100, 25)).toBeCloseTo(133.33, 2);
  });

  it('returns null when percent is missing', () => {
    expect(computeCompareAtFromDiscountPercent(100, null)).toBeNull();
    expect(computeCompareAtFromDiscountPercent(100, undefined)).toBeNull();
  });

  it('returns null when percent is 100 or more (division by zero or negative)', () => {
    expect(computeCompareAtFromDiscountPercent(100, 100)).toBeNull();
    expect(computeCompareAtFromDiscountPercent(100, 150)).toBeNull();
  });

  it('returns null when sellPrice is zero or negative', () => {
    expect(computeCompareAtFromDiscountPercent(0, 10)).toBeNull();
    expect(computeCompareAtFromDiscountPercent(-5, 10)).toBeNull();
  });
});

describe('pickCampaignItem', () => {
  it('returns null when items is empty or missing', () => {
    expect(pickCampaignItem([], 'product-1')).toBeNull();
    expect(pickCampaignItem(null, 'product-1')).toBeNull();
    expect(pickCampaignItem(undefined, 'product-1')).toBeNull();
  });

  it('returns null when no item matches the productId', () => {
    const items = [campaignItem({ productId: 'other-product' })];
    expect(pickCampaignItem(items, 'product-1')).toBeNull();
  });

  it('prefers an item matching productId + variantId over an all-variants item', () => {
    const allVariants = campaignItem({ variantId: null, priority: 5 });
    const exactVariant = campaignItem({ variantId: 'variant-1', priority: 1 });
    const items = [allVariants, exactVariant];

    expect(pickCampaignItem(items, 'product-1', 'variant-1')).toBe(exactVariant);
  });

  it('falls back to an all-variants item when no exact variant match exists', () => {
    const allVariants = campaignItem({ variantId: null });
    const otherVariant = campaignItem({ variantId: 'variant-2' });
    const items = [otherVariant, allVariants];

    expect(pickCampaignItem(items, 'product-1', 'variant-1')).toBe(allVariants);
  });

  it('returns null when only a different variant matches and no all-variants item exists', () => {
    const items = [campaignItem({ variantId: 'variant-2' })];
    expect(pickCampaignItem(items, 'product-1', 'variant-1')).toBeNull();
  });

  it('picks the first matching item assuming items are already ordered DESC by priority', () => {
    const higherPriority = campaignItem({ variantId: 'variant-1', priority: 10 });
    const lowerPriority = campaignItem({ variantId: 'variant-1', priority: 1 });
    const items = [higherPriority, lowerPriority];

    expect(pickCampaignItem(items, 'product-1', 'variant-1')).toBe(higherPriority);
  });

  it('matches an all-variants item when no variantId is provided', () => {
    const allVariants = campaignItem({ variantId: null });
    expect(pickCampaignItem([allVariants], 'product-1')).toBe(allVariants);
  });
});

describe('resolveCompareAtPrice', () => {
  it('uses campaignItem.compareAtPrice first when present', () => {
    const campaign = campaignItem({ compareAtPrice: 150, discountPercent: 50 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 100,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(150);
  });

  it('computes from campaignItem.discountPercent when compareAtPrice is absent', () => {
    const campaign = campaignItem({ compareAtPrice: null, discountPercent: 10 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(100);
  });

  it('falls back to variant compareAtPrice when campaign item has no usable discount', () => {
    const campaign = campaignItem({ compareAtPrice: null, discountPercent: null });
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(200);
  });

  it('falls back to variant compareAtPrice when there is no campaign item', () => {
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: null,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(200);
  });

  it('falls back to product compareAtPrice when there is no campaign item or variant compareAt', () => {
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: null,
        variantCompareAt: null,
        productCompareAt: 300,
      }),
    ).toBe(300);
  });

  it('returns null when nothing resolves', () => {
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: null,
        variantCompareAt: null,
        productCompareAt: null,
      }),
    ).toBeNull();
  });

  it('does not fall through to discount-percent-with-100 case (returns null then falls back)', () => {
    const campaign = campaignItem({ compareAtPrice: null, discountPercent: 100 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 90,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(200);
  });
});
