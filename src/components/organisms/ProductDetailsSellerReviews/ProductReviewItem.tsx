import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { ReviewImagesGrid } from '@/components/molecules/ReviewImagesGrid/ReviewImagesGrid';
import { VendorReplyBlock } from '@/components/molecules/VendorReplyBlock';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';
import type { ProductReview } from '@/lib/hooks/useReviews';

type ProductReviewItemProps = {
  review: ProductReview;
};

export function ProductReviewItem({ review }: ProductReviewItemProps) {
  return (
    <article
      className="rounded-sop-8 border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-600 p-4"
      data-testid={`product-review-item-${review.id}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="sop-body-sm-medium text-sop-neutral-gray-200">{review.customerName}</p>
        <time className="sop-body-xs-regular text-sop-neutral-gray-400" dateTime={review.createdAt}>
          {formatThaiDate(review.createdAt)}
        </time>
      </div>
      <RenderStars averageRating={review.rating} size={18} />
      {review.comment ? (
        <p className="mt-2 sop-body-md-regular text-sop-neutral-gray-300">{review.comment}</p>
      ) : null}
      <ReviewImagesGrid images={review.images} />
      {review.reply ? <VendorReplyBlock reply={review.reply} /> : null}
    </article>
  );
}
