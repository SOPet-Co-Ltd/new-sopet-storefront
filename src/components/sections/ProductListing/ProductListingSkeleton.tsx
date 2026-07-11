import { PRODUCT_CARD_GRID_CLASS } from './productListingGrid';

type ProductListingSkeletonProps = {
  variant?: 'default' | 'search';
};

export function ProductListingSkeleton({ variant = 'default' }: ProductListingSkeletonProps) {
  return (
    <div className="py-4" aria-busy="true" data-testid="product-listing-skeleton">
      <div className="mb-6 h-9 w-full max-w-xl rounded-xs bg-sop-neutral-gray-600 animate-pulse" />
      {variant === 'search' && (
        <div className="mb-10 h-10 w-full rounded-xs bg-sop-neutral-gray-600 animate-pulse" />
      )}
      <ul className={PRODUCT_CARD_GRID_CLASS}>
        {Array.from({ length: 20 }).map((_, index) => (
          <li
            key={index}
            className="h-[280px] w-full max-w-[168px] justify-self-center rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse md:h-[320px] md:max-w-sop-224px"
          />
        ))}
      </ul>
    </div>
  );
}
