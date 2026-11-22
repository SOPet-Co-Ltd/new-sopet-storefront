import { type SetStateAction } from 'react';
import { ClockChainIcon } from '@/components/atoms/icons/filled/ClockChainIcon';
import { MinusStrokeIcon } from '@/components/atoms/icons/outline/MinusStrokeIcon';
import { PlusStrokeIcon } from '@/components/atoms/icons/outline/PlusStrokeIcon';

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

        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-[42px] min-w-[138px] items-center justify-between overflow-hidden rounded-sop-12px border border-[rgba(34,34,41,0.04)] bg-sop-base-white">
              <button
                type="button"
                className="flex cursor-pointer items-center bg-[rgba(34,34,41,0.04)] p-2 text-sop-neutral-gray-400 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={productQuantity <= 1}
                onClick={() => setProductQuantity((quantity) => (quantity > 1 ? quantity - 1 : 1))}
                aria-label="ลดจำนวน"
              >
                <MinusStrokeIcon size={{ mobile: 24, desktop: 24 }} color="#949495" />
              </button>

              <span className="flex-1 text-center sop-body-sm font-semibold text-sop-neutral-gray-300">
                {productQuantity}
              </span>

              <button
                type="button"
                className="flex cursor-pointer items-center bg-[rgba(34,34,41,0.04)] p-2 text-sop-neutral-gray-400 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={productQuantity >= variantStock}
                onClick={() =>
                  setProductQuantity((quantity) =>
                    quantity < variantStock ? quantity + 1 : quantity,
                  )
                }
                aria-label="เพิ่มจำนวน"
              >
                <PlusStrokeIcon size={{ mobile: 24, desktop: 24 }} color="#949495" />
              </button>
            </div>

            <span
              className="inline-flex items-center rounded-full bg-sop-secondary-100 px-sop-12px py-sop-4px sop-body-sm-regular font-medium text-sop-secondary-500"
              data-testid="variant-stock"
            >
              เหลือสินค้า {variantStock} ชิ้น
            </span>
          </div>

          {expiryDate ? (
            <div>
              <div className="mt-sop-20px inline-flex items-center gap-1.5 rounded-full border border-sop-neutral-grayalpha-200 px-3 py-1 text-xs text-sop-neutral-gray-300 lg:mt-0">
                <ClockChainIcon size={{ mobile: 16, desktop: 16 }} color="#6b7280" />
                <span>หมดอายุ : {expiryDate}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
