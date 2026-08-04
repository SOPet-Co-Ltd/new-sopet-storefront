'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { ProductDetailQuantitySelection } from '@/components/molecules/ProductDetailQuantitySelection/ProductDetailQuantitySelection';
import { ProductVariants } from '@/components/molecules/ProductVariants/ProductVariants';
import {
  findVariantByOptions,
  parseVariantOptions,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import type { CartItem } from '@/lib/cart/cartUtils';
import { useProduct } from '@/lib/hooks/useProduct';

type CartVariantModalProps = {
  item: CartItem;
  onClose: () => void;
  onConfirm: (variantId: string, quantity: number) => Promise<void>;
};

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

export function CartVariantModal({ item, onClose, onConfirm }: CartVariantModalProps) {
  const product = item.productVariant?.product;
  const productId = product?.id ?? '';
  const productName = product?.name ?? 'สินค้า';

  const {
    product: fullProduct,
    loading,
    error,
  } = useProduct({
    mode: 'id',
    id: productId,
    skip: !productId,
  });

  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    parseVariantOptions(item.productVariant?.optionsJson ?? null),
  );
  const [quantity, setQuantity] = useState(() => Math.max(item.quantity, 1));
  const [submitting, setSubmitting] = useState(false);

  const variants = fullProduct?.variants ?? null;

  const findVariantStock = (candidateOptions: VariantOptions) =>
    findVariantByOptions(variants, candidateOptions)?.stockQuantity ?? 0;

  const selectedVariant = useMemo(
    () => findVariantByOptions(variants, selectedOptions),
    [variants, selectedOptions],
  );

  const variantStock = selectedVariant?.stockQuantity ?? 0;
  // Derive the effective quantity from the raw state and current stock so it stays
  // within bounds without needing an effect to clamp it after stock changes.
  const clampedQuantity = Math.min(Math.max(quantity, 1), Math.max(variantStock, 1));

  const handleOptionChange = (optionKey: string, value: string) => {
    setQuantity(1);
    setSelectedOptions((prev) => ({ ...prev, [optionKey]: value }));
  };

  const isSameVariant = selectedVariant?.id === item.variantId;
  const isOutOfStock = variantStock <= 0;
  const isUnchanged = isSameVariant && clampedQuantity === item.quantity;
  const canConfirm = Boolean(selectedVariant) && !isUnchanged && !isOutOfStock;

  const handleConfirm = async () => {
    if (!selectedVariant || !canConfirm) return;

    try {
      setSubmitting(true);
      await onConfirm(selectedVariant.id, clampedQuantity);
      onClose();
    } catch {
      // Errors surface via the cart provider's toast; keep the modal open.
    } finally {
      setSubmitting(false);
    }
  };

  const displayPrice = selectedVariant?.price ?? item.productVariant?.price ?? 0;

  return (
    <Modal
      onClose={onClose}
      width={480}
      contentClassName="pb-2"
      header={
        <div className="flex items-center gap-3 pr-8">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sop-12px bg-sop-neutral-gray-500">
            {product?.thumbnailUrl ? (
              <Image
                src={product.thumbnailUrl}
                alt={productName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="line-clamp-2 sop-body-md-medium text-sop-neutral-gray-200">
              {productName}
            </h2>
            <p className="sop-body-md-medium text-sop-secondary-600">{formatPrice(displayPrice)}</p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!canConfirm}
            loading={submitting}
            onClick={() => void handleConfirm()}
          >
            {isOutOfStock ? 'สินค้าหมด' : 'ยืนยัน'}
          </Button>
        </div>
      }
    >
      <div className="py-2">
        {loading ? (
          <div className="animate-pulse space-y-3" aria-hidden>
            <div className="h-4 w-24 rounded-sop-8px bg-sop-neutral-gray-500" />
            <div className="flex gap-3">
              <div className="h-9 w-20 rounded-sop-36 bg-sop-neutral-gray-500" />
              <div className="h-9 w-20 rounded-sop-36 bg-sop-neutral-gray-500" />
              <div className="h-9 w-20 rounded-sop-36 bg-sop-neutral-gray-500" />
            </div>
          </div>
        ) : error ? (
          <p className="sop-body-sm-regular text-sop-secondary-500">
            ไม่สามารถโหลดตัวเลือกสินค้าได้ กรุณาลองใหม่อีกครั้ง
          </p>
        ) : variants && variants.length > 0 && fullProduct ? (
          <div className="flex flex-col gap-5">
            <ProductVariants
              product={fullProduct}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
              findVariantStock={findVariantStock}
            />

            {selectedVariant ? (
              isOutOfStock ? (
                <p
                  className="sop-body-sm-regular text-sop-secondary-500"
                  data-testid="variant-out-of-stock"
                >
                  ตัวเลือกนี้สินค้าหมด
                </p>
              ) : (
                <ProductDetailQuantitySelection
                  variantStock={variantStock}
                  productQuantity={clampedQuantity}
                  setProductQuantity={setQuantity}
                />
              )
            ) : null}
          </div>
        ) : (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">
            สินค้านี้ไม่มีตัวเลือกให้เลือก
          </p>
        )}
      </div>
    </Modal>
  );
}
