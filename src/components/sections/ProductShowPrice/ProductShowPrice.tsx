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
      <div className="flex flex-wrap items-center gap-2">
        {hasPrice ? (
          <>
            <span
              className="md:sop-headline-md-medium sop-headline-sm-medium md:bg-transparent md:text-sop-secondary-500 md:px-0 text-sop-base-white bg-sop-secondary-500 px-2 py-0.5 rounded-sop-8px"
              data-testid="variant-price"
            >
              ฿{displayPrice.toLocaleString('th-TH')}
            </span>
            {hasDiscount && (
              <span className="md:sop-strike-lg-regular sop-strike-md-regular text-sop-neutral-grayalpha-400">
                ฿{compareAtPrice.toLocaleString('th-TH')}
              </span>
            )}
          </>
        ) : (
          <span className="label-md text-secondary pt-2 pb-4">
            Not available in your region
          </span>
        )}
      </div>
      {hasDiscount && discountPercent > 0 && (
        <ProductFlashSaleStrip discountPercent={discountPercent} />
      )}
    </div>
  );
}
