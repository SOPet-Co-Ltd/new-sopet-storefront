'use client';

import { CategoryCard } from '@/components/molecules/CategoryCard';
import { useCategories, type Category } from '@/lib/hooks/useCategories';

/** Mobile: full-bleed horizontal scroller with column snap. Desktop: static wrapping grid. */
const CATEGORY_LIST_CLASS =
  'max-md:-mx-4 max-md:flex max-md:gap-sop-8px max-md:overflow-x-auto max-md:overscroll-x-contain max-md:touch-pan-x max-md:snap-x max-md:snap-mandatory max-md:pl-4 max-md:pr-4 max-md:scroll-pl-4 max-md:scroll-pr-4 max-md:[-ms-overflow-style:none] max-md:scrollbar-none max-md:[&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-sop-20px md:overflow-visible lg:grid-cols-6';

/** One 2-card column on mobile (snap target). Unwraps into the desktop grid via `contents`. */
const CATEGORY_COLUMN_CLASS =
  'flex shrink-0 flex-col gap-sop-8px max-md:w-[calc((100vw-3rem)/2)] max-md:snap-start max-md:snap-always md:contents';

const ROWS_PER_COLUMN = 2;

function chunkIntoColumns<T>(items: T[], rowsPerColumn: number): T[][] {
  const columns: T[][] = [];
  for (let index = 0; index < items.length; index += rowsPerColumn) {
    columns.push(items.slice(index, index + rowsPerColumn));
  }
  return columns;
}

function CategorySkeletonGrid() {
  const columns = chunkIntoColumns(
    Array.from({ length: 6 }, (_, index) => index),
    ROWS_PER_COLUMN,
  );

  return (
    <div className={CATEGORY_LIST_CLASS} aria-hidden="true">
      {columns.map((column) => (
        <div key={column[0]} className={CATEGORY_COLUMN_CLASS}>
          {column.map((index) => (
            <div
              key={index}
              className="h-16 w-full rounded-sop-20 bg-sop-neutral-gray-600 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

type HomeCategoriesProps = {
  heading?: string;
  initialCategories?: Category[];
};

export function HomeCategories({
  heading = 'หมวดหมู่สินค้า',
  initialCategories,
}: HomeCategoriesProps) {
  const { categories: fetchedCategories, loading, error, refetch } = useCategories();
  const categories = initialCategories ?? fetchedCategories;
  const showLoading = !initialCategories && loading;

  if (showLoading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <CategorySkeletonGrid />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          โหลดหมวดหมู่ไม่สำเร็จ — ลองอีกครั้ง
        </button>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="w-full">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <p className="sop-body-sm-regular text-sop-neutral-gray-300">ไม่พบหมวดหมู่</p>
      </section>
    );
  }

  const columns = chunkIntoColumns(categories, ROWS_PER_COLUMN);

  return (
    <section className="w-full">
      <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
      <div className={CATEGORY_LIST_CLASS}>
        {columns.map((column) => (
          <div key={column[0].id} className={CATEGORY_COLUMN_CLASS}>
            {column.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
