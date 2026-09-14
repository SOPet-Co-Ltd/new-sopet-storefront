import { describe, expect, it } from 'vitest';
import { PRODUCT_CARD_GRID_CLASS } from './productListingGrid';

describe('PRODUCT_CARD_GRID_CLASS', () => {
  it('uses 2 columns on mobile and auto-fill from md so cards stretch evenly', () => {
    expect(PRODUCT_CARD_GRID_CLASS).toContain('grid-cols-2');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('justify-items-stretch');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('md:grid-cols-[repeat(auto-fill,minmax(196px,1fr))]');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('gap-2');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('md:gap-5');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('justify-items-center');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('minmax(168px,1fr)');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('minmax(224px,1fr)');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('lg:gap-6');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('xl:gap-10');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('xl:grid-cols-5');
  });
});
