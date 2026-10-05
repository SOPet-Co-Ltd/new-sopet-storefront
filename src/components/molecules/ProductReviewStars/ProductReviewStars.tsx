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
  const displayRating = averageRating > 0 ? averageRating : 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <RenderStars averageRating={displayRating} size={18} />
        <span className="text-sm font-semibold text-sop-neutral-gray-200">{displayRating}</span>
        <span className="text-sm text-sop-neutral-gray-400">
          ({formatSoldCount(totalReviews)} รีวิว)
        </span>
      </div>
      <div className="h-3.5 w-px bg-sop-neutral-grayalpha-300" aria-hidden />
      <span className="text-sm text-sop-neutral-gray-400">
        ขายแล้ว {formatSoldCount(soldCount)} ชิ้น
      </span>
    </div>
  );
}
