'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs';
import { ProductDetails } from '@/components/organisms/ProductDetails/ProductDetails';
import ProductDetailsSeller from '@/components/organisms/ProductDetailsSeller';
import ProductDetailsSellerReviews from '@/components/organisms/ProductDetailsSellerReviews';
import { ProductGallery } from '@/components/organisms/ProductGallery/ProductGallery';
import { ProductDetailDescription } from '@/components/sections/ProductDetailDescription/ProductDetailDescription';
import { ProductDetailWarning } from '@/components/sections/ProductDetailWarning/ProductDetailWarning';
import { HomeProductSection } from '@/components/sections/HomeProductSection/HomeProductSection';
import { useProduct } from '@/lib/hooks/useProduct';
import { useReviews } from '@/lib/hooks/useReviews';

type ProductDetailsPageProps = {
  productId: string;
};

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

  const { productReviews, loading: reviewsLoading } = useReviews({
    productId: product?.id,
    storeId: product?.storeId,
    skip: !product,
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  const breadcrumbs = [
    { label: 'หน้าแรก', path: '/' },
    { label: product.name, path: `/product/${product.id}` },
  ];

  return (
    <div data-testid="product-details-page">
      <div className="py-4 lg:block hidden">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="bg-sop-base-white grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] grid-cols-1 gap-4 lg:p-6 lg:rounded-sop-16px rounded-none pb-4 md:mt-0 -mx-4 md:mx-0 px-0 md:px-0">
        <ProductGallery
          images={product.images}
          thumbnailUrl={product.thumbnailUrl}
          productName={product.name}
          onShareClick={() => setShareModalOpen(true)}
          onWishlistClick={() => toast.message('ฟีเจอร์รายการโปรดจะเปิดใช้งานเร็วๆ นี้')}
        />
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
        averageRating={product.averageRating}
        totalReviews={product.reviewCount}
        loading={reviewsLoading}
      />

      <HomeProductSection
        heading="สินค้าจากร้านเดียวกัน"
        storeId={product.storeId}
        excludeProductId={product.id}
      />

      <HomeProductSection
        heading="สินค้าที่คุณอาจจะชอบ"
        excludeProductId={product.id}
        layout="grid"
      />
    </div>
  );
}
