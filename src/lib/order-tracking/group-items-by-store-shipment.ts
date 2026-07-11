export type ShipmentTrackingItem = {
  storeId: string;
  fulfillmentProvider?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  fulfillmentStatus?: string | null;
};

export type StoreShipmentData = {
  fulfillmentProvider?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  fulfillmentStatus?: string | null;
};

/**
 * Groups line items into per-store shipment entries.
 * First item per `storeId` that has tracking data wins; later items for the same store are ignored.
 */
export function groupItemsByStoreShipment(
  items: ShipmentTrackingItem[],
): Map<string, StoreShipmentData> {
  return items.reduce<Map<string, StoreShipmentData>>((map, item) => {
    if (!item.trackingNumber && !item.fulfillmentProvider && !item.trackingUrl) {
      return map;
    }

    if (!map.has(item.storeId)) {
      map.set(item.storeId, {
        fulfillmentProvider: item.fulfillmentProvider,
        trackingNumber: item.trackingNumber,
        trackingUrl: item.trackingUrl,
        fulfillmentStatus: item.fulfillmentStatus,
      });
    }

    return map;
  }, new Map());
}
