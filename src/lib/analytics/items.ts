import type { AnalyticsItem } from './events';

type CartLineLike = {
  quantity: number;
  variantId: string;
  productVariant?: {
    price?: number | null;
    optionsJson?: string | null;
    product?: {
      id?: string | null;
      name?: string | null;
      store?: { name?: string | null } | null;
    } | null;
  } | null;
};

type OrderLineLike = {
  productId?: string | null;
  variantId?: string | null;
  productName?: string | null;
  unitPrice?: number | null;
  quantity?: number | null;
};

/** Maps a cart line into a GA4 ecommerce item. */
export function cartLineToAnalyticsItem(line: CartLineLike): AnalyticsItem {
  const product = line.productVariant?.product;
  return {
    item_id: product?.id ?? line.variantId,
    item_name: product?.name ?? line.variantId,
    item_brand: product?.store?.name ?? undefined,
    item_variant: line.variantId,
    price: line.productVariant?.price ?? undefined,
    quantity: line.quantity,
  };
}

/** Maps an order confirmation line into a GA4 ecommerce item. */
export function orderLineToAnalyticsItem(line: OrderLineLike): AnalyticsItem {
  return {
    item_id: line.productId ?? line.variantId ?? 'unknown',
    item_name: line.productName ?? line.productId ?? 'unknown',
    item_variant: line.variantId ?? undefined,
    price: line.unitPrice ?? undefined,
    quantity: line.quantity ?? undefined,
  };
}

export function sumItemValue(items: AnalyticsItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
}
