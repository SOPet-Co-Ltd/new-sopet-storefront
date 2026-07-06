'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { ReviewStarIcon } from '@/components/atoms/icons/filled/ReviewStarIcon';
import ProductAdditionalAttributes from '@/components/organisms/ProductAdditionalAttributes';
import ProductDetailsFooter from '@/components/organisms/ProductDetailsFooter';
import ProductDetailsHeader from '@/components/organisms/ProductDetailsHeader';
import ProductDetailsMeasurements from '@/components/organisms/ProductDetailsMeasurements';
import ProductDetailsSeller from '@/components/organisms/ProductDetailsSeller';
import ProductDetailsSellerReviews from '@/components/organisms/ProductDetailsSellerReviews';
import ProductDetailsShipping from '@/components/organisms/ProductDetailsShipping';
import ProductDetailsVariantSelection from '@/components/organisms/ProductDetailsVariantSelection';
import { useProduct } from '@/lib/hooks/useProduct';
import { useReviews } from '@/lib/hooks/useReviews';

type ProductDetailsPageProps = {
  productId: string;
};

function formatSoldCount(count: number): string {
  if (count < 1000) return count.toString();

  const units = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(count) / 3);
  const scaled = count / 10 ** (magnitude * 3);
  const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);

  return `${formatted}${units[magnitude]}`;
}

function ProductReviewSummary({
  averageRating,
  reviewCount,
  soldCount,
}: {
  averageRating: number;
  reviewCount: number;
  soldCount: number;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
      <div className="flex gap-1">
        <ReviewStarIcon size={{ mobile: 16, desktop: 24 }} filled />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="md:sop-body-lg-regular sop-body-sm-regular text-sop-neutral-gray-400">
          {averageRating} ({reviewCount} รีวิว)
        </p>
        <div className="w-px h-6 bg-sop-neutral-gray-400" />
        <p className="md:sop-body-lg-regular sop-body-sm-regular text-sop-neutral-gray-400">
          ขายแล้ว {formatSoldCount(soldCount)} ชิ้น
        </p>
      </div>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div data-testid="product-details-loading" className="animate-pulse">
      <div className="grid lg:grid-cols-[4fr_6fr] gap-4">
        <div className="aspect-square rounded-sop-16px bg-sop-neutral-gray-500" />
        <div className="flex flex-col gap-4 px-4">
          <div className="h-8 w-3/4 rounded bg-sop-neutral-gray-500" />
          <div className="h-6 w-1/2 rounded bg-sop-neutral-gray-500" />
          <div className="h-10 w-full rounded bg-sop-neutral-gray-500" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { product, loading, error } = useProduct({
    mode: 'id',
    id: productId,
  });

  const {
    productReviews,
    storeReviewSummary,
    loading: reviewsLoading,
  } = useReviews({
    productId: product?.id,
    storeId: product?.storeId,
    skip: !product,
  });

  const defaultVariant = product?.variants?.[0];
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedStock, setSelectedStock] = useState<number | null>(null);

  const footerPrice = selectedPrice ?? product?.basePrice ?? 0;
  const footerDisabled = (selectedStock ?? defaultVariant?.stockQuantity ?? 0) <= 0;

  const isNotFound = Boolean(
    error &&
      CombinedGraphQLErrors.is(error) &&
      error.errors.some((graphError) => graphError.extensions?.code === 'PRODUCT_NOT_FOUND'),
  );

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product && isNotFound) {
    notFound();
  }

  if (!product) {
    return (
      <div data-testid="product-details-error" className="p-8 text-center">
        <p className="sop-body-md-regular text-sop-neutral-gray-400">
          ไม่สามารถโหลดข้อมูลสินค้าได้
        </p>
      </div>
    );
  }

  return (
    <div data-testid="product-details-page">
      <div className="bg-sop-base-white grid lg:grid-cols-[4fr_6fr] grid-cols-1 gap-4 lg:p-4 lg:rounded-lg rounded-none pb-4">
        <ProductDetailsHeader
          productName={product.name}
          images={product.images}
          thumbnailUrl={product.thumbnailUrl}
        />

        <div className="flex flex-col px-4 gap-6">
          <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-neutral-gray-300">
            {product.name}
          </p>

          <ProductReviewSummary
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
            soldCount={product.soldCount}
          />

          <ProductDetailsVariantSelection
            product={product}
            onVariantChange={(_variantId, price, stockQuantity) => {
              setSelectedPrice(price);
              setSelectedStock(stockQuantity);
            }}
          />

          {product.description && (
            <div className="sop-body-sm-regular text-sop-neutral-gray-400 whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          <ProductDetailsMeasurements />
          <ProductDetailsShipping />
          <ProductAdditionalAttributes tags={product.tags} warning={product.warning} />
        </div>
      </div>

      <ProductDetailsSeller store={product.store} />

      <ProductDetailsSellerReviews
        productReviews={productReviews}
        storeReviewSummary={storeReviewSummary}
        loading={reviewsLoading}
      />

      <ProductDetailsFooter price={footerPrice} disabled={footerDisabled} />
    </div>
  );
}
