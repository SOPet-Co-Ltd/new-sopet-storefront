'use client';

import { useQuery } from '@apollo/client/react';
import { OrdersDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import { HomeSectionProductCard } from '@/components/sections/HomeProductSection/HomeSectionProductCard';

function RecentOrdersSkeleton() {
  return (
    <div className="flex gap-3 lg:gap-4 pb-2 min-w-max" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="shrink-0 w-[168px] h-[200px] rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

export function HomeRecentOrdersSection() {
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
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">ซื้อล่าสุด</h2>
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
      <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">ซื้อล่าสุด</h2>
      <div className="w-full overflow-x-auto">
        <ul className="flex gap-3 lg:gap-4 pb-2 min-w-max">
          {recentProducts.map((product) => (
            <li
              key={product.id}
              style={{
                zoom: 0.6,
              }}
            >
              <HomeSectionProductCard product={product} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
