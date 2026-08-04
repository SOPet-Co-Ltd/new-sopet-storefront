'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import type { Category } from '@/lib/hooks/useCategories';
import { buildCategoryHref } from '@/lib/routing/categoryRoutes';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const imageSrc = !imageError && category.imageUrl ? category.imageUrl : PLACEHOLDER_IMAGE;
  const href = buildCategoryHref(category.slug);

  const handlePrefetch = () => {
    router.prefetch(href);
    prefetchProductsListing({ category: category.name, page: 1 });
  };

  return (
    <Link
      href={href}
      className="flex h-16 w-full flex-row items-center overflow-hidden rounded-sop-20 border border-sop-additionalblue-200 bg-sop-additionalblue-100 px-5 py-3 transition-opacity hover:opacity-90"
      aria-label={`ดูหมวดหมู่ ${category.name}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <span className="min-w-0 flex-1 sop-body-sm-medium text-sop-neutral-gray-200 line-clamp-2">
        {category.name}
      </span>
      <div className="relative h-full w-[40%] shrink-0">
        <Image
          loading="lazy"
          src={imageSrc}
          alt={`หมวดหมู่ - ${category.name}`}
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
          className="object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    </Link>
  );
}
