import { TimeIcon } from '@/components/atoms/icons/filled/TimeIcon';

type ProductFlashSaleStripProps = {
  discountPercent: number;
};

export function ProductFlashSaleStrip({ discountPercent }: ProductFlashSaleStripProps) {
  return (
    <div
      className="mt-3 flex items-center justify-between gap-3 rounded-sop-8px bg-sop-primary-500 px-3 py-2"
      data-testid="product-flash-sale-strip"
    >
      <span className="sop-body-xs-regular md:sop-body-sm-regular text-sop-base-white">
        Flash Sale ลด {discountPercent}%
      </span>
      <div className="flex items-center gap-1.5 text-sop-base-white">
        <TimeIcon size={{ mobile: 14, desktop: 16 }} color="#FFFFFF" />
        <span className="sop-body-xs-regular md:sop-body-sm-regular tabular-nums">23:59:59</span>
      </div>
    </div>
  );
}
