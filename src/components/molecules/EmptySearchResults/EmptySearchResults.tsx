'use client';

import Link from 'next/link';
import { useSearchRecoverySuggestions } from '@/lib/hooks/useSearchRecoverySuggestions';
import { SuggestedQueryChips, SuggestedQueryChipsSkeleton } from './SuggestedQueryChips';

type EmptySearchResultsProps = {
  message?: string;
  searchQuery?: string;
};

export function EmptySearchResults({
  message = 'ไม่พบสินค้า',
  searchQuery,
}: EmptySearchResultsProps) {
  const trimmedQuery = searchQuery?.trim() ?? '';
  const {
    suggestions,
    loading: recoveryLoading,
    error: recoveryError,
  } = useSearchRecoverySuggestions(trimmedQuery, trimmedQuery.length > 0);

  const showRecoverySection = trimmedQuery.length > 0;

  return (
    <section
      className="w-full py-10 lg:py-14"
      data-testid="empty-search-results"
      aria-label={message}
    >
      <h2 className="sop-headline-md-medium text-sop-neutral-gray-200">{message}</h2>

      {trimmedQuery ? (
        <p className="mt-2 sop-body-md-regular text-sop-neutral-gray-400">
          เราไม่พบผลลัพธ์สำหรับ{' '}
          <span className="sop-body-md-medium text-sop-neutral-gray-200">
            &ldquo;{trimmedQuery}&rdquo;
          </span>
        </p>
      ) : (
        <p className="mt-2 sop-body-md-regular text-sop-neutral-gray-400">ลองค้นหาด้วยคำอื่น</p>
      )}

      {showRecoverySection ? (
        <div className="mt-6" aria-live="polite">
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
    </section>
  );
}
