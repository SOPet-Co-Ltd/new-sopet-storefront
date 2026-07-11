'use client';

import Link from 'next/link';
import { SearchIcon } from '@/components/atoms/icons/outline/SearchIcon';
import { useCategories } from '@/lib/hooks/useCategories';
import { useSearchRecoverySuggestions } from '@/lib/hooks/useSearchRecoverySuggestions';
import { cn } from '@/lib/utils';
import { SuggestedCategoryGrid, SuggestedCategoryGridSkeleton } from './SuggestedCategoryGrid';
import { SuggestedQueryChips, SuggestedQueryChipsSkeleton } from './SuggestedQueryChips';

type EmptySearchResultsProps = {
  message?: string;
  showSuggestedCategories?: boolean;
  searchQuery?: string;
};

export function EmptySearchResults({
  message = 'ไม่พบสินค้า',
  showSuggestedCategories = true,
  searchQuery,
}: EmptySearchResultsProps) {
  const trimmedQuery = searchQuery?.trim() ?? '';
  const { categories, loading: categoriesLoading } = useCategories(!showSuggestedCategories);
  const {
    suggestions,
    loading: recoveryLoading,
    error: recoveryError,
  } = useSearchRecoverySuggestions(trimmedQuery, trimmedQuery.length > 0);

  const showRecoverySection = trimmedQuery.length > 0;
  const showCategoriesSection =
    showSuggestedCategories && (categoriesLoading || categories.length > 0);
  const showDivider = showRecoverySection && showCategoriesSection;

  return (
    <section
      className="flex w-full justify-center py-8 lg:py-10"
      data-testid="empty-search-results"
      aria-label={message}
    >
      <div className="w-full max-w-2xl rounded-sop-20px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-6 py-10 text-center shadow-[0_8px_32px_rgba(34,34,41,0.06)] sm:px-10 sm:py-12">
        <div className="flex flex-col items-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-sop-primary-100"
            aria-hidden="true"
          >
            <SearchIcon size={{ mobile: 40, desktop: 40 }} className="text-sop-primary-400" />
          </div>

          <h2 className="mt-5 sop-headline-md-medium text-sop-neutral-gray-200">{message}</h2>

          {trimmedQuery ? (
            <p className="mt-2 max-w-md sop-body-md-regular text-sop-neutral-gray-400">
              เราไม่พบผลลัพธ์สำหรับ &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : null}

          <p className="mt-2 max-w-md sop-body-md-regular text-sop-neutral-gray-400">
            ลองเลือกหมวดหมู่อื่นหรือค้นหาด้วยคำอื่น
          </p>
        </div>

        {showRecoverySection ? (
          <div
            className={cn('mt-8', showDivider && 'border-b border-sop-neutral-gray-500 pb-8')}
            aria-live="polite"
          >
            {recoveryLoading ? (
              <SuggestedQueryChipsSkeleton />
            ) : recoveryError ? (
              <p className="sop-body-sm-regular text-sop-neutral-gray-400">
                โหลดคำแนะนำไม่สำเร็จ{' '}
                <Link
                  href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                  className="text-sop-primary-500 underline underline-offset-2 hover:text-sop-primary-600"
                >
                  ลองค้นหาอีกครั้ง
                </Link>
              </p>
            ) : (
              <SuggestedQueryChips suggestions={suggestions} />
            )}
          </div>
        ) : null}

        {showCategoriesSection ? (
          <div className={cn(showRecoverySection && 'mt-8')}>
            <p className="mb-4 sop-body-sm-medium text-sop-neutral-gray-300">หมวดหมู่แนะนำ</p>
            {categoriesLoading ? (
              <SuggestedCategoryGridSkeleton />
            ) : (
              <SuggestedCategoryGrid categories={categories} />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
