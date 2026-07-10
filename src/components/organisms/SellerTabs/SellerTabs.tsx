'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { ProductListing } from '@/components/sections/ProductListing';
import { ProductListingSkeleton } from '@/components/sections/ProductListing/ProductListingSkeleton';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import type { StoreDetail } from '@/lib/hooks/useStore';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/hooks/useStore';
import { SellerHeading } from '@/components/organisms/SellerHeading';
import { SellerReviewTab } from '@/components/organisms/SellerReviewTab';

export type SellerTab = 'products' | 'reviews';

const TAB_LABELS: Record<SellerTab, string> = {
  products: 'สินค้า',
  reviews: 'รีวิว',
};

type SellerTabsProps = {
  activeTab: SellerTab;
  storeHandle: string;
  storeId: string;
  initialProducts?: ProductsQuery['products']['items'];
};

type TabItem = {
  label: SellerTab;
  href: string;
};

function SellerTabLink({
  tab,
  href,
  isActive,
  onPrefetch,
}: {
  tab: SellerTab;
  href: string;
  isActive: boolean;
  onPrefetch: () => void;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-current={isActive ? 'page' : undefined}
      aria-selected={isActive}
      className={cn(
        'rounded-sop-8px px-4 py-2 sop-body-sm-regular transition-colors',
        isActive
          ? 'bg-sop-primary-500 text-sop-base-white shadow-sm'
          : 'text-sop-primary-700 hover:bg-sop-primary-50 hover:text-sop-primary-600',
      )}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      {TAB_LABELS[tab]}
    </Link>
  );
}

function TabContent({
  activeTab,
  value,
  children,
}: {
  activeTab: SellerTab;
  value: SellerTab;
  children: React.ReactNode;
}) {
  if (activeTab !== value) return null;
  return <div className="mt-6">{children}</div>;
}

export function SellerTabs({
  activeTab,
  storeHandle,
  storeId,
  initialProducts,
}: SellerTabsProps) {
  const tabs: TabItem[] = [
    { label: 'products', href: `/sellers/${storeHandle}` },
    { label: 'reviews', href: `/sellers/${storeHandle}/reviews` },
  ];

  const handleTabPrefetch = (tab: SellerTab) => {
    if (tab === activeTab || tab !== 'products') return;
    prefetchProductsListing({ storeId, page: 1, limit: 24 });
  };

  return (
    <div className="mt-6" data-testid="seller-tabs">
      <nav
        className="inline-flex rounded-sop-8px bg-sop-primary-100 p-1"
        aria-label="แท็บหน้าร้านค้า"
        role="tablist"
      >
        {tabs.map(({ label, href }) => (
          <SellerTabLink
            key={label}
            tab={label}
            href={href}
            isActive={activeTab === label}
            onPrefetch={() => handleTabPrefetch(label)}
          />
        ))}
      </nav>

      <TabContent activeTab={activeTab} value="products">
        <Suspense fallback={<ProductListingSkeleton />}>
          <ProductListing storeId={storeId} initialProducts={initialProducts} />
        </Suspense>
      </TabContent>

      <TabContent activeTab={activeTab} value="reviews">
        <SellerReviewTab storeId={storeId} />
      </TabContent>
    </div>
  );
}

type SellerStorefrontProps = {
  handle: string;
  activeTab: SellerTab;
  initialStore?: StoreDetail | null;
  initialProducts?: ProductsQuery['products']['items'];
};

function SellerStorefrontSkeleton() {
  return (
    <div aria-busy="true" data-testid="seller-storefront-skeleton">
      <div className="overflow-hidden rounded-sop-16 border border-sop-primary-200 bg-sop-base-white">
        <div className="h-32 animate-pulse bg-sop-primary-100 md:h-40" />
        <div className="flex items-center gap-4 bg-sop-base-white p-4 md:p-5">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full border-2 border-sop-primary-200 bg-sop-primary-100" />
          <div className="h-6 w-48 animate-pulse rounded-sop-8 bg-sop-primary-100" />
        </div>
      </div>
      <div className="mt-6 inline-flex h-10 w-52 animate-pulse rounded-sop-8px bg-sop-primary-100 p-1">
        <div className="h-full w-1/2 rounded-sop-8px bg-sop-primary-200" />
      </div>
    </div>
  );
}

export function SellerStorefront({
  handle,
  activeTab,
  initialStore,
  initialProducts,
}: SellerStorefrontProps) {
  const { store: fetchedStore, loading, error } = useStore({ slug: handle });
  const store = fetchedStore ?? initialStore ?? null;
  const showLoading = !initialStore && loading;

  if (showLoading) {
    return <SellerStorefrontSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8 text-center" data-testid="seller-storefront-error">
        <p className="sop-body-md-regular text-sop-neutral-gray-300">
          โหลดข้อมูลร้านค้าไม่สำเร็จ
        </p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="py-8 text-center" data-testid="seller-storefront-not-found">
        <p className="sop-body-md-regular text-sop-neutral-gray-300">ไม่พบร้านค้า</p>
      </div>
    );
  }

  return (
    <>
      <SellerHeading store={store} />
      <SellerTabs
        activeTab={activeTab}
        storeHandle={store.slug}
        storeId={store.id}
        initialProducts={initialProducts}
      />
    </>
  );
}
