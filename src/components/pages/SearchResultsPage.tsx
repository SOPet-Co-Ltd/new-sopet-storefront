'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import { ProductListing } from '@/components/sections/ProductListing';
import { ProductListingSkeleton } from '@/components/sections/ProductListing/ProductListingSkeleton';
import { SearchResultsLayout } from '@/components/sections/SearchResultsLayout';

type SearchResultsContentProps = {
  initialProducts?: ProductsQuery['products']['items'];
  initialTotal?: number;
  initialTotalPages?: number;
};

function SearchResultsContent({
  initialProducts,
  initialTotal,
  initialTotalPages,
}: SearchResultsContentProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';

  return (
    <ProductListing
      search={q || undefined}
      heading={q ? `ผลการค้นหาทั้งหมด "${q}"` : undefined}
      variant="search"
      initialProducts={initialProducts}
      initialTotal={initialTotal}
      initialTotalPages={initialTotalPages}
    />
  );
}

type SearchResultsPageProps = {
  initialProducts?: ProductsQuery['products']['items'];
  initialTotal?: number;
  initialTotalPages?: number;
};

export function SearchResultsPage({
  initialProducts,
  initialTotal,
  initialTotalPages,
}: SearchResultsPageProps = {}) {
  return (
    <main
      className="w-full min-h-[calc(100vh-109px)] px-4 py-4 lg:px-20"
      data-testid="search-results-page"
    >
      <Suspense
        fallback={
          <SearchResultsLayout>
            <ProductListingSkeleton variant="search" />
          </SearchResultsLayout>
        }
      >
        <SearchResultsLayout>
          <SearchResultsContent
            initialProducts={initialProducts}
            initialTotal={initialTotal}
            initialTotalPages={initialTotalPages}
          />
        </SearchResultsLayout>
      </Suspense>
    </main>
  );
}
