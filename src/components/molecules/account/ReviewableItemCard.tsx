'use client';

import Image from 'next/image';
import { Button } from '@/components/atoms/Button';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import type { CustomerReviewableItem } from '@/lib/hooks/useCustomerReviews';

type ReviewableItemCardProps = {
  item: CustomerReviewableItem;
  onWriteReview: (item: CustomerReviewableItem) => void;
};

export function isReviewDeadlineExpired(reviewDeadline: string | null | undefined): boolean {
  if (!reviewDeadline) {
    return false;
  }
  return new Date(reviewDeadline).getTime() < Date.now();
}

export function ReviewableItemCard({ item, onWriteReview }: ReviewableItemCardProps) {
  const isExpired = isReviewDeadlineExpired(item.reviewDeadline);

  return (
    <AccountCard>
      <div className="flex gap-4" data-testid="reviewable-item-card">
        <div className="relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-sop-8px bg-sop-neutral-gray-500">
          {item.productImageUrl ? (
            <Image
              alt={item.productName}
              className="object-cover"
              fill
              sizes="80px"
              src={item.productImageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
              ไม่มีรูป
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 sop-body-sm-medium text-sop-neutral-gray-200">
            {item.productName}
          </p>
          <p className="mt-1 sop-body-xs-regular text-sop-neutral-gray-400">
            คำสั่งซื้อ #{item.orderNumber}
          </p>
          <Button
            className="mt-3"
            disabled={isExpired}
            onClick={() => onWriteReview(item)}
            size="sm"
            type="button"
          >
            เขียนรีวิว
          </Button>
        </div>
      </div>
    </AccountCard>
  );
}
