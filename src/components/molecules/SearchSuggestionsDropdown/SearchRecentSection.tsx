'use client';

import { cn } from '@/lib/utils';

type SearchRecentSectionProps = {
  items: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
};

export function SearchRecentSection({ items, onSelect, onClear }: SearchRecentSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-sop-neutral-gray-400 px-3 py-3">
      <p className="mb-2 sop-body-sm-regular text-sop-neutral-gray-300">ค้นหาล่าสุด</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'rounded-[4px] border border-sop-neutral-gray-400 bg-sop-neutral-gray-500',
              'px-3 py-1.5 sop-body-sm-regular text-sop-neutral-gray-300',
            )}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 w-full text-center sop-body-sm-regular text-sop-neutral-gray-300 underline"
        onMouseDown={(event) => {
          event.preventDefault();
          onClear();
        }}
      >
        ล้างประวัติ
      </button>
    </div>
  );
}
