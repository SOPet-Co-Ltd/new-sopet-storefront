export function ProductListingSkeleton() {
  return (
    <div className="py-4" aria-busy="true" data-testid="product-listing-skeleton">
      <div className="h-6 w-32 bg-sop-neutral-gray-600 rounded-xs animate-pulse mb-6" />
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-2 justify-items-center md:grid-cols-[repeat(auto-fit,minmax(223px,1fr))] md:gap-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <li
            key={index}
            className="w-[168px] md:w-[223px] h-[280px] rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
          />
        ))}
      </ul>
    </div>
  );
}
