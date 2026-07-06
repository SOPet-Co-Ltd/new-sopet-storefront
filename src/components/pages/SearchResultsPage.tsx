'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { ProductListing } from '@/components/sections/ProductListing';
import { ProductListingSkeleton } from '@/components/sections/ProductListing/ProductListingSkeleton';

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return (
      <main className="container lg:px-20 px-4 py-4" data-testid="search-results-page">
        <EmptySearchResults />
      </main>
    );
  }

  return (
    <main className="container lg:px-20 px-4 py-4" data-testid="search-results-page">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductListing search={q} heading={`ผลการค้นหา "${q}"`} />
      </Suspense>
    </main>
  );
}
