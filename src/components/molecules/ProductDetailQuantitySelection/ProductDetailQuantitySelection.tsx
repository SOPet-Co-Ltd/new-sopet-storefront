'use client';

import { type SetStateAction } from 'react';
import { MinusSquareIcon } from '@/components/atoms/icons/inline/MinusSquareIcon';
import { PlusSquareIcon } from '@/components/atoms/icons/inline/PlusSquareIcon';

type ProductDetailQuantitySelectionProps = {
  variantStock: number;
  productQuantity: number;
  setProductQuantity: (value: SetStateAction<number>) => void;
};

export function ProductDetailQuantitySelection({
  variantStock,
  productQuantity,
  setProductQuantity,
}: ProductDetailQuantitySelectionProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-3 lg:justify-start lg:gap-5">
      <p className="sop-body-md-regular text-sop-neutral-gray-400 lg:w-[90px] lg:shrink-0 lg:sop-body-lg-regular">
        จำนวน
      </p>
      <div className="flex items-center gap-6 rounded-sop-4px py-1.5">
        <button
          type="button"
          className="cursor-pointer disabled:cursor-not-allowed"
          disabled={productQuantity <= 1}
          onClick={() => setProductQuantity((quantity) => (quantity > 1 ? quantity - 1 : 1))}
          aria-label="ลดจำนวน"
        >
          <div>
            <MinusSquareIcon
              size={{ mobile: 24, desktop: 26 }}
              color={productQuantity <= 1 ? '#22222947' : '#211f23'}
              strokeWidth={1.5}
            />
          </div>
        </button>
        <p className="sop-body-md-regular text-sop-neutral-gray-300 lg:sop-body-lg-regular">
          {productQuantity}
        </p>
        <button
          type="button"
          className="cursor-pointer disabled:cursor-not-allowed"
          disabled={productQuantity >= variantStock}
          onClick={() =>
            setProductQuantity((quantity) => (quantity < variantStock ? quantity + 1 : quantity))
          }
          aria-label="เพิ่มจำนวน"
        >
          <div>
            <PlusSquareIcon
              size={{ mobile: 24, desktop: 26 }}
              color={productQuantity >= variantStock ? '#22222947' : '#211f23'}
              strokeWidth={1.5}
            />
          </div>
        </button>
      </div>
      <p className="sop-body-xs-regular text-sop-neutral-gray-400" data-testid="variant-stock">
        เหลือสินค้า {variantStock} ชิ้น
      </p>
    </div>
  );
}
