import {
  toCreateOrderInput,
  type CreateOrderCheckoutContext,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { mapCheckoutPaymentMethodForApi } from '@/lib/checkout/checkoutPaymentMethod';
import {
  extractPromotionErrorCode,
  isCreateOrderHardEligibilityCode,
  PromotionValidationError,
  SoftPromotionIneligibilityError,
  validateCheckoutPromotionCode,
} from '@/lib/checkout/validateCheckoutPromotion';
import { toPromotionEstimateCartLines } from '@/lib/checkout/storePromotionUtils';
import type { UseCheckoutResult } from '@/lib/hooks/useCheckout';
import type { CheckoutStep } from '@/lib/providers/CheckoutProvider';

export class SubmitCheckoutError extends Error {
  constructor(
    message: string,
    public readonly code: 'invalid_step' | 'promotion_invalid' | 'order_failed' | 'payment_failed',
  ) {
    super(message);
    this.name = 'SubmitCheckoutError';
  }
}

export type SubmitCheckoutParams = {
  step: CheckoutStep;
  checkoutContext: CreateOrderCheckoutContext;
  cart: Parameters<typeof toCreateOrderInput>[1];
  guestForm: GuestCheckoutFormState | null;
  subtotal: number;
  checkoutHook: Pick<UseCheckoutResult, 'validatePromotion' | 'createOrder' | 'createPayment'>;
  omiseToken?: string | null;
  savedPaymentMethodId?: string | null;
};

export type SubmitCheckoutResult = {
  redirectPath: string;
  paymentId: string;
  orderId: string;
};

export type SubmitCheckoutGuard = {
  inFlight: Promise<SubmitCheckoutResult> | null;
  lastKey: string | null;
};

export function createSubmitCheckoutGuard(): SubmitCheckoutGuard {
  return {
    inFlight: null,
    lastKey: null,
  };
}

function buildSubmitKey(params: SubmitCheckoutParams): string {
  return JSON.stringify({
    step: params.step,
    promotionCode: params.checkoutContext.promotionCode,
    paymentMethod: params.checkoutContext.paymentMethod,
    itemCount: params.cart.items.length,
    subtotal: params.subtotal,
  });
}

function resolvePaymentRedirectId(paymentId: string | undefined, orderId: string): string {
  // Prefer payment.id for /payment/[id]; payment page also supports orderId lookup.
  return paymentId ?? orderId;
}

async function runSubmitCheckout(params: SubmitCheckoutParams): Promise<SubmitCheckoutResult> {
  if (params.step !== 'review') {
    throw new SubmitCheckoutError(
      'คำสั่งซื้อสามารถยืนยันได้เฉพาะขั้นตอนตรวจสอบเท่านั้น',
      'invalid_step',
    );
  }

  if (params.checkoutContext.promotionCode?.trim()) {
    try {
      await validateCheckoutPromotionCode({
        code: params.checkoutContext.promotionCode,
        subtotal: params.subtotal,
        lines: toPromotionEstimateCartLines(params.cart.items),
        validatePromotion: params.checkoutHook.validatePromotion,
      });
    } catch (error) {
      if (error instanceof SoftPromotionIneligibilityError) {
        // Soft fail ≠ invalid-code toast wording path — still blocks apply at submit.
        throw new SubmitCheckoutError(error.message, 'promotion_invalid');
      }
      if (error instanceof PromotionValidationError) {
        throw new SubmitCheckoutError(error.message, 'promotion_invalid');
      }
      throw error;
    }
  }

  const orderInput = toCreateOrderInput(params.guestForm, params.cart, params.checkoutContext);

  let order: Awaited<ReturnType<UseCheckoutResult['createOrder']>>;
  try {
    order = await params.checkoutHook.createOrder(orderInput);
  } catch (error) {
    const code = extractPromotionErrorCode(error);
    // Candidate-001: hard eligibility → order error; INSUFFICIENT_QTY is never hard here.
    if (isCreateOrderHardEligibilityCode(code) || code == null) {
      const message =
        error instanceof Error && error.message ? error.message : 'ไม่สามารถสร้างคำสั่งซื้อได้';
      throw new SubmitCheckoutError(message, 'order_failed');
    }
    // Defensive: unknown non-hard promo codes still fail the order path.
    throw new SubmitCheckoutError(
      error instanceof Error ? error.message : 'ไม่สามารถสร้างคำสั่งซื้อได้',
      'order_failed',
    );
  }

  if (!order?.id) {
    throw new SubmitCheckoutError('ไม่สามารถสร้างคำสั่งซื้อได้', 'order_failed');
  }

  const apiPaymentMethod = mapCheckoutPaymentMethodForApi(
    params.checkoutContext.paymentMethod ?? order.paymentMethod,
  );

  const paymentInput = {
    orderId: order.id,
    amount: order.total,
    paymentMethod: apiPaymentMethod,
    currency: 'THB' as const,
    ...(apiPaymentMethod === 'cod'
      ? {}
      : params.savedPaymentMethodId
        ? { savedPaymentMethodId: params.savedPaymentMethodId }
        : params.omiseToken
          ? { omiseToken: params.omiseToken }
          : {}),
  };

  const payment = await params.checkoutHook.createPayment(paymentInput);
  if (!payment?.id) {
    throw new SubmitCheckoutError('ไม่สามารถสร้างรายการชำระเงินได้', 'payment_failed');
  }

  const redirectId = resolvePaymentRedirectId(payment.id, order.id);

  return {
    redirectPath: `/payment/${redirectId}`,
    paymentId: payment.id,
    orderId: order.id,
  };
}

export async function submitCheckout(
  params: SubmitCheckoutParams,
  guard: SubmitCheckoutGuard = createSubmitCheckoutGuard(),
): Promise<SubmitCheckoutResult> {
  const submitKey = buildSubmitKey(params);

  if (guard.inFlight && guard.lastKey === submitKey) {
    return guard.inFlight;
  }

  const submission = runSubmitCheckout(params);
  guard.inFlight = submission;
  guard.lastKey = submitKey;

  try {
    return await submission;
  } finally {
    guard.inFlight = null;
  }
}
