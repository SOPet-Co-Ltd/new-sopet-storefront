import { describe, expect, it } from 'vitest';
import { groupItemsByStoreShipment } from './group-items-by-store-shipment';

describe('groupItemsByStoreShipment', () => {
  // AC-018: Shipment grouping skips items without tracking metadata.
  // Behavior: Items lacking provider, number, and URL → empty map.
  // @category: unit
  // @lane: unit
  it('returns empty map when no items have tracking data', () => {
    const result = groupItemsByStoreShipment([
      { storeId: 'store-1', fulfillmentStatus: 'pending' },
      { storeId: 'store-2' },
    ]);

    expect(result.size).toBe(0);
  });

  // AC-018: Per-store shipment grouping uses first tracking item per storeId.
  // Behavior: Multiple items per store → first item with tracking data wins.
  // @category: unit
  // @lane: unit
  it('groups items by storeId using first item with tracking data per store', () => {
    const result = groupItemsByStoreShipment([
      {
        storeId: 'store-a',
        trackingNumber: 'FIRST-A',
        fulfillmentProvider: 'kerry',
        trackingUrl: 'https://track.example.com/first-a',
        fulfillmentStatus: 'shipped',
      },
      {
        storeId: 'store-a',
        trackingNumber: 'SECOND-A',
        fulfillmentProvider: 'flash',
        trackingUrl: 'https://track.example.com/second-a',
        fulfillmentStatus: 'delivered',
      },
      {
        storeId: 'store-b',
        trackingNumber: 'B-001',
        fulfillmentProvider: 'j&t',
      },
    ]);

    expect(result.size).toBe(2);
    expect(result.get('store-a')).toEqual({
      fulfillmentProvider: 'kerry',
      trackingNumber: 'FIRST-A',
      trackingUrl: 'https://track.example.com/first-a',
      fulfillmentStatus: 'shipped',
    });
    expect(result.get('store-b')).toEqual({
      fulfillmentProvider: 'j&t',
      trackingNumber: 'B-001',
      trackingUrl: undefined,
      fulfillmentStatus: undefined,
    });
  });

  // AC-018: Provider-only or URL-only items still produce store shipment entries.
  // Behavior: Single provider or tracking URL → map entry with stored field values.
  // @category: unit
  // @lane: unit
  it('includes stores when only provider or tracking URL is present', () => {
    const byProvider = groupItemsByStoreShipment([
      { storeId: 'store-1', fulfillmentProvider: 'kerry' },
    ]);
    const byUrl = groupItemsByStoreShipment([
      { storeId: 'store-2', trackingUrl: 'https://track.example.com/pkg' },
    ]);

    expect(byProvider.size).toBe(1);
    expect(byProvider.get('store-1')).toEqual({
      fulfillmentProvider: 'kerry',
      trackingNumber: undefined,
      trackingUrl: undefined,
      fulfillmentStatus: undefined,
    });
    expect(byUrl.size).toBe(1);
    expect(byUrl.get('store-2')).toEqual({
      fulfillmentProvider: undefined,
      trackingNumber: undefined,
      trackingUrl: 'https://track.example.com/pkg',
      fulfillmentStatus: undefined,
    });
  });
});
