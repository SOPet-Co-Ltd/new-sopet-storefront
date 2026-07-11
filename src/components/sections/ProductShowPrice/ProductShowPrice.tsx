import { ProductFlashSaleStrip } from '@/components/molecules/ProductFlashSaleStrip/ProductFlashSaleStrip';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import {
  findVariantByOptions,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';

type ProductShowPriceProps = {
  product: ProductDetail;
  selectedOptions: VariantOptions;
};

function formatPrice(value: number): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductShowPrice({ product, selectedOptions }: ProductShowPriceProps) {
  const selectedVariant = findVariantByOptions(product.variants, selectedOptions);
  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const compareAtPrice = product.compareAtPrice;
  const hasPrice = displayPrice > 0;
  const hasDiscount = compareAtPrice != null && compareAtPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)
    : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-1">
        {hasPrice ? (
          <>
            <span
              className="rounded-sop-8 bg-sop-secondary-500 px-2 py-0 text-sop-base-white sop-headline-sm-medium lg:sop-headline-md-medium"
              data-testid="variant-price"
            >
              ฿{formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="sop-strike-md-regular text-sop-neutral-grayalpha-400 lg:sop-strike-lg-regular">
                ฿{formatPrice(compareAtPrice)}
              </span>
            )}
          </>
        ) : (
          <span className="label-md text-secondary pt-2 pb-4">Not available in your region</span>
        )}
      </div>
      {hasDiscount && discountPercent > 0 && (
        <ProductFlashSaleStrip discountPercent={discountPercent} />
      )}
    </div>
  );
}
