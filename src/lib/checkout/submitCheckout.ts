import {
  toCreateOrderInput,
  type CreateOrderCheckoutContext,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import {
  mapCheckoutPaymentMethodForApi,
  isNonOmiseApiPaymentMethod,
} from '@/lib/checkout/checkoutPaymentMethod';
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
import {
  ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE,
  STORE_SUSPENSION_HOLD_COPY,
} from '@/lib/constants/storeSuspensionHoldCopy';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { mapCheckoutSuspendedStoreError } from '@/lib/store-suspension/mapSuspensionErrors';

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
  orderNumber: string | null;
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
    const suspendedMessage = mapCheckoutSuspendedStoreError(error);
    if (suspendedMessage) {
      throw new SubmitCheckoutError(suspendedMessage, 'order_failed');
    }

    const code = extractPromotionErrorCode(error);
    if (code === ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE) {
      throw new SubmitCheckoutError(
        STORE_SUSPENSION_HOLD_COPY.checkoutCreateSuspended,
        'order_failed',
      );
    }
    // Candidate-001: only hard eligibility / unknown → order_failed.
    // INSUFFICIENT_QTY is apply-skip — retry once without promo codes.
    if (isCreateOrderHardEligibilityCode(code) || code == null) {
      throw new SubmitCheckoutError(
        getErrorMessage(error, 'ไม่สามารถสร้างคำสั่งซื้อได้'),
        'order_failed',
      );
    }

    try {
      order = await params.checkoutHook.createOrder({
        ...orderInput,
        platformPromotionCode: undefined,
        storePromotionCodes: undefined,
      });
    } catch (retryError) {
      const retrySuspended = mapCheckoutSuspendedStoreError(retryError);
      if (retrySuspended) {
        throw new SubmitCheckoutError(retrySuspended, 'order_failed');
      }
      throw new SubmitCheckoutError(
        getErrorMessage(retryError, 'ไม่สามารถสร้างคำสั่งซื้อได้'),
        'order_failed',
      );
    }
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
    ...(isNonOmiseApiPaymentMethod(apiPaymentMethod)
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
    orderNumber: order.orderNumber ?? payment.orderNumber ?? null,
  };
}

export async function submitCheckout(
  params: SubmitCheckoutParams,
  guard: SubmitCheckoutGuard = createSubmitCheckoutGuard(),
): Promise<SubmitCheckoutResult> {
  // Reject any concurrent submit — including different payment/shipping keys —
  // so mid-flight UI changes cannot spawn a second order.
  if (guard.inFlight) {
    return guard.inFlight;
  }

  const submitKey = buildSubmitKey(params);
  const submission = runSubmitCheckout(params);
  guard.inFlight = submission;
  guard.lastKey = submitKey;

  try {
    return await submission;
  } finally {
    guard.inFlight = null;
  }
}
