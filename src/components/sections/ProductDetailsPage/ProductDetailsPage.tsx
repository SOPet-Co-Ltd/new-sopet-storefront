'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs';
import { ProductDetails } from '@/components/organisms/ProductDetails/ProductDetails';
import ProductDetailsSeller from '@/components/organisms/ProductDetailsSeller';
import ProductDetailsSellerReviews from '@/components/organisms/ProductDetailsSellerReviews';
import { ProductGallery } from '@/components/organisms/ProductGallery/ProductGallery';
import { ProductDetailDescription } from '@/components/sections/ProductDetailDescription/ProductDetailDescription';
import { ProductDetailWarning } from '@/components/sections/ProductDetailWarning/ProductDetailWarning';
import { HomeProductSection } from '@/components/sections/HomeProductSection/HomeProductSection';
import type { ProductByIdQuery } from '@/lib/graphql/generated/graphql';
import { useProduct } from '@/lib/hooks/useProduct';
import { useReviews } from '@/lib/hooks/useReviews';

type ProductDetailsPageProps = {
  productId: string;
  initialProduct?: ProductByIdQuery['product'];
};

function computeReviewSummary(
  productReviews: { rating: number }[],
  productAverageRating: number,
  productReviewCount: number,
) {
  if (productReviews.length === 0) {
    return {
      averageRating: productAverageRating,
      totalReviews: productReviewCount,
    };
  }

  const totalReviews = productReviews.length;
  const averageRating =
    Math.round(
      (productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10,
    ) / 10;

  return { averageRating, totalReviews };
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

export default function ProductDetailsPage({
  productId,
  initialProduct,
}: ProductDetailsPageProps) {
  const { product: fetchedProduct, loading, error } = useProduct({
    mode: 'id',
    id: productId,
  });
  const product = fetchedProduct ?? initialProduct ?? null;
  const showLoading = !initialProduct && loading;

  const { productReviews, loading: reviewsLoading } = useReviews({
    productId: product?.id,
    storeId: product?.storeId,
    skip: !product,
  });

  const reviewSummary = useMemo(
    () =>
      product
        ? computeReviewSummary(productReviews, product.averageRating, product.reviewCount)
        : { averageRating: 0, totalReviews: 0 },
    [product, productReviews],
  );

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isNotFound = Boolean(
    error &&
      CombinedGraphQLErrors.is(error) &&
      error.errors.some((graphError) => graphError.extensions?.code === 'PRODUCT_NOT_FOUND'),
  );

  if (showLoading) {
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

  const breadcrumbs = [
    { label: 'หน้าแรก', path: '/' },
    { label: product.name, path: `/product/${product.id}` },
  ];

  return (
    <div data-testid="product-details-page" className="flex flex-col gap-2 md:gap-5">
      <div className="hidden py-2 lg:block">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="-mx-4 grid grid-cols-1 gap-4 rounded-none bg-sop-base-white px-0 pb-4 md:mx-0 md:px-0 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-4 lg:rounded-sop-8 lg:px-[10px] lg:py-5">
        <ProductGallery images={product.images} thumbnailUrl={product.thumbnailUrl} />
        <ProductDetails
          product={product}
          shareModalOpen={shareModalOpen}
          onShareModalOpenChange={setShareModalOpen}
        />
      </div>

      <ProductDetailsSeller store={product.store} />

      <ProductDetailDescription description={product.description} />

      <ProductDetailWarning warning={product.warning} />

      <ProductDetailsSellerReviews
        productReviews={productReviews}
        averageRating={reviewSummary.averageRating}
        totalReviews={reviewSummary.totalReviews}
        loading={reviewsLoading}
      />

      <div className="mt-2 flex flex-col gap-8 md:mt-3">
        <HomeProductSection
          heading="สินค้าจากร้านเดียวกัน"
          storeId={product.storeId}
          excludeProductId={product.id}
          sameStoreOnly
          layout="grid"
          viewAllHref={product.store ? `/sellers/${product.store.slug}` : '/categories'}
        />

        <HomeProductSection
          heading="สินค้าที่คุณอาจจะชอบ"
          referenceProduct={{
            id: product.id,
            category: product.category,
            tags: product.tags,
            storeId: product.storeId,
          }}
          layout="grid"
          viewAllHref={product.category ? `/categories/${product.category}` : '/categories'}
        />
      </div>
    </div>
  );
}
