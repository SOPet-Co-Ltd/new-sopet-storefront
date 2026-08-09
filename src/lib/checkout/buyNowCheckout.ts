import type { CartItem } from '@/lib/cart/cartUtils';
import type { ProductDetail } from '@/lib/hooks/useProduct';

export const BUY_NOW_STORAGE_KEY = 'sopet.checkout.buyNow';
export const BUY_NOW_CHANGED_EVENT = 'sopet-buy-now-changed';
export const BUY_NOW_ITEM_ID_PREFIX = 'buy-now:';

export type BuyNowCheckoutPayload = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  /** Honest strikethrough was; omit or null when not higher than payable unit. */
  compareAtPrice?: number | null;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  storeId: string;
  storeName: string;
  storeSlug: string | null;
  sku: string | null;
  stockQuantity: number;
  optionsJson: string | null;
};

function readRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
  } catch {
    return null;
  }
}

function notifyChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(BUY_NOW_CHANGED_EVENT));
}

export function getBuyNowCheckout(): BuyNowCheckoutPayload | null {
  const raw = readRaw();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BuyNowCheckoutPayload;
    if (
      !parsed?.productId ||
      !parsed?.variantId ||
      !parsed?.storeId ||
      typeof parsed.quantity !== 'number' ||
      parsed.quantity < 1 ||
      typeof parsed.price !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setBuyNowCheckout(payload: BuyNowCheckoutPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(payload));
    notifyChanged();
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function clearBuyNowCheckout(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
    notifyChanged();
  } catch {
    // ignore storage failures
  }
}

export function getBuyNowStorageSnapshot(): string | null {
  return readRaw();
}

export function subscribeBuyNowCheckout(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === BUY_NOW_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(BUY_NOW_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(BUY_NOW_CHANGED_EVENT, onStoreChange);
  };
}

export function isBuyNowCartItemId(itemId: string): boolean {
  return itemId.startsWith(BUY_NOW_ITEM_ID_PREFIX);
}

export function toBuyNowCartItem(payload: BuyNowCheckoutPayload): CartItem {
  return {
    id: `${BUY_NOW_ITEM_ID_PREFIX}${payload.variantId}`,
    quantity: payload.quantity,
    variantId: payload.variantId,
    productVariant: {
      id: payload.variantId,
      price: payload.price,
      compareAtPrice: payload.compareAtPrice ?? null,
      sku: payload.sku ?? '',
      stockQuantity: payload.stockQuantity,
      optionsJson: payload.optionsJson,
      product: {
        id: payload.productId,
        name: payload.productName,
        slug: payload.productSlug,
        storeId: payload.storeId,
        thumbnailUrl: payload.thumbnailUrl,
        store: {
          id: payload.storeId,
          name: payload.storeName,
          slug: payload.storeSlug ?? '',
        },
      },
    },
  };
}

export function buildBuyNowCheckoutPayload(params: {
  product: ProductDetail;
  variantId: string;
  quantity: number;
  /** Payable unit (sale price when a campaign applies); defaults to catalog variant.price. */
  price?: number;
  compareAtPrice?: number | null;
}): BuyNowCheckoutPayload | null {
  const { product, variantId, quantity } = params;
  const variant = (product.variants ?? []).find((entry) => entry.id === variantId);
  if (!variant || quantity < 1) return null;

  const price = params.price ?? variant.price;
  const compareAtPrice =
    params.compareAtPrice != null && params.compareAtPrice > price ? params.compareAtPrice : null;

  return {
    productId: product.id,
    variantId: variant.id,
    quantity,
    price,
    compareAtPrice,
    productName: product.name,
    productSlug: product.slug,
    thumbnailUrl: product.thumbnailUrl ?? null,
    storeId: product.storeId,
    storeName: product.store?.name ?? 'ร้านค้า',
    storeSlug: product.store?.slug ?? null,
    sku: variant.sku ?? null,
    stockQuantity: variant.stockQuantity,
    optionsJson: variant.optionsJson ?? null,
  };
}
