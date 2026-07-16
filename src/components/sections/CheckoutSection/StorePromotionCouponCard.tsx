'use client';

import Link from 'next/link';
import {
  Bag5Icon,
  CheckIcon,
  CloseIcon,
  TicketSaleIcon,
  TimeIcon,
  UserIcon,
} from '@/components/atoms/icons';
import { cn } from '@/lib/utils';
import type {
  PromotionEstimateCartLine,
  StorePromotion,
  UnavailablePromotionReason,
} from '@/lib/checkout/storePromotionUtils';
import {
  formatPromotionConditionText,
  formatPromotionDiscountTitle,
  formatPromotionExpiry,
  formatUnavailablePromotionDiscountTitle,
  getUnavailablePromotionCta,
  getUnavailablePromotionReason,
  getUnavailablePromotionWarning,
} from '@/lib/checkout/storePromotionUtils';

type CouponCardVariant = 'default' | 'selected' | 'unapply' | 'disabled';

type PromotionRadioProps = {
  checked: boolean;
};

function PromotionRadio({ checked }: PromotionRadioProps) {
  return (
    <span
      className={cn(
        'flex h-sop-20px w-sop-20px shrink-0 items-center justify-center rounded-full border bg-sop-base-white',
        checked ? 'border-sop-primary-500' : 'border-sop-neutral-grayalpha-200',
      )}
      aria-hidden
    >
      {checked ? <span className="h-[10px] w-[10px] rounded-full bg-sop-primary-500" /> : null}
    </span>
  );
}

function CouponStatusBadge({ type }: { type: 'check' | 'close' }) {
  return (
    <span
      className={cn(
        'absolute bottom-sop-8px right-sop-8px flex h-[22px] w-[22px] items-center justify-center rounded-full',
        type === 'check' ? 'bg-sop-primary-500' : 'bg-sop-neutral-gray-400',
      )}
      aria-hidden
    >
      {type === 'check' ? (
        <CheckIcon size={{ mobile: 14, desktop: 14 }} color="#FFFFFF" />
      ) : (
        <CloseIcon size={{ mobile: 14, desktop: 14 }} color="#FFFFFF" />
      )}
    </span>
  );
}

function LockKeyholeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className="h-sop-48px w-sop-48px shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 20V18C16 13.5817 19.5817 10 24 10C28.4183 10 32 13.5817 32 18V20"
        stroke="#9C6ADE"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="14" y="20" width="20" height="18" rx="4" fill="#9C6ADE" />
      <circle cx="24" cy="29" r="2.5" fill="#F2EBFC" />
      <path d="M24 31.5V34" stroke="#F2EBFC" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TicketPerforation({ variant }: { variant: CouponCardVariant }) {
  const lineClass =
    variant === 'selected'
      ? 'border-sop-primary-500'
      : variant === 'unapply'
        ? 'border-[#EEEEEE]'
        : 'border-sop-primary-300';

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-0 z-10 flex h-full w-0 -translate-y-1/2 flex-col items-center justify-center"
    >
      <span className="absolute top-[30%] h-sop-12px w-sop-12px translate-x-1/2 rounded-full bg-sop-base-white" />
      <span className="absolute top-[58%] h-sop-12px w-sop-12px translate-x-1/2 rounded-full bg-sop-base-white" />
      <span
        className={cn(
          'absolute top-[22%] bottom-[22%] border-r',
          variant === 'selected' ? lineClass : cn('border-dashed', lineClass),
        )}
      />
    </div>
  );
}

type CouponTicketStubProps = {
  children: React.ReactNode;
  badge?: 'check' | 'close';
  muted?: boolean;
  variant?: CouponCardVariant;
};

