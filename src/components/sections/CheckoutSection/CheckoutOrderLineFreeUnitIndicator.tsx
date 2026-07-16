'use client';

type CheckoutOrderLineFreeUnitIndicatorProps = {
  /** Attributed free units from validatePromotion.freeUnits allocation (Gate A). 0 hides. */
  freeQuantity: number;
};

/**
 * Text free-unit indicator for checkout order lines (AC-027).
 * Not color-only — always includes Thai text. Hidden when freeQuantity <= 0.
 */
export function CheckoutOrderLineFreeUnitIndicator({
  freeQuantity,
}: CheckoutOrderLineFreeUnitIndicatorProps) {
  if (freeQuantity <= 0) return null;

  const label = freeQuantity === 1 ? 'แถมฟรี' : `รวมแถมฟรี ${freeQuantity} ชิ้น`;

  return (
    <span
      className="sop-body-xs-medium text-sop-system-success-500"
      data-testid="checkout-order-line-free-unit-indicator"
      aria-label={label}
    >
      {label}
    </span>
  );
}
