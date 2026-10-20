'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { notFound } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/atoms/Breadcrumbs/Breadcrumbs';
import { ProductDetails } from '@/components/organisms/ProductDetails/ProductDetails';
import ProductDetailsSeller from '@/components/organisms/ProductDetailsSeller';
import ProductDetailsSellerReviews from '@/components/organisms/ProductDetailsSellerReviews';
import { ProductFloatingBuyCard } from '@/components/organisms/ProductFloatingBuyCard';
import {
  getDefaultVariant,
  readClientSearchParams,
  resolveSelectedOptionsFromSearchParams,
  toSearchParamsGetter,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { ProductGallery } from '@/components/organisms/ProductGallery/ProductGallery';
import { ProductDetailDescription } from '@/components/sections/ProductDetailDescription/ProductDetailDescription';
import { ProductDetailWarning } from '@/components/sections/ProductDetailWarning/ProductDetailWarning';
import { HomeProductSection } from '@/components/sections/HomeProductSection/HomeProductSection';
import { trackViewItem } from '@/lib/analytics';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import type { ProductByIdQuery } from '@/lib/graphql/generated/graphql';
import { useCategories } from '@/lib/hooks/useCategories';
import { useProduct } from '@/lib/hooks/useProduct';
import { useReviews, type ProductReview } from '@/lib/hooks/useReviews';
import { buildCategoryHref, resolveCategoryBySlug } from '@/lib/routing/categoryRoutes';
import { cn } from '@/lib/utils';

type ProductDetailsPageProps = {
  productId: string;
  initialProduct?: ProductByIdQuery['product'];
  /** Server-fetched reviews so review text is present in the first HTML. */
  initialProductReviews?: ProductReview[];
  variantSearchParams?: Record<string, string | string[] | undefined>;
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

export default function ProductDetailsPage({
  productId,
  initialProduct,
  initialProductReviews,
  variantSearchParams,
}: ProductDetailsPageProps) {
  const {
    product: fetchedProduct,
    loading,
    error,
  } = useProduct({
    mode: 'id',
    id: productId,
  });
  const product = fetchedProduct ?? initialProduct ?? null;
  const showLoading = !initialProduct && loading;

  const { productReviews, loading: reviewsLoading } = useReviews({
    productId: product?.id,
    storeId: product?.storeId,
    skip: !product,
    initialProductReviews,
  });

  // Keep the visible summary on product-level aggregates so it matches JSON-LD.
  const reviewSummary = useMemo(
    () =>
      product
        ? { averageRating: product.averageRating, totalReviews: product.reviewCount }
        : { averageRating: 0, totalReviews: 0 },
    [product],
  );

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    resolveSelectedOptionsFromSearchParams(
      product?.variants,
      toSearchParamsGetter(variantSearchParams) ?? readClientSearchParams(),
    ),
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isFloatingBuyVisible, setIsFloatingBuyVisible] = useState(false);
  const mainArticleRef = useRef<HTMLElement | null>(null);

  const handleFloatingBuyVisibilityChange = useCallback((visible: boolean) => {
    setIsFloatingBuyVisible(visible);
  }, []);

  const handleVariantChange = (
    _variantId: string | null,
    _price: number,
    _stockQuantity: number,
    quantity: number,
  ) => {
    setSelectedQuantity(quantity);
  };

  const { categories } = useCategories();
  const trackedViewItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product || trackedViewItemIdRef.current === product.id) {
      return;
    }
    trackedViewItemIdRef.current = product.id;

    const defaultVariant = getDefaultVariant(product.variants);
    const price = defaultVariant?.price ?? product.basePrice;

    trackViewItem({
      value: price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.store?.name ?? undefined,
          item_category: product.category ?? undefined,
          item_variant: defaultVariant?.id,
          price,
          quantity: 1,
        },
      ],
    });
  }, [product]);

  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (!product) {
      return [];
    }

    const items: BreadcrumbItem[] = [{ label: 'หน้าแรก', path: '/' }];
    const resolvedCategory =
      product.category != null ? resolveCategoryBySlug(categories, product.category) : undefined;

    if (resolvedCategory) {
      items.push({
        label: resolvedCategory.name,
        path: buildCategoryHref(resolvedCategory.slug),
      });
    }

    items.push({ label: product.name, path: `/product/${product.id}` });
    return items;
  }, [categories, product]);

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
          {error
            ? getErrorMessage(error, 'ไม่สามารถโหลดข้อมูลสินค้าได้')
            : 'ไม่สามารถโหลดข้อมูลสินค้าได้'}
        </p>
      </div>
    );
  }

  const breadcrumbs = breadcrumbItems;

  return (
    <div
      data-testid="product-details-page"
      className="mx-auto flex w-full min-w-0 max-w-[1064px] flex-col gap-2 md:gap-5"
    >
      <div className="py-2">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <article aria-labelledby="product-title" ref={mainArticleRef}>
        <div className="-mx-4 grid min-w-0 grid-cols-1 gap-6 overflow-x-hidden lg:rounded-sop-32px md:rounded-sop-32px rounded-none border border-[#F0EDF5] bg-sop-base-white p-4 shadow-xs md:mx-0 md:p-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-8 lg:p-8">
          <ProductGallery images={product.images} thumbnailUrl={product.thumbnailUrl} />
          <ProductDetails
            product={product}
            variantSearchParams={variantSearchParams}
            selectedOptions={selectedOptions}
            onSelectedOptionsChange={setSelectedOptions}
            onVariantChange={handleVariantChange}
            shareModalOpen={shareModalOpen}
            onShareModalOpenChange={setShareModalOpen}
          />
        </div>
      </article>

      <div
        className={cn(
          'grid grid-cols-1 items-start transition-[grid-template-columns,gap] duration-300 ease-out',
          isFloatingBuyVisible
            ? 'lg:grid-cols-[1fr_360px] lg:gap-8'
            : 'lg:grid-cols-[1fr_0px] lg:gap-0',
        )}
      >
        <div className="flex min-w-0 flex-col gap-2 md:gap-5">
          <div className="-mx-4 md:mx-0">
            <ProductDetailsSeller store={product.store} />
          </div>

          <ProductDetailDescription description={product.description} />

          <ProductDetailWarning warning={product.warning} />

          <ProductDetailsSellerReviews
            productReviews={productReviews}
            averageRating={reviewSummary.averageRating}
            totalReviews={reviewSummary.totalReviews}
            loading={reviewsLoading}
          />
        </div>

        <aside
          aria-label="สั่งซื้อด่วน"
          className={cn(
            'sticky top-36 z-30 hidden min-w-0 bg-transparent lg:block',
            // Clip only while collapsed so the 360px card cannot force the track open;
            // leave overflow visible when open so the card shadow is not cut off.
            !isFloatingBuyVisible && 'overflow-hidden',
          )}
        >
          <ProductFloatingBuyCard
            product={product}
            selectedOptions={selectedOptions}
            productQuantity={selectedQuantity}
            triggerRef={mainArticleRef}
            onVisibilityChange={handleFloatingBuyVisibilityChange}
          />
        </aside>
      </div>

      <div className="mt-2 flex flex-col gap-8 md:mt-3">
        <HomeProductSection
          heading="สินค้าจากร้านเดียวกัน"
          storeId={product.storeId}
          excludeProductId={product.id}
          sameStoreOnly
          layout="grid"
          viewAllHref={product.store ? `/sellers/${product.store.slug}` : '/products'}
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
          viewAllHref={`/recommend?from=${product.id}`}
        />
      </div>
    </div>
  );
}
