'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { CartIcon } from '@/components/atoms/icons/filled/CartIcon';

export function CartEmptyState() {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-center py-10 lg:py-16"
      data-testid="cart-empty-state"
    >
      <div className="flex w-full max-w-lg flex-col items-center rounded-sop-20px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-6 py-10 text-center shadow-[0_8px_32px_rgba(34,34,41,0.06)] sm:px-10 sm:py-12">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-sop-secondary-100"
          aria-hidden="true"
        >
          <CartIcon size={{ mobile: 48, desktop: 48 }} className="text-sop-secondary-400" />
        </div>

        <h1 className="mt-6 sop-headline-md-medium text-sop-neutral-gray-200">
          ตะกร้าของคุณว่างเปล่า
        </h1>
        <p className="mt-3 max-w-sm sop-body-md-regular text-sop-neutral-gray-400">
          ค้นหาสินค้าสำหรับเพื่อนขนที่คุณรัก แล้วเพิ่มลงตะกร้าเพื่อชำระเงินได้ในครั้งเดียว
        </p>

        <Link href="/products" className="mt-8 w-full max-w-xs">
          <Button type="button" size="xl" fill>
            เริ่มเลือกซื้อสินค้า
          </Button>
        </Link>

        <Link
          href="/"
          className="mt-4 sop-body-sm-medium text-sop-secondary-500 underline underline-offset-4 hover:text-sop-secondary-600"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
