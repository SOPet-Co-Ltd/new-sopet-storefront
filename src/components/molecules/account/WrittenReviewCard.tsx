import Link from 'next/link';
import Image from 'next/image';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { ReviewImagesGrid } from '@/components/molecules/ReviewImagesGrid/ReviewImagesGrid';
import { buildProductHref } from '@/components/organisms/ProductCard';
import type { CustomerReview } from '@/lib/hooks/useCustomerReviews';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { cn } from '@/lib/utils';

type WrittenReviewCardProps = {
  review: CustomerReview;
};

const REVIEW_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  pending: { label: 'รอตรวจสอบ', variant: 'warning' },
  approved: { label: 'อนุมัติแล้ว', variant: 'success' },
  rejected: { label: 'ไม่ผ่านการตรวจสอบ', variant: 'error' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} จาก 5 ดาว`} className="flex gap-0.5 text-sop-system-warning-400">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index}>{index < rating ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

export function WrittenReviewCard({ review }: WrittenReviewCardProps) {
  const statusConfig = REVIEW_STATUS_LABELS[review.status] ?? {
    label: review.status,
    variant: 'default' as const,
  };
  const productHref = buildProductHref(review.productId);

  return (
    <AccountCard>
      <div className="flex gap-4" data-testid="written-review-card">
        <Link
          aria-label={review.productName}
          className="relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-sop-8px bg-sop-neutral-gray-500"
          href={productHref}
        >
          {review.productImageUrl ? (
            <Image
              alt={review.productName}
              className="object-cover"
              fill
              sizes="80px"
              src={review.productImageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
              ไม่มีรูป
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link
              className={cn('line-clamp-2 sop-body-sm-medium text-sop-neutral-gray-200 underline-offset-2 hover:underline')}
              href={productHref}
            >
              {review.productName}
            </Link>
            <AccountStatusBadge variant={statusConfig.variant}>{statusConfig.label}</AccountStatusBadge>
          </div>

          <div className="mt-2">
            <StarRating rating={review.rating} />
          </div>

          {review.comment ? (
            <p className="mt-2 line-clamp-3 sop-body-sm-regular text-sop-neutral-gray-400">
              {review.comment}
            </p>
          ) : null}

          <ReviewImagesGrid images={review.images ?? []} />

          <p className="mt-2 sop-body-xs-regular text-sop-neutral-gray-400">
            {formatThaiDateTime(review.createdAt)}
          </p>
        </div>
      </div>
    </AccountCard>
  );
}
