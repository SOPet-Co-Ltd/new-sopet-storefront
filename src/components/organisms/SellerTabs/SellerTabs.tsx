'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { ProductListing } from '@/components/sections/ProductListing';
import { ProductListingSkeleton } from '@/components/sections/ProductListing/ProductListingSkeleton';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/hooks/useStore';
import { SellerHeading } from '@/components/organisms/SellerHeading';
import { SellerReviewTab } from '@/components/organisms/SellerReviewTab';

export type SellerTab = 'products' | 'reviews';

type SellerTabsProps = {
  activeTab: SellerTab;
  storeHandle: string;
  storeId: string;
};

type TabItem = {
  label: SellerTab;
  href: string;
};

function TabTrigger({ label, isActive }: { label: SellerTab; isActive: boolean }) {
  return (
    <p
      className={cn(
        'capitalize cursor-pointer px-2 pb-2 sop-body-md-regular text-sop-neutral-gray-300',
        isActive && 'border-b border-sop-primary-500 font-bold',
      )}
    >
      {label}
    </p>
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
  return <div>{children}</div>;
}

export function SellerTabs({ activeTab, storeHandle, storeId }: SellerTabsProps) {
  const tabs: TabItem[] = [
    { label: 'products', href: `/sellers/${storeHandle}` },
    { label: 'reviews', href: `/sellers/${storeHandle}/reviews` },
  ];

  return (
    <div className="mt-8" data-testid="seller-tabs">
      <nav className="flex gap-4 w-full" aria-label="Seller page tabs">
        {tabs.map(({ label, href }) => (
          <Link key={label} href={href} aria-current={activeTab === label ? 'page' : undefined}>
            <TabTrigger label={label} isActive={activeTab === label} />
          </Link>
        ))}
      </nav>

      <TabContent activeTab={activeTab} value="products">
        <Suspense fallback={<ProductListingSkeleton />}>
          <ProductListing storeId={storeId} />
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
};

function SellerStorefrontSkeleton() {
  return (
    <div aria-busy="true" data-testid="seller-storefront-skeleton">
      <div className="border rounded-xs p-4 h-32 bg-sop-neutral-gray-600 animate-pulse" />
      <div className="mt-8 h-10 w-48 bg-sop-neutral-gray-600 animate-pulse" />
    </div>
  );
}

export function SellerStorefront({ handle, activeTab }: SellerStorefrontProps) {
  const { store, loading, error } = useStore({ slug: handle });

  if (loading) {
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
      <SellerTabs activeTab={activeTab} storeHandle={store.slug} storeId={store.id} />
    </>
  );
}
