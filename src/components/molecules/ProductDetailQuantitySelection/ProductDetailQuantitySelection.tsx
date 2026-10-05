import { type SetStateAction } from 'react';
import { TimeIcon } from '@/components/atoms/icons/filled/TimeIcon';
import { MinusSquareIcon } from '@/components/atoms/icons/inline/MinusSquareIcon';
import { PlusSquareIcon } from '@/components/atoms/icons/inline/PlusSquareIcon';

type ProductDetailQuantitySelectionProps = {
  variantStock: number;
  productQuantity: number;
  setProductQuantity: (value: SetStateAction<number>) => void;
  expiryDate?: string | null;
};

export function ProductDetailQuantitySelection({
  variantStock,
  productQuantity,
  setProductQuantity,
  expiryDate,
}: ProductDetailQuantitySelectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-sop-neutral-gray-400">จำนวน</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-sop-8px bg-sop-neutral-gray-500 p-1">
            <button
              type="button"
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-sop-neutral-gray-400 transition-colors hover:text-sop-neutral-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={productQuantity <= 1}
              onClick={() => setProductQuantity((quantity) => (quantity > 1 ? quantity - 1 : 1))}
              aria-label="ลดจำนวน"
            >
              <MinusSquareIcon
                size={{ mobile: 20, desktop: 20 }}
                color={productQuantity <= 1 ? '#D1D5DB' : '#6B7280'}
              />
            </button>
            <span className="min-w-8 text-center text-sm font-medium text-sop-neutral-gray-200">
              {productQuantity}
            </span>
            <button
              type="button"
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-sop-neutral-gray-400 transition-colors hover:text-sop-neutral-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={productQuantity >= variantStock}
              onClick={() =>
                setProductQuantity((quantity) =>
                  quantity < variantStock ? quantity + 1 : quantity,
                )
              }
              aria-label="เพิ่มจำนวน"
            >
              <PlusSquareIcon
                size={{ mobile: 20, desktop: 20 }}
                color={productQuantity >= variantStock ? '#D1D5DB' : '#6B7280'}
              />
            </button>
          </div>

          <span
            className="inline-flex items-center rounded-md bg-[#FFF0ED] px-2.5 py-1 text-xs font-medium text-[#FF4D4F]"
            data-testid="variant-stock"
          >
            เหลือสินค้า {variantStock} ชิ้น
          </span>
        </div>
      </div>

      {expiryDate ? (
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sop-neutral-grayalpha-200 px-3 py-1 text-xs text-sop-neutral-gray-300">
            <TimeIcon size={{ mobile: 16, desktop: 16 }} color="#6b7280" />
            <span>หมดอายุ : {expiryDate}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
