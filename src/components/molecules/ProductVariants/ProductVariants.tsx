'use client';

import { Fragment } from 'react';
import { TickThinIcon } from '@/components/atoms/icons/filled/TickThinIcon';
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

export function ProductVariants({
  product,
  selectedOptions,
  onOptionChange,
  findVariantStock,
}: ProductVariantsProps) {
  const optionGroups = buildOptionGroups(product.variants);

  return (
    <div className="md:grid md:grid-cols-[8rem_1fr] flex flex-col gap-4">
      {Object.entries(optionGroups).map(([optionKey, values]) => {
        const fieldsetId = `variant-${optionKey}`;

        return (
          <Fragment key={optionKey}>
            <div>
              <p
                id={`${fieldsetId}-label`}
                className="md:sop-body-lg-regular sop-body-md-regular text-sop-neutral-gray-400"
              >
                {formatOptionLabel(optionKey)}
              </p>
            </div>
            <fieldset
              className="flex gap-2 flex-wrap"
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
                      'relative cursor-pointer sop-body-sm-regular border rounded-sop-8px px-3 py-2 text-sop-neutral-gray-200 bg-sop-base-white border-sop-neutral-grayalpha-100 inline-flex items-center gap-1.5 min-h-[40px]',
                      isSelected &&
                        'text-sop-primary-500 border-sop-primary-500 bg-sop-primary-100',
                      isDisabled && 'opacity-40 cursor-not-allowed',
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
                    <span>{value}</span>
                    {isSelected && (
                      <TickThinIcon
                        size={{ mobile: 14, desktop: 14 }}
                        color="#9c6ade"
                        aria-hidden
                      />
                    )}
                  </label>
                );
              })}
            </fieldset>
          </Fragment>
        );
      })}
    </div>
  );
}
