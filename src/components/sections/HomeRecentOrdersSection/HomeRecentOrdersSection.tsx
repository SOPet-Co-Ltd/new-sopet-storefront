'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { OrdersDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import ProductCard from '@/components/organisms/ProductCard';

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
  const { data, loading, error } = useQuery(OrdersDocument, {
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

  const recentProducts = (data?.orders ?? [])
    .flatMap((order) => order.items)
    .reduce<
      Array<{
        id: string;
        name: string;
        slug: string;
        basePrice: number;
        thumbnailUrl: string | null;
      }>
    >((acc, item) => {
      const slug = item.productName
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '');

      if (acc.some((entry) => entry.id === item.id)) {
        return acc;
      }

      acc.push({
        id: item.id,
        name: item.productName,
        slug: slug || item.id,
        basePrice: item.unitPrice,
        thumbnailUrl: null,
      });

      return acc;
    }, [])
    .slice(0, 12);

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
            <li key={product.id} className="shrink-0">
              <ProductCard product={product} compact compactLayout="recent" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
