'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { LatestPurchaseProductsDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import ProductCard from '@/components/organisms/ProductCard';

const RECENT_ORDERS_LIMIT = 12;
const SECTION_HEADING_CLASS = 'sop-body-lg-medium text-sop-neutral-gray-200';

function RecentOrdersSkeleton() {
  return (
    <div className="flex min-w-max gap-5 pb-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[216px] w-[136px] shrink-0 rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

type HomeRecentOrdersSectionProps = {
  viewAllHref?: string;
};

export function HomeRecentOrdersSection({
  viewAllHref = '/user/orders',
}: HomeRecentOrdersSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery(LatestPurchaseProductsDocument, {
    variables: { limit: RECENT_ORDERS_LIMIT },
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <section className="w-full" aria-busy="true" data-testid="home-recent-orders">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={SECTION_HEADING_CLASS}>ซื้อล่าสุด</h2>
        </div>
        <div className="w-full overflow-x-auto">
          <RecentOrdersSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  const recentProducts = data?.latestPurchaseProducts ?? [];

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full" data-testid="home-recent-orders">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={SECTION_HEADING_CLASS}>ซื้อล่าสุด</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 sop-link-md-regular text-sop-neutral-gray-300 underline"
        >
          ดูทั้งหมด
        </Link>
      </div>
      <div className="w-full overflow-x-auto">
        <ul className="flex min-w-max gap-5 pb-2">
          {recentProducts.map((product) => (
            <li key={product.id} className="w-[136px] shrink-0">
              <ProductCard product={product} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
