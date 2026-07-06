'use client';

import Image from 'next/image';
import { ClipboardListIcon, ShopIcon } from '@/components/atoms/icons';
import type { StoreCartGroup } from '@/lib/cart/cartUtils';
import { getCartItemUnitPrice } from '@/lib/cart/cartUtils';
import { CartShippingMethodsSection } from '@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type CheckoutOrderItemsProps = {
  groups: StoreCartGroup[];
};

export function CheckoutOrderItems({ groups }: CheckoutOrderItemsProps) {
  return (
    <div className="flex flex-col gap-sop-20px">
      {groups.map((group) => (
        <section key={group.storeId} data-testid={`checkout-store-${group.storeId}`}>
          <label className="mb-sop-12px flex items-center gap-2 sop-body-lg-medium text-sop-primary-500">
            <ClipboardListIcon size={{ mobile: 24 }} color="#884ECF" />
            คำสั่งซื้อสินค้า
          </label>

          <div className="overflow-hidden rounded-sop-20px bg-sop-base-white">
            <div className="flex items-center gap-sop-8px bg-[repeating-linear-gradient(90deg,var(--color-sop-primary-300)_0_12px,transparent_12px_20px)] bg-size-[100%_1px] bg-bottom bg-repeat-x px-sop-16px py-sop-12px lg:px-sop-24px">
              <div className="flex h-sop-28px w-sop-28px items-center justify-center rounded-full bg-sop-primary-500 p-sop-8px lg:h-sop-32px lg:w-sop-32px">
                <ShopIcon size={{ mobile: 30 }} color="white" />
              </div>
              <span className="sop-body-md-medium text-sop-neutral-gray-200">{group.storeName}</span>
              <span className="sop-body-sm-regular text-sop-neutral-gray-200">
                {group.items.length} ชิ้น
              </span>
            </div>

            <div className="flex flex-col gap-sop-20px px-sop-16px pb-sop-16px pt-sop-16px lg:px-sop-24px lg:pb-sop-20px lg:pt-sop-28px">
              {group.items.map((item, index) => {
                const unitPrice = getCartItemUnitPrice(item);
                const product = item.productVariant?.product;

                return (
                  <div key={item.id}>
                    <div className="flex min-w-0 justify-start gap-sop-16px lg:gap-sop-20px">
                      <div className="relative aspect-square h-sop-80px w-sop-80px shrink-0 overflow-hidden rounded-sop-8px">
                        <Image
                          src={product?.thumbnailUrl ?? '/images/placeholder.svg'}
                          alt={product?.name ?? 'สินค้า'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="grid w-full min-w-0 grid-cols-1 gap-sop-8px lg:grid-cols-[1fr_auto]">
                        <div className="flex min-w-0 flex-col items-start justify-start gap-sop-4px">
                          <span className="line-clamp-2 sop-body-sm-regular text-sop-neutral-gray-300 lg:sop-body-md-regular">
                            {product?.name ?? 'สินค้า'}
                          </span>
                        </div>
                        <div className="flex flex-row-reverse items-end justify-between lg:flex-col lg:justify-center">
                          <span className="sop-body-sm-regular text-sop-neutral-gray-400 lg:sop-headline-sm-regular">
                            x{item.quantity}
                          </span>
                          <span className="sop-body-sm-medium text-sop-base-black lg:sop-body-lg-medium">
                            {formatPrice(unitPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < group.items.length - 1 ? (
                      <div className="mt-sop-20px h-px w-full bg-sop-neutral-grayalpha-200" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <CartShippingMethodsSection storeId={group.storeId} storeName={group.storeName} />

            <div className="flex items-center justify-between bg-sop-primary-200 px-sop-24px py-sop-12px">
              <span className="sop-body-md-medium text-sop-neutral-gray-200">ยอดรวมร้าน</span>
              <span className="sop-body-lg-medium text-sop-neutral-gray-200">
                {formatPrice(group.subtotal)}
              </span>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
