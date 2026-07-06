'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from '@/lib/hooks/useCategories';

type EmptySearchResultsProps = {
  message?: string;
  showSuggestedCategories?: boolean;
};

export function EmptySearchResults({
  message = 'ไม่พบสินค้า',
  showSuggestedCategories = true,
}: EmptySearchResultsProps) {
  const { categories, loading } = useCategories(!showSuggestedCategories);

  return (
    <div className="text-center w-full my-10" data-testid="empty-search-results">
      <h2 className="sop-headline-md-medium text-sop-neutral-gray-300">{message}</h2>
      <p className="mt-4 sop-body-md-regular text-sop-neutral-gray-400">
        ลองเลือกหมวดหมู่อื่นหรือค้นหาด้วยคำอื่น
      </p>

      {showSuggestedCategories && !loading && categories.length > 0 && (
        <div className="mt-8">
          <p className="sop-body-sm-medium text-sop-neutral-gray-300 mb-4">หมวดหมู่แนะนำ</p>
          <ul className="flex flex-wrap justify-center gap-3">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-sop-16px border border-sop-neutral-gray-600 px-4 py-2 sop-body-sm-regular text-sop-primary-500 hover:bg-sop-primary-100"
                >
                  <Image
                    src="/images/placeholder.svg"
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
