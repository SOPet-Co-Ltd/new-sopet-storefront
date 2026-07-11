import { describe, expect, it } from 'vitest';
import { PRODUCT_CARD_GRID_CLASS } from './productListingGrid';

describe('PRODUCT_CARD_GRID_CLASS', () => {
  it('uses auto-fill minmax columns so cards wrap instead of overlapping', () => {
    expect(PRODUCT_CARD_GRID_CLASS).toContain('auto-fill');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('minmax(168px,1fr)');
    expect(PRODUCT_CARD_GRID_CLASS).toContain('minmax(224px,1fr)');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('grid-cols-2');
    expect(PRODUCT_CARD_GRID_CLASS).not.toContain('xl:grid-cols-5');
  });
});
