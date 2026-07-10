'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const PRODUCT_THUMBNAIL_SIZE = 32;
const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

type SearchSuggestionRowProps = {
  id: string;
  label: string;
  imageUrl?: string | null;
  active?: boolean;
  onSelect: () => void;
};

export function SearchSuggestionRow({
  id,
  label,
  imageUrl,
  active = false,
  onSelect,
}: SearchSuggestionRowProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      className={cn(
        'cursor-pointer px-3 py-2 sop-body-sm-regular text-sop-neutral-gray-100',
        active && 'bg-sop-primary-100',
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect();
      }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-sop-additionalblue-300">
          <Image
            src={imageUrl || PLACEHOLDER_IMAGE}
            alt=""
            width={PRODUCT_THUMBNAIL_SIZE}
            height={PRODUCT_THUMBNAIL_SIZE}
            className="h-full w-full object-cover object-center"
            aria-hidden="true"
          />
        </span>
        <span className="truncate">{label}</span>
      </span>
    </li>
  );
}
