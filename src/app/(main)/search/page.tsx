import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { ProductListingSkeleton } from '@/components/sections/ProductListing/ProductListingSkeleton';

export const metadata: Metadata = {
  title: 'ค้นหาสินค้า',
  description:
    'ค้นหายาและสินค้าสำหรับสัตว์เลี้ยงจากร้านค้าและโรงพยาบาลที่ร่วมรายการบน Sopet',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="container lg:px-20 px-4 py-4">
          <ProductListingSkeleton />
        </main>
      }
    >
      <SearchResultsPage />
    </Suspense>
  );
}
