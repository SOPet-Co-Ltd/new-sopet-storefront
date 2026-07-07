'use client';

import Image from 'next/image';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import {
  buildOptionGroups,
  formatOptionLabel,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductVariantsProps = {
  product: ProductDetail;
  selectedOptions: VariantOptions;
  onOptionChange: (optionKey: string, value: string) => void;
  findVariantStock: (candidateOptions: VariantOptions) => number;
};

function resolveVariantThumbnail(product: ProductDetail): string | null {
  if (product.thumbnailUrl) return product.thumbnailUrl;

  const sortedImages = [...(product.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return sortedImages[0]?.imageUrl ?? null;
}

export function ProductVariants({
  product,
  selectedOptions,
  onOptionChange,
  findVariantStock,
}: ProductVariantsProps) {
  const optionGroups = buildOptionGroups(product.variants);
  const variantThumbnail = resolveVariantThumbnail(product);

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(optionGroups).map(([optionKey, values]) => {
        const fieldsetId = `variant-${optionKey}`;

        return (
          <div key={optionKey} className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
            <p
              id={`${fieldsetId}-label`}
              className="sop-body-md-regular text-sop-neutral-gray-400 lg:w-[90px] lg:shrink-0 lg:sop-body-lg-regular"
            >
              {formatOptionLabel(optionKey)}
            </p>
            <fieldset
              className="flex min-w-0 flex-wrap gap-3"
              aria-labelledby={`${fieldsetId}-label`}
            >
              <legend className="sr-only">เลือก{formatOptionLabel(optionKey)}</legend>
              {values.map((value) => {
                const isSelected = selectedOptions[optionKey] === value;
                const candidateOptions = { ...selectedOptions, [optionKey]: value };
                const isDisabled = findVariantStock(candidateOptions) <= 0;
                const inputId = `${fieldsetId}-${value}`;

                return (
                  <label
                    key={value}
                    htmlFor={inputId}
                    className={cn(
                      'inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-sop-36 border px-4 py-2 shadow-xs sop-body-xs-regular',
                      isSelected
                        ? 'border-sop-secondary-500 bg-sop-base-white text-sop-secondary-500'
                        : 'border-sop-neutral-grayalpha-100 bg-sop-neutral-gray-500 text-sop-neutral-gray-200',
                      isDisabled && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`variant-option-${optionKey}`}
                      value={value}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => onOptionChange(optionKey, value)}
                      className="sr-only"
                      aria-label={`${formatOptionLabel(optionKey)}: ${value}`}
                    />
                    {variantThumbnail ? (
                      <Image
                        src={variantThumbnail}
                        alt=""
                        width={30}
                        height={30}
                        className="size-[30px] shrink-0 object-cover"
                        aria-hidden
                      />
                    ) : null}
                    <span>{value}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        );
      })}
    </div>
  );
}
