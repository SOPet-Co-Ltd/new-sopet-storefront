'use client';

import { useMemo, useState } from 'react';
import { ProductReviewStars } from '@/components/molecules/ProductReviewStars/ProductReviewStars';
import ProductDetailsVariantSelection from '@/components/organisms/ProductDetailsVariantSelection/ProductDetailsVariantSelection';
import { ProductExpiryDate } from '@/components/sections/ProductExpiryDate/ProductExpiryDate';
import {
  getDefaultSelectedOptions,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { ProductShowPrice } from '@/components/sections/ProductShowPrice/ProductShowPrice';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsProps = {
  product: ProductDetail;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

export function ProductDetails({
  product,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsProps) {
  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    getDefaultSelectedOptions(product.variants),
  );

  const hasAnyPrice = useMemo(() => {
    const firstVariant = product.variants?.[0];
    return (firstVariant?.price ?? product.basePrice) > 0;
  }, [product.basePrice, product.variants]);

  return (
    <div className="flex flex-col gap-4 px-4 lg:gap-8 lg:px-0">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="sop-body-lg-medium text-sop-neutral-gray-300 lg:sop-headline-md-medium">
            {product.name}
          </p>

          <ProductReviewStars
            averageRating={product.averageRating}
            totalReviews={product.reviewCount}
            soldCount={product.soldCount}
          />
        </div>

        {hasAnyPrice ? (
          <ProductShowPrice product={product} selectedOptions={selectedOptions} />
        ) : null}

        <ProductExpiryDate expiryDate={product.expiryDate} />
      </div>

      <ProductDetailsVariantSelection
        product={product}
        selectedOptions={selectedOptions}
        onSelectedOptionsChange={setSelectedOptions}
        onVariantChange={onVariantChange}
        shareModalOpen={shareModalOpen}
        onShareModalOpenChange={onShareModalOpenChange}
      />
    </div>
  );
}
