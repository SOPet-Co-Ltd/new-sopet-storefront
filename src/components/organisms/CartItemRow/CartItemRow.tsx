'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import type { CartItem } from '@/lib/cart/cartUtils';
import { getCartItemUnitPrice } from '@/lib/cart/cartUtils';

type CartItemRowProps = {
  item: CartItem;
  disabled?: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
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
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const product = item.productVariant?.product;
  const unitPrice = getCartItemUnitPrice(item);
  const variantLabel = parseVariantLabel(item.productVariant?.optionsJson);

  return (
    <div
      className="flex gap-4 border-b border-sop-neutral-grayalpha-300 py-4 last:border-0"
      data-testid={`cart-item-${item.id}`}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sop-12px bg-sop-neutral-gray-500">
        {product?.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
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

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {product?.id ? (
          <Link
            href={`/product/${product.id}`}
            className="sop-body-sm-medium text-sop-neutral-gray-300 line-clamp-2"
          >
            {product.name}
          </Link>
        ) : (
          <p className="sop-body-sm-medium text-sop-neutral-gray-300">สินค้า</p>
        )}

        {variantLabel && (
          <p className="sop-body-xs-regular text-sop-neutral-gray-400">{variantLabel}</p>
        )}

        <p className="sop-body-sm-medium text-sop-secondary-500">
          ฿{unitPrice.toLocaleString('th-TH')}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-sop-8px border border-sop-neutral-gray-500">
            <button
              type="button"
              disabled={disabled || item.quantity <= 1}
              className="px-3 py-1 sop-body-sm-regular disabled:opacity-50"
              aria-label="ลดจำนวน"
              onClick={() => void onUpdateQuantity(item.id, item.quantity - 1)}
            >
              −
            </button>
            <span className="min-w-8 text-center sop-body-sm-regular">{item.quantity}</span>
            <button
              type="button"
              disabled={disabled}
              className="px-3 py-1 sop-body-sm-regular disabled:opacity-50"
              aria-label="เพิ่มจำนวน"
              onClick={() => void onUpdateQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => void onRemove(item.id)}
          >
            ลบ
          </Button>
        </div>
      </div>
    </div>
  );
}
