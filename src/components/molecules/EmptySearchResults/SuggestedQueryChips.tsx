import Link from 'next/link';
import { cn } from '@/lib/utils';

type SuggestedQueryChipsProps = {
  suggestions: string[];
  className?: string;
};

export function SuggestedQueryChipsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-2" data-testid="search-recovery-chips-skeleton">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-9 w-24 animate-pulse rounded-[4px] bg-sop-neutral-gray-600"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function SuggestedQueryChips({ suggestions, className }: SuggestedQueryChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full', className)} data-testid="search-recovery-chips">
      <p className="mb-3 text-center sop-body-sm-medium text-sop-neutral-gray-300">ลองค้นหา</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <Link
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className={cn(
                'inline-flex rounded-[4px] border border-sop-primary-300 bg-sop-primary-100',
                'px-3 py-1.5 sop-body-sm-regular text-sop-primary-500',
                'transition-colors hover:border-sop-primary-400 hover:bg-sop-primary-200',
              )}
            >
              {suggestion}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
