'use client';

import { Fragment, useMemo } from 'react';
import { ClipboardListIcon, ShopIcon } from '@/components/atoms/icons';
import type { StoreCartGroup } from '@/lib/cart/cartUtils';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { allocateServerFreeUnitsToLines } from './allocateServerFreeUnits';
import { CheckoutOrderItemRow } from './CheckoutOrderItemRow';
import { CheckoutStoreActionsRow } from './CheckoutStoreActionsRow';
import { formatCheckoutPrice } from './checkoutOrderItemUtils';

function mergeFreeQuantityMaps(...maps: Array<Record<string, number>>): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const map of maps) {
    for (const [itemId, qty] of Object.entries(map)) {
      if (qty <= 0) continue;
      merged[itemId] = (merged[itemId] ?? 0) + qty;
    }
  }
  return merged;
}

type CheckoutStoreCardProps = {
  group: StoreCartGroup;
  platformFreeByItemId: Record<string, number>;
};

function CheckoutStoreCard({ group, platformFreeByItemId }: CheckoutStoreCardProps) {
  const { shippingByStoreId, storePromotionsByStoreId } = useCheckout();

  const itemCount = group.items.reduce((total, item) => total + item.quantity, 0);
  const selectedShippingFee = shippingByStoreId[group.storeId]?.shippingFee ?? 0;
  const appliedStorePromo = storePromotionsByStoreId[group.storeId] ?? null;
  const storeDiscount = appliedStorePromo?.discountAmount ?? 0;
  const storeTotal = group.subtotal + selectedShippingFee - storeDiscount;

  const freeQuantityByItemId = useMemo(() => {
    const freeUnits = appliedStorePromo?.freeUnits ?? 0;
    // Gate A: only server freeUnits; local Rule B estimate must not drive badges.
    const storeAlloc =
      freeUnits && freeUnits > 0
        ? allocateServerFreeUnitsToLines(
            freeUnits,
            group.items,
            appliedStorePromo?.productId ?? null,
          )
        : {};

    const platformAlloc: Record<string, number> = {};
    for (const item of group.items) {
      const qty = platformFreeByItemId[item.id];
      if (qty && qty > 0) platformAlloc[item.id] = qty;
    }

    return mergeFreeQuantityMaps(storeAlloc, platformAlloc);
  }, [
    appliedStorePromo?.freeUnits,
    appliedStorePromo?.productId,
    group.items,
    platformFreeByItemId,
  ]);

  return (
    <section className="flex flex-col" data-testid={`checkout-store-${group.storeId}`}>
      <div className="flex items-center gap-sop-8px rounded-t-sop-20px border-b border-dashed border-sop-primary-300 bg-sop-base-white px-sop-16px py-sop-12px lg:px-sop-24px">
        <div className="flex items-center rounded-sop-20px bg-sop-primary-500 p-sop-8px">
          <ShopIcon size={{ mobile: 16 }} color="white" />
        </div>
        <span className="sop-body-md-medium text-sop-neutral-gray-200">{group.storeName}</span>
        <span className="sop-body-xs-regular text-sop-neutral-gray-200">{itemCount} ชิ้น</span>
      </div>

      <div className="flex flex-col gap-sop-20px bg-sop-base-white px-sop-16px py-sop-20px lg:px-sop-24px lg:py-sop-28px">
        {group.items.map((item, index) => (
          <Fragment key={item.id}>
            <CheckoutOrderItemRow item={item} freeQuantity={freeQuantityByItemId[item.id] ?? 0} />
            {index < group.items.length - 1 ? (
              <div className="h-px w-full bg-sop-neutral-grayalpha-200" />
            ) : null}
          </Fragment>
        ))}

        <div className="h-px w-full bg-sop-neutral-grayalpha-200" />

        <CheckoutStoreActionsRow
          storeId={group.storeId}
          storeName={group.storeName}
          storeSubtotal={group.subtotal}
        />
      </div>

      <div className="flex items-center justify-between rounded-b-sop-20px bg-sop-primary-200 px-sop-16px py-sop-12px lg:px-sop-24px">
        <span className="sop-body-md-medium text-sop-neutral-gray-200">ยอดรวมร้าน</span>
        <span className="sop-body-lg-medium text-sop-neutral-gray-200">
          {formatCheckoutPrice(storeTotal)}
        </span>
      </div>
    </section>
  );
}

type CheckoutOrderItemsProps = {
  groups: StoreCartGroup[];
};

export function CheckoutOrderItems({ groups }: CheckoutOrderItemsProps) {
  const { promotionFreeUnits, promotionProductId } = useCheckout();

  // Platform BxGy is order-wide — allocate once across all cart lines (not per store).
  const platformFreeByItemId = useMemo(() => {
    const freeUnits = promotionFreeUnits ?? 0;
    if (!freeUnits || freeUnits <= 0) return {};
    const allItems = groups.flatMap((group) => group.items);
    return allocateServerFreeUnitsToLines(freeUnits, allItems, promotionProductId);
  }, [groups, promotionFreeUnits, promotionProductId]);

  return (
    <div
      className="flex flex-col gap-sop-12px px-sop-16px py-sop-20px"
      data-testid="checkout-order-items"
    >
      <div className="flex items-center gap-sop-8px">
        <ClipboardListIcon size={{ mobile: 24 }} color="#9C6ADE" />
        <h2 className="sop-body-sm-medium text-sop-primary-500 lg:sop-body-md-medium">
          คำสั่งซื้อสินค้า
        </h2>
      </div>

      <div className="flex flex-col gap-sop-16px">
        {groups.map((group) => (
          <CheckoutStoreCard
            key={group.storeId}
            group={group}
            platformFreeByItemId={platformFreeByItemId}
          />
        ))}
      </div>
    </div>
  );
}
