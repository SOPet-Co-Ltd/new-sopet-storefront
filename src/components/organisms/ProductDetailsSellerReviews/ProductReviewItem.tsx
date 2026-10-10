import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { ReviewImagesGrid } from '@/components/molecules/ReviewImagesGrid/ReviewImagesGrid';
import { VendorReplyBlock } from '@/components/molecules/VendorReplyBlock';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';

import type { ProductReview } from '@/lib/hooks/useReviews';

export type ProductReviewItemData = ProductReview & {
  variantOptions?: string | Record<string, string> | null;
  variantName?: string | null;
  productImageUrl?: string | null;
};

type ProductReviewItemProps = {
  review: ProductReviewItemData;
};

function getVariantText(review: ProductReviewItemData): string | null {
  if (review.variantName && review.variantName.trim()) {
    return review.variantName.trim();
  }
  if (review.variantOptions && typeof review.variantOptions === 'string') {
    return review.variantOptions;
  }
  return null;
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name.charAt(0).toUpperCase();
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sop-neutral-gray-500 text-sop-neutral-gray-300"
      aria-hidden="true"
    >
      <span className="sop-body-sm-medium">{initials}</span>
    </div>
  );
}

export function ProductReviewItem({ review }: ProductReviewItemProps) {
  const variantText = getVariantText(review);

  return (
    <article className="py-4" data-testid={`product-review-item-${review.id}`}>
      <div className="flex items-start gap-3">
        <AvatarPlaceholder name={review.customerName} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="sop-body-sm-medium text-sop-neutral-gray-200 leading-tight">
            {review.customerName}
          </p>
          <div className="flex items-center gap-2">
            <RenderStars averageRating={review.rating} size={16} />
            <time
              className="sop-body-xs-regular text-sop-neutral-gray-400"
              dateTime={review.createdAt}
            >
              • {formatThaiDate(review.createdAt)}
            </time>
          </div>
        </div>

        {variantText ? (
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-sop-neutral-gray-500 px-sop-16px py-sop-8px">
            <span className="sop-body-xs-medium text-sop-neutral-gray-300 whitespace-nowrap">
              ตัวเลือก : {variantText}
            </span>
          </div>
        ) : null}
      </div>

      {review.comment ? (
        <p className="mt-3 sop-body-md-regular text-sop-neutral-gray-300 leading-relaxed">
          {review.comment}
        </p>
      ) : null}

      <ReviewImagesGrid images={review.images} />

      {review.reply ? <VendorReplyBlock reply={review.reply} /> : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-sop-neutral-grayalpha-200 px-3 py-1 sop-body-xs-regular text-sop-neutral-gray-300 transition-colors hover:border-sop-neutral-grayalpha-300 hover:text-sop-neutral-gray-300"
          aria-label="มีประโยชน์"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          มีประโยชน์
        </button>
      </div>
    </article>
  );
}
