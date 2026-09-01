import { ProductFlashSaleStrip } from '@/components/molecules/ProductFlashSaleStrip/ProductFlashSaleStrip';
import {
  computeSaleUnitPrice,
  pickCampaignItem,
  resolveCompareAtPrice,
} from '@/lib/catalog/resolve-compare-at-price';
import { useActiveSaleCampaignItems } from '@/lib/hooks/useActiveSaleCampaignItems';
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
  const catalogPrice = selectedVariant?.price ?? product.basePrice;

  const { items: campaignItems } = useActiveSaleCampaignItems(product.storeId);
  const campaignItem = pickCampaignItem(campaignItems, product.id, selectedVariant?.id ?? null);
  const saleUnit = computeSaleUnitPrice(catalogPrice, campaignItem?.discountPercent);
  const displayPrice = saleUnit ?? catalogPrice;
  const compareAtPrice = resolveCompareAtPrice({
    sellPrice: catalogPrice,
    campaignItem,
    variantCompareAt: selectedVariant?.compareAtPrice ?? null,
    productCompareAt: product.compareAtPrice ?? null,
  });

  const hasPrice = displayPrice > 0;
  const hasDiscount = compareAtPrice != null && compareAtPrice > displayPrice;
  const discountPercent =
    campaignItem?.discountPercent != null && saleUnit != null
      ? Math.round(campaignItem.discountPercent)
      : hasDiscount
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
      {hasDiscount && saleUnit != null ? (
        <p
          className="mt-1.5 sop-body-xs-regular text-sop-neutral-grayalpha-500"
          data-testid="payable-price-hint"
        >
          ราคาที่ไฮไลต์คือราคาที่ชำระแล้วหลังส่วนลดแคมเปญ — โปรโมชันตอนเช็คเอาต์ยังใช้ต่อท้ายได้
        </p>
      ) : null}
      {hasDiscount && discountPercent > 0 && campaignItem ? (
        <ProductFlashSaleStrip
          discountPercent={discountPercent}
          expiresAt={campaignItem.expiresAt}
          campaignName={campaignItem.campaignName}
        />
      ) : null}
    </div>
  );
}
