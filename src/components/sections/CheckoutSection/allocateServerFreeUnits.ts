import type { CartItem } from '@/lib/cart/cartUtils';
import { getCartItemUnitPrice } from '@/lib/cart/cartUtils';

/**
 * Distribute server `validatePromotion.freeUnits` across cart lines of product P
 * using Rule B cheapest-units order (display only — Gate A).
 * Does NOT use local estimate freeN; callers must pass server freeUnits only.
 */
export function allocateServerFreeUnitsToLines(
  freeUnits: number,
  items: CartItem[],
  productId: string | null | undefined,
): Record<string, number> {
  const result: Record<string, number> = {};
  if (freeUnits <= 0 || !productId) return result;

  type Slot = {
    itemId: string;
    unitPrice: number;
    lineIndex: number;
    variantId: string;
  };

  const units: Slot[] = [];
  for (let lineIndex = 0; lineIndex < items.length; lineIndex++) {
    const item = items[lineIndex];
    const lineProductId = item.productVariant?.product?.id;
    if (lineProductId !== productId) continue;

    const qty = Math.max(0, Math.floor(Number(item.quantity)) || 0);
    const unitPrice = getCartItemUnitPrice(item);
    const variantId = item.variantId ?? item.productVariant?.id ?? '';

    for (let u = 0; u < qty; u++) {
      units.push({ itemId: item.id, unitPrice, lineIndex, variantId });
    }
  }

  if (units.length === 0) return result;

  units.sort((a, b) => {
    if (a.unitPrice !== b.unitPrice) return a.unitPrice - b.unitPrice;
    if (a.lineIndex !== b.lineIndex) return a.lineIndex - b.lineIndex;
    if (a.variantId < b.variantId) return -1;
    if (a.variantId > b.variantId) return 1;
    return 0;
  });

  const take = Math.min(freeUnits, units.length);
  for (let i = 0; i < take; i++) {
    const id = units[i].itemId;
    result[id] = (result[id] ?? 0) + 1;
  }

  return result;
}
