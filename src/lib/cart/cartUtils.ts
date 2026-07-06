import type { CartQuery } from '@/lib/graphql/generated/graphql';

export type CartItem = CartQuery['cart']['items'][number];

export type StoreCartGroup = {
  storeId: string;
  storeName: string;
  storeSlug: string | null;
  items: CartItem[];
  subtotal: number;
};

export function getCartItemStoreId(item: CartItem): string {
  return item.productVariant?.product?.storeId ?? 'unknown-store';
}

export function getCartItemUnitPrice(item: CartItem): number {
  return item.productVariant?.price ?? 0;
}

export function computeCartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.quantity * getCartItemUnitPrice(item),
    0,
  );
}

export function computeCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function groupCartItemsByStore(items: CartItem[]): StoreCartGroup[] {
  const groups = new Map<string, StoreCartGroup>();

  for (const item of items) {
    const storeId = getCartItemStoreId(item);
    const store = item.productVariant?.product?.store;
    const existing = groups.get(storeId);

    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.quantity * getCartItemUnitPrice(item);
      continue;
    }

    groups.set(storeId, {
      storeId,
      storeName: store?.name ?? 'ร้านค้า',
      storeSlug: store?.slug ?? null,
      items: [item],
      subtotal: item.quantity * getCartItemUnitPrice(item),
    });
  }

  return Array.from(groups.values());
}
