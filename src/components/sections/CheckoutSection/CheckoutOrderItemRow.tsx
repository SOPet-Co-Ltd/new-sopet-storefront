'use client';

import Image from 'next/image';
import type { CartItem } from '@/lib/cart/cartUtils';
import { getCartItemUnitPrice } from '@/lib/cart/cartUtils';
import {
  formatCheckoutPrice,
  formatCheckoutVariantLabel,
} from './checkoutOrderItemUtils';

type CheckoutOrderItemRowProps = {
  item: CartItem;
};

export function CheckoutOrderItemRow({ item }: CheckoutOrderItemRowProps) {
  const unitPrice = getCartItemUnitPrice(item);
  const product = item.productVariant?.product;
  const variantLabel = formatCheckoutVariantLabel(item.productVariant?.optionsJson);

  return (
    <div className="flex min-w-0 items-center justify-between gap-sop-16px lg:gap-sop-20px">
      <div className="flex min-w-0 flex-1 items-start gap-sop-16px lg:gap-sop-20px">
        <div className="relative aspect-square h-sop-80px w-sop-80px shrink-0 overflow-hidden rounded-sop-8px">
          <Image
            src={product?.thumbnailUrl ?? '/images/placeholder.svg'}
            alt={product?.name ?? 'สินค้า'}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-sop-8px">
          <span className="line-clamp-2 sop-body-sm-regular text-sop-neutral-gray-300 lg:sop-body-md-regular">
            {product?.name ?? 'สินค้า'}
          </span>
          {variantLabel ? (
            <span className="sop-body-xs-regular text-sop-neutral-gray-400">{variantLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-sop-4px">
        <span className="sop-body-sm-regular text-sop-neutral-gray-400 lg:sop-headline-sm-regular">
          x{item.quantity}
        </span>
        <span className="sop-body-sm-medium text-sop-base-black lg:sop-body-lg-medium">
          {formatCheckoutPrice(unitPrice)}
        </span>
      </div>
    </div>
  );
}
