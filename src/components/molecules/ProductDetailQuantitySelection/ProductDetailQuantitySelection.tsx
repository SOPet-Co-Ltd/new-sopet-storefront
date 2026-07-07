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
    <div className="grid md:grid-cols-[8rem_1fr] grid-cols-[6rem_1fr]">
      <div>
        <p className="md:sop-body-lg-regular sop-body-md-regular text-sop-neutral-gray-400">
          จำนวน
        </p>
      </div>
      <div className="flex md:gap-20 items-center justify-between md:justify-normal">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="cursor-pointer"
            disabled={productQuantity <= 1}
            onClick={() =>
              setProductQuantity((quantity) => (quantity > 1 ? quantity - 1 : 1))
            }
            aria-label="ลดจำนวน"
          >
            <div className="md:block hidden">
              <MinusSquareIcon
                size={{ mobile: 32, desktop: 32 }}
                color={productQuantity <= 1 ? '#22222947' : '#211f23'}
              />
            </div>
            <div className="block md:hidden">
              <MinusSquareIcon
                size={{ mobile: 24, desktop: 24 }}
                color={productQuantity <= 1 ? '#22222947' : '#211f23'}
              />
            </div>
          </button>
          <p className="md:sop-body-lg-regular sop-body-md-regular w-sop-28px flex justify-center text-center">
            {productQuantity}
          </p>
          <button
            type="button"
            className="cursor-pointer"
            disabled={productQuantity >= variantStock}
            onClick={() =>
              setProductQuantity((quantity) =>
                quantity < variantStock ? quantity + 1 : quantity,
              )
            }
            aria-label="เพิ่มจำนวน"
          >
            <div className="md:block hidden">
              <PlusSquareIcon
                size={{ mobile: 32, desktop: 32 }}
                color={productQuantity >= variantStock ? '#22222947' : '#211f23'}
              />
            </div>
            <div className="block md:hidden">
              <PlusSquareIcon
                size={{ mobile: 24, desktop: 24 }}
                color={productQuantity >= variantStock ? '#22222947' : '#211f23'}
              />
            </div>
          </button>
        </div>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400" data-testid="variant-stock">
          เหลือสินค้า {variantStock} ชิ้น
        </p>
      </div>
    </div>
  );
}
