'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/atoms/Checkbox';
import { CaretDownIcon } from '@/components/atoms/icons/inline/CaretDownIcon';
import { MinusSquareIcon } from '@/components/atoms/icons/inline/MinusSquareIcon';
import { PlusSquareIcon } from '@/components/atoms/icons/inline/PlusSquareIcon';
import { TrashIcon } from '@/components/atoms/icons/filled/TrashIcon';
import { CartVariantModal } from '@/components/organisms/CartVariantModal/CartVariantModal';
import type { CartItem } from '@/lib/cart/cartUtils';
import { getCartItemUnitPrice } from '@/lib/cart/cartUtils';

type CartItemRowProps = {
  item: CartItem;
  disabled?: boolean;
  selected: boolean;
  onToggleSelect: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onChangeVariant: (itemId: string, variantId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
};

function parseVariantLabel(optionsJson: string | null | undefined): string {
  if (!optionsJson) return '';

  try {
    const parsed = JSON.parse(optionsJson) as Record<string, string>;
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  } catch {
    return '';
  }
}

export function CartItemRow({
  item,
  disabled = false,
  selected,
  onToggleSelect,
  onUpdateQuantity,
  onChangeVariant,
  onRemove,
}: CartItemRowProps) {
  const product = item.productVariant?.product;
  const unitPrice = getCartItemUnitPrice(item);
  const variantLabel = parseVariantLabel(item.productVariant?.optionsJson);
  const canDecrement = !disabled && item.quantity > 1;
  const productName = product?.name ?? 'สินค้า';
  const [variantModalOpen, setVariantModalOpen] = useState(false);

  return (
    <div
      className="flex gap-3 border-b border-sop-neutral-grayalpha-200 py-4 last:border-0 lg:gap-4"
      data-testid={`cart-item-${item.id}`}
    >
      <Checkbox
        checked={selected}
        onChange={() => onToggleSelect(item.id)}
        disabled={disabled}
        aria-label={`เลือก ${productName}`}
        className="mt-1 lg:mt-0 lg:self-center"
      />

      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sop-12px bg-sop-neutral-gray-500">
        {product?.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={productName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
            ไม่มีรูป
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            {product?.id ? (
              <Link
                href={`/product/${product.id}`}
                className="sop-body-sm-medium text-sop-neutral-gray-300 line-clamp-2"
              >
                {productName}
              </Link>
            ) : (
              <p className="sop-body-sm-medium text-sop-neutral-gray-300">{productName}</p>
            )}

            <button
              type="button"
              disabled={disabled}
              className="shrink-0 cursor-pointer text-sop-neutral-gray-400 transition-colors hover:text-sop-secondary-500 disabled:opacity-40 lg:hidden"
              aria-label={`ลบ ${productName} ออกจากตะกร้า`}
              onClick={() => void onRemove(item.id)}
            >
              <TrashIcon size={{ mobile: 20 }} />
            </button>
          </div>

          {variantLabel ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setVariantModalOpen(true)}
              aria-haspopup="dialog"
              aria-label={`เปลี่ยนตัวเลือกสินค้าของ ${productName}`}
              className="inline-flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-sop-8px border border-sop-neutral-grayalpha-300 px-3 py-1.5 sop-body-xs-regular text-sop-neutral-gray-300 transition-colors hover:border-sop-neutral-grayalpha-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="truncate">{variantLabel}</span>
              <CaretDownIcon size={{ mobile: 16 }} className="shrink-0 text-sop-neutral-gray-400" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end lg:gap-6">
          <p className="sop-body-md-medium text-sop-secondary-600 lg:order-1 lg:w-24 lg:text-right">
            ฿{unitPrice.toLocaleString('th-TH')}
          </p>

          <div className="flex items-center gap-3 lg:order-2">
            <button
              type="button"
              disabled={!canDecrement}
              className="cursor-pointer disabled:cursor-not-allowed"
              aria-label="ลดจำนวน"
              onClick={() => void onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <MinusSquareIcon
                size={{ mobile: 24 }}
                color={canDecrement ? '#211f23' : '#22222947'}
                strokeWidth={1.5}
              />
            </button>
            <span className="min-w-6 text-center sop-body-sm-regular text-sop-neutral-gray-300">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={disabled}
              className="cursor-pointer disabled:cursor-not-allowed"
              aria-label="เพิ่มจำนวน"
              onClick={() => void onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <PlusSquareIcon
                size={{ mobile: 24 }}
                color={disabled ? '#22222947' : '#211f23'}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            className="hidden shrink-0 cursor-pointer text-sop-neutral-gray-400 transition-colors hover:text-sop-secondary-500 disabled:opacity-40 lg:order-3 lg:inline-flex"
            aria-label={`ลบ ${productName} ออกจากตะกร้า`}
            onClick={() => void onRemove(item.id)}
          >
            <TrashIcon size={{ mobile: 22 }} />
          </button>
        </div>
      </div>

      {variantModalOpen ? (
        <CartVariantModal
          // Remount when the underlying variant/quantity changes so the modal's
          // local selection state always starts fresh from the latest cart item.
          key={`${item.id}:${item.productVariant?.optionsJson ?? ''}:${item.quantity}`}
          item={item}
          onClose={() => setVariantModalOpen(false)}
          onConfirm={(variantId, quantity) => onChangeVariant(item.id, variantId, quantity)}
        />
      ) : null}
    </div>
  );
}
