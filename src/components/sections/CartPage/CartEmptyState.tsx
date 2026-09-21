'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

const EMPTY_CART_ICON = '/images/cart/shopping-cart-bag-icon.webp';

export function CartEmptyState() {
  return (
    <div className="w-full" data-testid="cart-empty-state">
      <div className="flex min-h-[465px] w-full flex-col items-center justify-center bg-sop-base-white px-4 py-10 lg:min-h-0 lg:rounded-sop-20 lg:py-[100px]">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-1">
            <div className="relative size-20 shrink-0 overflow-hidden">
              <Image
                src={EMPTY_CART_ICON}
                alt=""
                width={80}
                height={80}
                className="size-full object-cover"
                aria-hidden
              />
            </div>
            <p className="text-center sop-body-md-medium text-sop-base-black">ตะกร้ายังว่างอยู่</p>
            <p className="text-center sop-body-sm-regular text-sop-neutral-gray-300">
              มาเลือกของให้น้องๆ กันเถอะเพิ่มยา อาหาร
              <br aria-hidden />
              หรือของใช้ที่ต้องการลงตะกร้าได้เลย
            </p>
          </div>

          <Link href="/products">
            <Button type="button" size="md" className="px-sop-32px">
              เลือกซื้อสินค้า
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
