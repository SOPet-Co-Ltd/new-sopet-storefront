'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/hooks/useCategories';
import { buildCategoryHref } from '@/lib/routing/categoryRoutes';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

type SuggestedCategoryGridProps = {
  categories: Category[];
};

function SuggestedCategoryLink({ category }: { category: Category }) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = !imageError && category.imageUrl ? category.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <Link
      href={buildCategoryHref(category.slug)}
      className="flex min-h-12 items-center gap-2.5 rounded-sop-16px border border-sop-additionalblue-200 bg-sop-additionalblue-100 px-3 py-2.5 transition-opacity hover:opacity-90"
      aria-label={`ดูหมวดหมู่ ${category.name}`}
    >
      <div className="relative h-8 w-8 shrink-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="32px"
          className="object-contain"
          aria-hidden="true"
          onError={() => setImageError(true)}
        />
      </div>
      <span className="min-w-0 flex-1 sop-body-sm-medium text-sop-neutral-gray-200 line-clamp-2 text-left">
        {category.name}
      </span>
    </Link>
  );
}

export function SuggestedCategoryGridSkeleton() {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      aria-hidden="true"
      data-testid="suggested-category-grid-skeleton"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="h-12 animate-pulse rounded-sop-16px bg-sop-neutral-gray-600" />
      ))}
    </ul>
  );
}

export function SuggestedCategoryGrid({ categories }: SuggestedCategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="suggested-category-grid">
      {categories.slice(0, 6).map((category) => (
        <li key={category.id}>
          <SuggestedCategoryLink category={category} />
        </li>
      ))}
    </ul>
  );
}
