import { describe, expect, it } from 'vitest';
import {
  computeSaleUnitPrice,
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

describe('computeSaleUnitPrice', () => {
  it('applies 20% off catalog 279 → 223.20', () => {
    expect(computeSaleUnitPrice(279, 20)).toBe(223.2);
  });

  it('does not invent a higher compare-at (348.75 from 279 / 0.8)', () => {
    expect(computeSaleUnitPrice(279, 20)).not.toBe(348.75);
    expect(279 / (1 - 20 / 100)).toBeCloseTo(348.75, 2);
  });

  it('returns null when percent is missing or out of range', () => {
    expect(computeSaleUnitPrice(279, null)).toBeNull();
    expect(computeSaleUnitPrice(279, 100)).toBeNull();
    expect(computeSaleUnitPrice(0, 20)).toBeNull();
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
  it('uses honest campaign compare-at when greater than catalog', () => {
    const campaign = campaignItem({ compareAtPrice: 349, discountPercent: 20 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 279,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(349);
  });

  it('uses catalog as was when % sale applies without compare-at (never 348.75)', () => {
    const campaign = campaignItem({ compareAtPrice: null, discountPercent: 20 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 279,
        campaignItem: campaign,
        variantCompareAt: 200,
        productCompareAt: 300,
      }),
    ).toBe(279);
  });

  it('ignores compare-at that is not greater than catalog and falls back to catalog when % applies', () => {
    const campaign = campaignItem({ compareAtPrice: 200, discountPercent: 20 });
    expect(
      resolveCompareAtPrice({
        sellPrice: 279,
        campaignItem: campaign,
      }),
    ).toBe(279);
  });

  it('falls back to variant compareAtPrice when campaign has no usable %', () => {
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
});
