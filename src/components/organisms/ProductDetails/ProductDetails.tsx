'use client';

import { useMemo, useState } from 'react';
import { ProductReviewStars } from '@/components/molecules/ProductReviewStars/ProductReviewStars';
import ProductDetailsVariantSelection from '@/components/organisms/ProductDetailsVariantSelection/ProductDetailsVariantSelection';
import { ProductExpiryDate } from '@/components/sections/ProductExpiryDate/ProductExpiryDate';
import {
  getDefaultVariant,
  resolveSelectedOptionsFromSearchParams,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { ProductShowPrice } from '@/components/sections/ProductShowPrice/ProductShowPrice';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsProps = {
  product: ProductDetail;
  /** Raw Next.js `searchParams` so shared links like `?test=test` select on first paint. */
  variantSearchParams?: Record<string, string | string[] | undefined>;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

function toSearchParamsGetter(
  raw: Record<string, string | string[] | undefined> | undefined,
): Pick<URLSearchParams, 'get'> | null {
  if (!raw) return null;

  return {
    get(key: string) {
      const value = raw[key];
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      return null;
    },
  };
}

function readClientSearchParams(): Pick<URLSearchParams, 'get'> | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
}

export function ProductDetails({
  product,
  variantSearchParams,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsProps) {
  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    resolveSelectedOptionsFromSearchParams(
      product.variants,
      toSearchParamsGetter(variantSearchParams) ?? readClientSearchParams(),
    ),
  );

  const hasAnyPrice = useMemo(() => {
    const defaultVariant = getDefaultVariant(product.variants);
    return (defaultVariant?.price ?? product.basePrice) > 0;
  }, [product.basePrice, product.variants]);

  return (
    <div className="flex flex-col gap-4 px-4 lg:gap-8 lg:px-0">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1
            id="product-title"
            className="sop-body-lg-medium text-sop-neutral-gray-300 lg:sop-headline-md-medium"
          >
            {product.name}
          </h1>

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
