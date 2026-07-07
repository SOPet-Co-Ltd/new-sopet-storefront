import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';

type ProductReviewStarsProps = {
  averageRating: number;
  totalReviews: number;
  soldCount?: number;
};

function formatSoldCount(count: number): string {
  if (count < 1000) return count.toString();

  const units = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(count) / 3);
  const scaled = count / 10 ** (magnitude * 3);
  const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);

  return `${formatted}${units[magnitude]}`;
}

export function ProductReviewStars({
  averageRating,
  totalReviews,
  soldCount = 0,
}: ProductReviewStarsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex">
          <RenderStars averageRating={averageRating} size={24} />
        </div>
        <div className="flex lg:hidden">
          <RenderStars averageRating={averageRating} size={16} />
        </div>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400 lg:sop-body-lg-regular">
          {averageRating} ({totalReviews} รีวิว)
        </p>
      </div>
      <div className="h-4 w-px bg-sop-neutral-grayalpha-200 lg:h-8" aria-hidden />
      <p className="sop-body-sm-regular text-sop-neutral-gray-400 lg:sop-body-lg-regular">
        ขายแล้ว {formatSoldCount(soldCount)} ชิ้น
      </p>
    </div>
  );
}
