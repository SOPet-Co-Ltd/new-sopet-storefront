'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { InfoIcon } from '@/components/atoms/icons/outline/InfoIcon';
import { CartEmptyState } from '@/components/sections/CartPage/CartEmptyState';
import { CartItemRow } from '@/components/organisms/CartItemRow/CartItemRow';
import { useCart } from '@/lib/providers/CartProvider';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

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
  const {
    items,
    itemsByStore,
    selectedItems,
    selectedSubtotal,
    allItemsSelected,
    isItemSelected,
    isStoreSelected,
    toggleItemSelected,
    setStoreSelected,
    setAllSelected,
    loading,
    error,
    updateItem,
    changeItemVariant,
    removeItem,
    refetch,
  } = useCart();

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
      <main
        className="container mx-auto flex min-h-[calc(100dvh-12rem)] flex-col px-4 py-8 lg:min-h-[calc(100dvh-10rem)] lg:px-20"
        data-testid="cart-empty"
      >
        <CartEmptyState />
      </main>
    );
  }

  const totalLines = items.length;
  const selectedLines = selectedItems.length;
  const hasSelection = selectedLines > 0;
  const isMultiStore = itemsByStore.length > 1;

  return (
    <main
      className="mx-auto w-full max-w-full px-4 pb-44 pt-8 lg:px-20 lg:pb-36"
      data-testid="cart-page"
    >
      <h1 className="mb-6 sop-headline-md-medium text-sop-neutral-gray-300">ตะกร้าสินค้า</h1>

      {isMultiStore ? (
        <div className="mb-6 flex items-start gap-3 rounded-sop-12px bg-sop-system-warning-100 px-4 py-3">
          <InfoIcon size={{ mobile: 20 }} className="mt-0.5 shrink-0 text-sop-system-warning-500" />
          <p className="sop-body-sm-regular text-sop-system-warning-500">
            คุณมีสินค้าจากหลายร้าน หน้าชำระเงินจะแบ่งยอดชำระต่อร้าน และชำระด้วยบัตรได้ในครั้งเดียว
            (PromptPay ใช้ได้เมื่อมีร้านเดียว)
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        {itemsByStore.map((group) => {
          const storeAllSelected = isStoreSelected(group.storeId);
          const someSelected = group.items.some((item) => isItemSelected(item.id));

          return (
            <section
              key={group.storeId}
              className="overflow-hidden rounded-sop-16px bg-sop-base-white"
              data-testid={`cart-store-${group.storeId}`}
            >
              <div className="flex items-center gap-3 border-b border-sop-neutral-grayalpha-200 px-4 py-4">
                <Checkbox
                  checked={storeAllSelected}
                  indeterminate={someSelected && !storeAllSelected}
                  onChange={(next) => setStoreSelected(group.storeId, next)}
                  aria-label={`เลือกสินค้าทั้งหมดจาก ${group.storeName}`}
                />
                <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">{group.storeName}</h2>
              </div>

              <div className="px-4">
                {group.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    selected={isItemSelected(item.id)}
                    onToggleSelect={toggleItemSelected}
                    onUpdateQuantity={updateItem}
                    onChangeVariant={changeItemVariant}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:sticky lg:bottom-6 lg:mt-8">
        <div className="mx-auto flex w-full max-w-full flex-col gap-3 rounded-tl-sop-20px rounded-tr-sop-20px bg-sop-base-white px-4 py-4 shadow-[0_-6px_24px_rgba(34,34,41,0.12)] lg:gap-4 lg:rounded-sop-20px lg:px-8 lg:py-5 lg:shadow-[0_8px_28px_rgba(34,34,41,0.12)]">
          <div className="ml-auto flex w-full max-w-xs flex-col gap-1">
            <div className="flex items-center justify-between gap-6">
              <span className="sop-body-sm-regular text-sop-neutral-gray-400">
                สินค้า {selectedLines} รายการ
              </span>
              <span className="sop-body-md-medium text-sop-neutral-gray-200">
                {formatPrice(selectedSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="sop-body-sm-regular text-sop-neutral-gray-400">รวมทั้งสิ้น</span>
              <span
                className="sop-headline-sm-medium text-sop-secondary-600"
                data-testid="cart-subtotal"
              >
                {formatPrice(selectedSubtotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <label className="flex cursor-pointer items-center gap-2 sop-body-sm-regular text-sop-neutral-gray-300">
              <Checkbox
                checked={allItemsSelected}
                indeterminate={hasSelection && !allItemsSelected}
                onChange={(next) => setAllSelected(next)}
                aria-label="เลือกสินค้าทั้งหมด"
              />
              เลือกสินค้าทั้งหมด ({totalLines})
            </label>

            <Link
              href="/checkout"
              aria-disabled={!hasSelection}
              className={`sm:max-w-xs sm:flex-1 ${hasSelection ? '' : 'pointer-events-none'}`}
              tabIndex={hasSelection ? undefined : -1}
            >
              <Button
                type="button"
                size="lg"
                disabled={!hasSelection}
                className="whitespace-nowrap w-40 sm:w-full "
              >
                ชำระเงิน ({selectedLines})
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