function CouponTicketStub({
  children,
  badge,
  muted = false,
  variant = 'default',
}: CouponTicketStubProps) {
  return (
    <div
      className={cn(
        'relative flex h-[100px] w-[100px] shrink-0 items-center justify-center',
        muted ? 'bg-sop-neutral-gray-500' : 'bg-sop-primary-200',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 z-10 h-sop-16px w-sop-8px -translate-x-1/2 -translate-y-1/2 rounded-full bg-sop-base-white"
      />
      <TicketPerforation variant={variant} />
      {children}
      {badge ? <CouponStatusBadge type={badge} /> : null}
    </div>
  );
}

function getCouponOuterBorderClass(variant: CouponCardVariant): string {
  switch (variant) {
    case 'selected':
      return 'border-2 border-sop-primary-500';
    case 'unapply':
      return 'border border-dashed border-[#EEEEEE]';
    case 'disabled':
    case 'default':
    default:
      return 'border border-sop-primary-300';
  }
}

type CouponCardFrameProps = {
  variant: CouponCardVariant;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showRadio?: boolean;
  left: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function CouponCardFrame({
  variant,
  selected = false,
  disabled = false,
  onClick,
  showRadio = true,
  left,
  children,
  footer,
}: CouponCardFrameProps) {
  const Component = onClick && !disabled ? 'button' : 'div';

  return (
    <Component
      type={onClick && !disabled ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full min-w-68 overflow-hidden rounded-sop-20px bg-sop-base-white text-left',
        getCouponOuterBorderClass(variant),
        disabled && 'cursor-not-allowed opacity-50',
        onClick && !disabled && 'cursor-pointer',
      )}
    >
      {left}
      <div
        className={cn(
          'relative flex min-h-[100px] min-w-0 flex-1 flex-col bg-sop-base-white p-sop-12px',
          footer ? 'justify-between' : 'justify-center',
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-[30%] left-0 z-10 h-sop-12px w-sop-12px -translate-x-1/2 rounded-full bg-sop-base-white"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-[58%] left-0 z-10 h-sop-12px w-sop-12px -translate-x-1/2 rounded-full bg-sop-base-white"
        />
        <div className="flex items-start gap-sop-8px">
          <div className="min-w-0 flex-1">{children}</div>
          {showRadio ? <PromotionRadio checked={selected} /> : null}
        </div>
        {footer}
      </div>
    </Component>
  );
}

type SelectableStorePromotionCardProps = {
  promotion: StorePromotion;
  storeSubtotal: number;
  selected: boolean;
  onSelect: () => void;
};

export function SelectableStorePromotionCard({
  promotion,
  storeSubtotal,
  selected,
  onSelect,
}: SelectableStorePromotionCardProps) {
  const expiryLabel = formatPromotionExpiry(promotion.expiresAt);
  const conditionText = formatPromotionConditionText(promotion, storeSubtotal);

  return (
    <CouponCardFrame
      variant={selected ? 'selected' : 'default'}
      selected={selected}
      onClick={onSelect}
      left={
        <CouponTicketStub
          badge={selected ? 'check' : undefined}
          variant={selected ? 'selected' : 'default'}
        >
          <TicketSaleIcon size={{ mobile: 48, desktop: 48 }} color="#9C6ADE" />
        </CouponTicketStub>
      }
    >
      <div className="flex min-w-0 flex-col gap-sop-4px">
        <p className="sop-body-xs-medium text-sop-secondary-600">
          {formatPromotionDiscountTitle(promotion)}
        </p>
        {conditionText ? (
          <p className="sop-body-2xs-light text-sop-neutral-gray-300">{conditionText}</p>
        ) : null}
        {expiryLabel ? (
          <div className="flex items-center gap-sop-4px">
            <TimeIcon size={{ mobile: 16, desktop: 16 }} color="#949495" />
            <span className="sop-body-2xs-light text-sop-neutral-gray-400">{expiryLabel}</span>
          </div>
        ) : null}
      </div>
    </CouponCardFrame>
  );
}

type NoStoreDiscountCardProps = {
  selected: boolean;
  onSelect: () => void;
};

export function NoStoreDiscountCard({ selected, onSelect }: NoStoreDiscountCardProps) {
  return (
    <CouponCardFrame
      variant="unapply"
      selected={selected}
      onClick={onSelect}
      left={
        <CouponTicketStub badge="close" muted variant="unapply">
          <TicketSaleIcon size={{ mobile: 48, desktop: 48 }} color="#949495" />
        </CouponTicketStub>
      }
    >
      <div className="flex min-w-0 flex-col gap-sop-4px">
        <p className="sop-body-xs-medium text-sop-neutral-gray-200">ไม่ใช้ส่วนลด</p>
        <p className="sop-body-2xs-light text-sop-neutral-gray-300">
          ยังไม่ต้องการใช้ส่วนลดในขณะนี้
        </p>
      </div>
    </CouponCardFrame>
  );
}

type UnavailableStorePromotionCardProps = {
  promotion: StorePromotion;
  storeSubtotal: number;
  /** When true, newCustomer-conditioned promos show GUEST_REQUIRED soft copy + login CTA. */
  isGuest?: boolean;
  /** Cart lines for BxGy soft BXGY_QTY reason when freeN=0. */
  cartLines?: PromotionEstimateCartLine[];
  /** Override reason from validatePromotion soft map (takes precedence). */
  softReasonOverride?: UnavailablePromotionReason;
};

export function UnavailableStorePromotionCard({
  promotion,
  storeSubtotal,
  isGuest = false,
  cartLines,
  softReasonOverride,
}: UnavailableStorePromotionCardProps) {
  const reason =
    softReasonOverride ??
    getUnavailablePromotionReason(promotion, storeSubtotal, { isGuest, cartLines });
  const warningText = getUnavailablePromotionWarning(reason, promotion, storeSubtotal);
  const cta = getUnavailablePromotionCta(reason);

  return (
    <CouponCardFrame
      variant="disabled"
      disabled
      showRadio={false}
      left={
        <CouponTicketStub variant="disabled">
          <LockKeyholeIcon />
        </CouponTicketStub>
      }
      footer={
        cta ? (
          <div className="flex justify-end pt-sop-8px">
            <Link
              href={cta.href}
              className="inline-flex h-sop-32px items-center gap-sop-8px rounded-full border border-sop-neutral-grayalpha-100 px-sop-12px shadow-xs sop-body-xs-medium text-sop-neutral-gray-200"
              data-testid={
                reason === 'GUEST_REQUIRED'
                  ? 'unavailable-promotion-login-cta'
                  : 'unavailable-promotion-shop-cta'
              }
            >
              {reason === 'GUEST_REQUIRED' ? (
                <UserIcon size={{ mobile: 16, desktop: 16 }} color="#211F23" />
              ) : (
                <Bag5Icon size={{ mobile: 16, desktop: 16 }} color="#211F23" />
              )}
              {cta.label}
            </Link>
          </div>
        ) : null
      }
    >
      <div className="flex min-w-0 flex-col gap-sop-4px">
        <p className="sop-body-xs-medium text-sop-neutral-gray-200">
          {formatUnavailablePromotionDiscountTitle(promotion)}
        </p>
        {warningText ? (
          <p
            className="sop-body-2xs-regular text-sop-system-warning-500"
            data-testid="unavailable-promotion-warning"
          >
            {warningText}
          </p>
        ) : null}
      </div>
    </CouponCardFrame>
  );
}

export function PromotionCouponsEmptyState() {
  return (
    <div
      className="flex flex-col items-center gap-sop-24px px-sop-24px py-sop-36px"
      data-testid="promotion-coupons-empty-state"
    >
      <TicketSaleIcon size={{ mobile: 48, desktop: 48 }} color="#949495" />
      <p className="text-center sop-body-md-regular text-sop-neutral-gray-200">
        ไม่พบคูปองที่สามารถใช้ได้ในขณะนี้
      </p>
    </div>
  );
}

/** AC-051 / UI-D-005 — exact Thai copy; polite live region (non-interruptive). */
export const SOFT_ELIGIBILITY_ERROR_MESSAGE = 'ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้';

export function SoftEligibilityErrorBanner() {
  return (
    <p
      role="status"
      aria-live="polite"
      className="sop-body-sm-regular text-sop-system-warning-500"
      data-testid="soft-eligibility-error-banner"
    >
      {SOFT_ELIGIBILITY_ERROR_MESSAGE}
    </p>
  );
}
