'use client';

import Link from 'next/link';
import {
  Bag5Icon,
  CheckIcon,
  CloseIcon,
  TicketSaleIcon,
  TimeIcon,
  TruckIcon,
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
  isShippingPromotionType,
} from '@/lib/checkout/storePromotionUtils';

type CouponCardVariant = 'default' | 'selected' | 'unapply' | 'disabled';
/** Product/merchandise discount vs shipping-fee discount visual tone. */
type CouponTone = 'product' | 'shipping';

const PRODUCT_ICON_COLOR = '#9C6ADE';
const SHIPPING_ICON_COLOR = '#FF6F61';
const PRODUCT_LOCK_SOFT = '#F2EBFC';
const SHIPPING_LOCK_SOFT = '#FFF2F1';

type PromotionRadioProps = {
  checked: boolean;
  tone?: CouponTone;
};

function PromotionRadio({ checked, tone = 'product' }: PromotionRadioProps) {
  const checkedBorder =
    tone === 'shipping' ? 'border-sop-secondary-500' : 'border-sop-primary-500';
  const checkedDot = tone === 'shipping' ? 'bg-sop-secondary-500' : 'bg-sop-primary-500';

  return (
    <span
      className={cn(
        'flex h-sop-20px w-sop-20px shrink-0 items-center justify-center rounded-full border bg-sop-base-white',
        checked ? checkedBorder : 'border-sop-neutral-grayalpha-200',
      )}
      aria-hidden
    >
      {checked ? <span className={cn('h-[10px] w-[10px] rounded-full', checkedDot)} /> : null}
    </span>
  );
}

function CouponStatusBadge({
  type,
  tone = 'product',
}: {
  type: 'check' | 'close';
  tone?: CouponTone;
}) {
  return (
    <span
      className={cn(
        'absolute bottom-sop-8px right-sop-8px flex h-[22px] w-[22px] items-center justify-center rounded-full',
        type === 'check'
          ? tone === 'shipping'
            ? 'bg-sop-secondary-500'
            : 'bg-sop-primary-500'
          : 'bg-sop-neutral-gray-400',
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

function LockKeyholeIcon({
  color = PRODUCT_ICON_COLOR,
  soft = PRODUCT_LOCK_SOFT,
}: {
  color?: string;
  soft?: string;
}) {
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
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="14" y="20" width="20" height="18" rx="4" fill={color} />
      <circle cx="24" cy="29" r="2.5" fill={soft} />
      <path d="M24 31.5V34" stroke={soft} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TicketPerforation({
  variant,
  tone = 'product',
}: {
  variant: CouponCardVariant;
  tone?: CouponTone;
}) {
  const lineClass =
    variant === 'selected'
      ? tone === 'shipping'
        ? 'border-sop-secondary-500'
        : 'border-sop-primary-500'
      : variant === 'unapply'
        ? 'border-[#EEEEEE]'
        : tone === 'shipping'
          ? 'border-sop-secondary-300'
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
  tone?: CouponTone;
};

function CouponTicketStub({
  children,
  badge,
  muted = false,
  variant = 'default',
  tone = 'product',
}: CouponTicketStubProps) {
  return (
    <div
      className={cn(
        'relative flex h-[100px] w-[100px] shrink-0 items-center justify-center',
        muted
          ? 'bg-sop-neutral-gray-500'
          : tone === 'shipping'
            ? 'bg-sop-secondary-100'
            : 'bg-sop-primary-200',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 z-10 h-sop-16px w-sop-8px -translate-x-1/2 -translate-y-1/2 rounded-full bg-sop-base-white"
      />
      <TicketPerforation variant={variant} tone={tone} />
      {children}
      {badge ? <CouponStatusBadge type={badge} tone={tone} /> : null}
    </div>
  );
}

function getCouponOuterBorderClass(variant: CouponCardVariant, tone: CouponTone = 'product'): string {
  switch (variant) {
    case 'selected':
      return tone === 'shipping'
        ? 'border-2 border-sop-secondary-500'
        : 'border-2 border-sop-primary-500';
    case 'unapply':
      return 'border border-dashed border-[#EEEEEE]';
    case 'disabled':
    case 'default':
    default:
      return tone === 'shipping'
        ? 'border border-sop-secondary-300'
        : 'border border-sop-primary-300';
  }
}

type CouponCardFrameProps = {
  variant: CouponCardVariant;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showRadio?: boolean;
  tone?: CouponTone;
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
  tone = 'product',
  left,
  children,
  footer,
}: CouponCardFrameProps) {
  // Keep a real <button> when clickable so disabled pending states stay role=button
  // (list-time batch gate) and RTL getByRole('button') keeps working.
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={onClick ? disabled : undefined}
      className={cn(
        'relative flex w-full min-w-68 overflow-hidden rounded-sop-20px bg-sop-base-white text-left',
        getCouponOuterBorderClass(variant, tone),
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
          {showRadio ? <PromotionRadio checked={selected} tone={tone} /> : null}
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
  /** When true, card is not clickable (e.g. list-time batch still loading). */
  disabled?: boolean;
};

export function SelectableStorePromotionCard({
  promotion,
  storeSubtotal,
  selected,
  onSelect,
  disabled = false,
}: SelectableStorePromotionCardProps) {
  const expiryLabel = formatPromotionExpiry(promotion.expiresAt);
  const conditionText = formatPromotionConditionText(promotion, storeSubtotal);
  const tone: CouponTone = isShippingPromotionType(promotion.type) ? 'shipping' : 'product';
  const iconColor = tone === 'shipping' ? SHIPPING_ICON_COLOR : PRODUCT_ICON_COLOR;

  return (
    <CouponCardFrame
      variant={selected ? 'selected' : 'default'}
      selected={selected}
      disabled={disabled}
      onClick={onSelect}
      tone={tone}
      left={
        <CouponTicketStub
          badge={selected ? 'check' : undefined}
          variant={selected ? 'selected' : 'default'}
          tone={tone}
        >
          {tone === 'shipping' ? (
            <TruckIcon size={{ mobile: 48, desktop: 48 }} color={iconColor} />
          ) : (
            <TicketSaleIcon size={{ mobile: 48, desktop: 48 }} color={iconColor} />
          )}
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
  const tone: CouponTone = isShippingPromotionType(promotion.type) ? 'shipping' : 'product';
  const lockColor = tone === 'shipping' ? SHIPPING_ICON_COLOR : PRODUCT_ICON_COLOR;
  const lockSoft = tone === 'shipping' ? SHIPPING_LOCK_SOFT : PRODUCT_LOCK_SOFT;

  return (
    <CouponCardFrame
      variant="disabled"
      disabled
      showRadio={false}
      tone={tone}
      left={
        <CouponTicketStub variant="disabled" tone={tone}>
          <LockKeyholeIcon color={lockColor} soft={lockSoft} />
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
