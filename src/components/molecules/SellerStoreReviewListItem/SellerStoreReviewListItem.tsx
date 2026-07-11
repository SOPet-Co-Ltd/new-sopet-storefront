import Link from 'next/link';
import { buildProductHref } from '@/components/organisms/ProductCard';
import { ProductThumbnail } from '@/components/molecules/ProductThumbnail/ProductThumbnail';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { ReviewImagesGrid } from '@/components/molecules/ReviewImagesGrid/ReviewImagesGrid';
import { VendorReplyBlock } from '@/components/molecules/VendorReplyBlock';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';
import type { StoreReview } from '@/lib/hooks/useReviews';

type SellerStoreReviewListItemProps = {
  review: StoreReview;
};

function getProductHref(review: StoreReview): string {
  return review.productSlug ? `/product/${review.productSlug}` : buildProductHref(review.productId);
}

export function SellerStoreReviewListItem({ review }: SellerStoreReviewListItemProps) {
  const hasComment = Boolean(review.comment?.trim());

  return (
    <li className="py-4" data-testid={`seller-store-review-item-${review.id}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductThumbnail imageUrl={review.productImageUrl} alt={review.productName} />
        <div className="min-w-0 flex-1">
          <Link href={getProductHref(review)} className="sop-body-md-medium text-sop-primary-700">
            {review.productName}
          </Link>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="sop-body-sm-medium text-sop-neutral-gray-300">{review.customerName}</p>
            <time
              className="sop-body-xs-regular text-sop-neutral-gray-400"
              dateTime={review.createdAt}
            >
              {formatThaiDate(review.createdAt)}
            </time>
          </div>
          <div className="mt-2">
            <RenderStars averageRating={review.rating} size={16} />
          </div>
          {hasComment ? (
            <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">{review.comment}</p>
          ) : (
            <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">ไม่มีความคิดเห็น</p>
          )}
          <ReviewImagesGrid images={review.images ?? []} />
          {review.reply ? <VendorReplyBlock reply={review.reply} /> : null}
        </div>
      </div>
    </li>
  );
}
