'use client';

import { useMemo, useState } from 'react';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import {
  buildOptionGroups,
  findVariantByOptions,
  formatOptionLabel,
  getDefaultSelectedOptions,
  type VariantOptions,
} from './variantUtils';

type ProductDetailsVariantSelectionProps = {
  product: ProductDetail;
  onVariantChange?: (variantId: string | null, price: number, stockQuantity: number) => void;
};

export default function ProductDetailsVariantSelection({
  product,
  onVariantChange,
}: ProductDetailsVariantSelectionProps) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const optionGroups = useMemo(() => buildOptionGroups(variants), [variants]);
  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    getDefaultSelectedOptions(variants),
  );

  const selectedVariant = useMemo(
    () => findVariantByOptions(variants, selectedOptions),
    [variants, selectedOptions],
  );

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const displayStock = selectedVariant?.stockQuantity ?? 0;
  const isOutOfStock = displayStock <= 0;

  const handleOptionSelect = (optionKey: string, value: string) => {
    setSelectedOptions((previous) => {
      const next = { ...previous, [optionKey]: value };
      const variant = findVariantByOptions(variants, next);
      onVariantChange?.(variant?.id ?? null, variant?.price ?? product.basePrice, variant?.stockQuantity ?? 0);
      return next;
    });
  };

  return (
    <div data-testid="product-variant-selection">
      <div className="flex flex-col gap-2 mb-4">
        <p className="sop-headline-sm-medium text-sop-secondary-500" data-testid="variant-price">
          ฿{displayPrice.toLocaleString('th-TH')}
        </p>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400" data-testid="variant-stock">
          {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ ${displayStock} ชิ้น`}
        </p>
      </div>

      {Object.entries(optionGroups).map(([optionKey, values]) => (
        <div key={optionKey} className="mb-4">
          <p className="sop-body-sm-medium text-sop-neutral-gray-300 mb-2">
            {formatOptionLabel(optionKey)}
          </p>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedOptions[optionKey] === value;
              const candidateOptions = { ...selectedOptions, [optionKey]: value };
              const candidateVariant = findVariantByOptions(variants, candidateOptions);
              const isDisabled = (candidateVariant?.stockQuantity ?? 0) <= 0;

              return (
                <button
                  key={`${optionKey}-${value}`}
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  onClick={() => handleOptionSelect(optionKey, value)}
                  className={`rounded-full border px-4 py-2 sop-body-sm-regular transition-colors ${
                    isSelected
                      ? 'border-sop-primary-500 bg-sop-primary-100 text-sop-primary-700'
                      : 'border-sop-neutral-grayalpha-300 text-sop-neutral-gray-300'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export { type ProductDetailsVariantSelectionProps };
