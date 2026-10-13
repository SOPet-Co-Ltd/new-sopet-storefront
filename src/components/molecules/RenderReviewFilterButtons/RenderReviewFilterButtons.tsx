'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';

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
      label: `${rating} ดาว (${starCounts[rating as 1 | 2 | 3 | 4 | 5]})`,
    }));

    const miscFilterButtons = [
      { value: 'wi', label: `มีรูปภาพ (${withImageCount})` },
      { value: 'oc', label: `ความคิดเห็น (${withCommentCount})` },
    ];

    return {
      allFilter: {
        value: null as string | null,
        label: `ทั้งหมด (${totalReviews})`,
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

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: All + misc filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={() => handleFilterClick(allFilter.value)}
          variant={selectedRating === allFilter.value ? 'secondary' : 'neutral'}
          size="sm"
        >
          {allFilter.label}
        </Button>

        {miscFilters.map((filter) => {
          const isActive = selectedRating === filter.value;
          return (
            <Button
              key={filter.value}
              type="button"
              onClick={() => handleFilterClick(filter.value)}
              variant={isActive ? 'secondary' : 'neutral'}
              size="sm"
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Row 2+: Star filters */}
      <div className="flex gap-2 flex-wrap">
        {starFilters.map((filter) => {
          const isActive = selectedRating === filter.value;
          return (
            <Button
              key={filter.value}
              type="button"
              onClick={() => handleFilterClick(filter.value)}
              variant={isActive ? 'secondary' : 'neutral'}
              size="sm"
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
