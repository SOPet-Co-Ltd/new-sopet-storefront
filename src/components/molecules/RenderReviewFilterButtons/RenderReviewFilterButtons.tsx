'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type RenderReviewFilterButtonsProps = {
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalReviews: number;
  withImageCount: number;
  withCommentCount: number;
  selectedRating?: string | null;
  onFilterChange?: (value: string | null) => void;
};

const RATING_QUERY_KEY = 'prf';

function formatReviewCount(count: number): string {
  if (count < 1000) return String(count);
  const k = count / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

export function RenderReviewFilterButtons({
  starCounts,
  totalReviews,
  withImageCount,
  withCommentCount,
  selectedRating: controlledRating,
  onFilterChange,
}: RenderReviewFilterButtonsProps) {
  const searchParams = useSearchParams();
  const initialRating = searchParams.get(RATING_QUERY_KEY);
  const [uncontrolledRating, setUncontrolledRating] = useState<string | null>(initialRating);
  const isControlled = onFilterChange !== undefined;
  const selectedRating = isControlled
    ? (controlledRating ?? null)
    : (uncontrolledRating ?? searchParams.get(RATING_QUERY_KEY));

  const { allFilter, starFilters, miscFilters } = useMemo(() => {
    const starFilterButtons = [5, 4, 3, 2, 1].map((rating) => ({
      value: String(rating),
      label: `${rating} ดาว (${formatReviewCount(starCounts[rating as 1 | 2 | 3 | 4 | 5])})`,
    }));

    const miscFilterButtons = [
      { value: 'wi', label: `มีรูปภาพ (${formatReviewCount(withImageCount)})` },
      { value: 'oc', label: `ความคิดเห็น (${formatReviewCount(withCommentCount)})` },
    ];

    return {
      allFilter: {
        value: null as string | null,
        label: `ทั้งหมด (${formatReviewCount(totalReviews)})`,
      },
      starFilters: starFilterButtons,
      miscFilters: miscFilterButtons,
    };
  }, [starCounts, totalReviews, withImageCount, withCommentCount]);

  const handleFilterClick = useCallback(
    (value: string | null) => {
      if (selectedRating === value) return;

      if (onFilterChange) {
        onFilterChange(value);
      } else {
        setUncontrolledRating(value);
      }

      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set(RATING_QUERY_KEY, value);
      } else {
        url.searchParams.delete(RATING_QUERY_KEY);
      }
      url.searchParams.delete('page');

      const newSearch = url.searchParams.toString();
      const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;
      window.history.replaceState(null, '', newUrl);
    },
    [onFilterChange, selectedRating],
  );

  const getButtonClass = (isActive: boolean) =>
    cn(
      'inline-flex h-[36px] items-center justify-center rounded-sop-12px px-5 py-2 sop-body-sm-medium transition-colors cursor-pointer border-[1.2px]',
      isActive
        ? 'bg-sop-primary-100 text-sop-primary-500 border-sop-primary-500'
        : 'bg-sop-neutral-gray-500 text-sop-neutral-gray-200 border-transparent hover:bg-sop-neutral-grayalpha-200',
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: All + misc filters */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => handleFilterClick(allFilter.value)}
          className={getButtonClass(selectedRating === allFilter.value)}
        >
          {allFilter.label}
        </button>

        {miscFilters.map((filter) => {
          const isActive = selectedRating === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterClick(filter.value)}
              className={getButtonClass(isActive)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Row 2+: Star filters */}
      <div className="flex gap-3 flex-wrap">
        {starFilters.map((filter) => {
          const isActive = selectedRating === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterClick(filter.value)}
              className={getButtonClass(isActive)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
