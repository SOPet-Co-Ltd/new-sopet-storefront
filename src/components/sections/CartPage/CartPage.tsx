'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { CartItemRow } from '@/components/organisms/CartItemRow/CartItemRow';
import { useCart } from '@/lib/providers/CartProvider';

function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4" data-testid="cart-loading">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-24 rounded-sop-12px bg-sop-neutral-gray-500" />
      ))}
    </div>
  );
}

export default function CartPage() {
  const { itemsByStore, subtotal, loading, error, updateItem, removeItem, refetch } = useCart();

  if (loading) {
    return (
      <main className="container px-4 py-8 lg:px-20">
        <h1 className="mb-6 sop-headline-md-medium text-sop-neutral-gray-300">ตะกร้าสินค้า</h1>
        <CartSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container px-4 py-8 lg:px-20">
        <h1 className="mb-6 sop-headline-md-medium text-sop-neutral-gray-300">ตะกร้าสินค้า</h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          โหลดตะกร้าไม่สำเร็จ — ลองอีกครั้ง
        </button>
      </main>
    );
  }

  if (itemsByStore.length === 0) {
    return (
      <main className="container px-4 py-8 lg:px-20" data-testid="cart-empty">
        <h1 className="mb-6 sop-headline-md-medium text-sop-neutral-gray-300">ตะกร้าสินค้า</h1>
        <p className="mb-4 sop-body-md-regular text-sop-neutral-gray-400">ตะกร้าของคุณว่างเปล่า</p>
        <Link href="/categories" className="sop-body-sm-medium text-sop-primary-500 underline">
          เลือกซื้อสินค้า
        </Link>
      </main>
    );
  }

  return (
    <main className="container px-4 py-8 pb-24 lg:px-20 md:pb-8" data-testid="cart-page">
      <h1 className="mb-6 sop-headline-md-medium text-sop-neutral-gray-300">ตะกร้าสินค้า</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {itemsByStore.map((group) => (
            <section key={group.storeId} data-testid={`cart-store-${group.storeId}`}>
              <h2 className="mb-4 sop-body-lg-medium text-sop-neutral-gray-300">
                {group.storeName}
              </h2>
              <div className="rounded-sop-16px bg-sop-base-white px-4">
                {group.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-sop-16px bg-sop-base-white p-6">
          <p className="mb-2 sop-body-sm-regular text-sop-neutral-gray-400">ยอดรวม</p>
          <p className="mb-6 sop-headline-sm-medium text-sop-secondary-500" data-testid="cart-subtotal">
            ฿{subtotal.toLocaleString('th-TH')}
          </p>
          <Link href="/checkout" className="block w-full">
            <Button type="button" fill className="w-full">
              ดำเนินการชำระเงิน
            </Button>
          </Link>
        </aside>
      </div>
    </main>
  );
}
