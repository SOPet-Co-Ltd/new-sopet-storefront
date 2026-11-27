'use client';

import { useState } from 'react';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { ReviewImagesGrid } from '@/components/molecules/ReviewImagesGrid/ReviewImagesGrid';
import { VendorReplyBlock } from '@/components/molecules/VendorReplyBlock';
import { formatRelativeThaiDate, formatThaiDate } from '@/lib/datetime/formatThaiDatetime';
import { cn } from '@/lib/utils';

import type { ProductReview } from '@/lib/hooks/useReviews';

export type ProductReviewItemData = ProductReview & {
  variantOptions?: string | Record<string, string> | null;
  variantName?: string | null;
  productImageUrl?: string | null;
  customerProfilePhotoUrl?: string | null;
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

const AVATAR_CLASS = 'h-12 w-12 md:h-9 md:w-9';

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-sop-neutral-gray-500 text-sop-neutral-gray-300',
        AVATAR_CLASS,
      )}
      aria-hidden="true"
      data-testid="reviewer-avatar-placeholder"
    >
      <span className="sop-body-sm-medium">{initials}</span>
    </div>
  );
}

function ReviewerAvatar({
  name,
  profilePhotoUrl,
}: {
  name: string;
  profilePhotoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  if (profilePhotoUrl && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePhotoUrl}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', AVATAR_CLASS)}
        onError={() => setImageError(true)}
        data-testid="reviewer-avatar-image"
      />
    );
  }

  return <AvatarPlaceholder name={name} />;
}

const REVIEWER_GIVEN_NAMES = [
  'สมชาย',
  'กมลวรรณ',
  'ณัฐวุฒิ',
  'ศิริพร',
  'ธีรเดช',
  'พิมลดา',
  'อรรถพล',
  'วรรณภา',
  'ชลธิชา',
  'ชัยรัตน์',
  'ทัศนีย์',
  'ปิยะภัทร',
  'สิริกานต์',
  'อนุรักษ์',
  'วิภาวี',
  'พงศกร',
  'กานดา',
  'จิราพร',
  'เกียรติศักดิ์',
  'สุจิตรา',
  'ธนากร',
  'วรัญญา',
  'ปรีชา',
  'อรทัย',
  'นพดล',
  'กุลธิดา',
  'สุรชัย',
  'รัตนาภรณ์',
  'เอกชัย',
  'มณีรัตน์',
  'อภิชาติ',
  'ศุภชัย',
  'ชนิดา',
  'ภาวิณี',
  'ธนพล',
  'ปวีณา',
  'อดิศร',
  'ณัฐธิดา',
  'วสันต์',
  'สุภาพร',
] as const;

const REVIEWER_SURNAME_INITIALS = [
  'ก',
  'ข',
  'ค',
  'จ',
  'ช',
  'ณ',
  'ด',
  'ต',
  'ท',
  'น',
  'บ',
  'ป',
  'พ',
  'ภ',
  'ม',
  'ย',
  'ร',
  'ล',
  'ว',
  'ส',
] as const;

const REVIEWER_ALIAS_PATTERN = /^[\u0E00-\u0E7F]+ [\u0E00-\u0E7F]\.$/;

export function isReviewerAlias(name: string): boolean {
  return REVIEWER_ALIAS_PATTERN.test(name);
}

function composeReviewerAlias(hash: number): string {
  const unsigned = hash >>> 0;
  const givenName = REVIEWER_GIVEN_NAMES[unsigned % REVIEWER_GIVEN_NAMES.length];
  const surnameInitial =
    REVIEWER_SURNAME_INITIALS[(unsigned >>> 8) % REVIEWER_SURNAME_INITIALS.length];
  return `${givenName} ${surnameInitial}.`;
}

export function isGenericOrMissingName(name: string | null | undefined): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  if (!trimmed) return true;
  return (
    trimmed === 'ลูกค้า' ||
    trimmed === 'ลูกค้าไม่ระบุชื่อ' ||
    trimmed.toLowerCase() === 'unknown' ||
    trimmed.toLowerCase() === 'customer'
  );
}

export function getReviewerName(review: { id?: string; customerName?: string | null }): string {
  if (!isGenericOrMissingName(review.customerName)) {
    return review.customerName!.trim();
  }

  const seed = review.id || '';
  if (!seed) {
    return composeReviewerAlias(0);
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return composeReviewerAlias(hash);
}

function VariantLabel({ variantText }: { variantText: string }) {
  return <span>ตัวเลือก : {variantText}</span>;
}

export function ProductReviewItem({ review }: ProductReviewItemProps) {
  const variantText = getVariantText(review);
  const reviewerName = getReviewerName(review);

  return (
    <article className="py-4" data-testid={`product-review-item-${review.id}`}>
      <div className="flex items-start gap-3">
        <ReviewerAvatar name={reviewerName} profilePhotoUrl={review.customerProfilePhotoUrl} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="sop-body-md-medium leading-tight text-sop-neutral-gray-200 md:sop-body-sm-medium">
            {reviewerName}
          </p>
          <div className="flex items-center gap-2">
            <span className="md:hidden">
              <RenderStars averageRating={review.rating} size={18} />
            </span>
            <span className="hidden md:block">
              <RenderStars averageRating={review.rating} size={16} />
            </span>
            <time
              className="sop-body-sm-regular text-sop-neutral-gray-400"
              dateTime={review.createdAt}
            >
              <span className="md:hidden">• {formatRelativeThaiDate(review.createdAt)}</span>
              <span className="hidden md:inline">• {formatThaiDate(review.createdAt)}</span>
            </time>
          </div>
        </div>

        {variantText ? (
          <div className="hidden shrink-0 items-center gap-2 rounded-sop-12px bg-sop-neutral-gray-500 px-sop-16px py-sop-8px md:flex">
            <span className="sop-body-xs-medium whitespace-nowrap text-sop-neutral-gray-300">
              <VariantLabel variantText={variantText} />
            </span>
          </div>
        ) : null}
      </div>

      {review.comment ? (
        <p className="mt-4 whitespace-pre-line sop-body-md-regular leading-relaxed text-sop-neutral-gray-200 md:ml-12 md:mt-3 md:sop-body-sm-regular">
          {review.comment}
        </p>
      ) : null}

      <div className="md:ml-12">
        <ReviewImagesGrid images={review.images} layout="responsive" />

        {variantText ? (
          <div
            className="mt-sop-20px flex items-center rounded-sop-12px bg-sop-neutral-gray-500 px-sop-8px py-sop-12px md:hidden"
            data-testid="review-variant-bar"
          >
            <span className="sop-body-sm-medium text-sop-neutral-gray-200">
              <VariantLabel variantText={variantText} />
            </span>
          </div>
        ) : null}

        {review.reply ? <VendorReplyBlock reply={review.reply} /> : null}
      </div>

      <div className="mt-4 flex justify-end md:mt-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-sop-neutral-grayalpha-200 bg-white px-4 py-2 sop-body-sm-regular text-sop-neutral-gray-300 transition-colors hover:border-sop-neutral-grayalpha-300"
          aria-label="มีประโยชน์"
        >
          <svg
            width="16"
            height="16"
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
