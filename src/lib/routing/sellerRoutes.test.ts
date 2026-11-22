import { describe, expect, it } from 'vitest';
import { buildSellerHref, buildSellerReviewsHref } from '@/lib/routing/sellerRoutes';

describe('buildSellerHref', () => {
  it('keeps an ASCII slug readable', () => {
    expect(buildSellerHref('sopet-pet-shop')).toBe('/sellers/sopet-pet-shop');
  });

  it('encodes a Thai slug so the storefront route can load it', () => {
    expect(buildSellerHref('ร้านไทย')).toBe(`/sellers/${encodeURIComponent('ร้านไทย')}`);
  });

  it('does not encode a slug that is already percent-encoded', () => {
    const encoded = encodeURIComponent('ร้านไทย');
    expect(buildSellerHref(encoded)).toBe(`/sellers/${encoded}`);
    expect(buildSellerReviewsHref(encoded)).toBe(`/sellers/${encoded}/reviews`);
  });
});
