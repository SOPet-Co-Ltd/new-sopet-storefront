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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="md:flex hidden">
          <RenderStars averageRating={averageRating} size={24} />
        </div>
        <div className="flex md:hidden">
          <RenderStars averageRating={averageRating} size={16} />
        </div>
        <p className="md:sop-body-lg-regular sop-body-sm-regular text-sop-neutral-gray-400">
          {averageRating} ({totalReviews} รีวิว)
        </p>
      </div>
      <div className="w-px h-4 bg-sop-neutral-grayalpha-200" aria-hidden />
      <p className="md:sop-body-lg-regular sop-body-sm-regular text-sop-neutral-gray-400">
        ขายแล้ว {formatSoldCount(soldCount)} ชิ้น
      </p>
    </div>
  );
}
