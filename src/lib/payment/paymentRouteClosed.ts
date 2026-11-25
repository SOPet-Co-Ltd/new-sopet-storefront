const COMPLETED_ORDER_KEY = 'sopet.payment.completedOrder';

export type PaymentRouteClosedInput = {
  status: string;
  orderId?: string | null;
  orderStatus?: string | null;
};

/** Missing status is treated as still awaiting payment until the API reports otherwise. */
export function isOrderAwaitingPayment(orderStatus: string | null | undefined): boolean {
  if (orderStatus == null || orderStatus === '') {
    return true;
  }
  return orderStatus === 'pending_payment' || orderStatus === 'pending';
}

/**
 * Payment page must not show QR / retry once this charge is paid or the order
 * has left the awaiting-payment states.
 */
export function isPaymentRouteClosed(payment: PaymentRouteClosedInput): boolean {
  if (payment.status === 'paid') {
    return true;
  }
  return !isOrderAwaitingPayment(payment.orderStatus);
}

/**
 * Closed paid/fulfillment orders go to thank-you. Cancelled and refunded stay
 * on the not-payable panel with a home link.
 */
export function shouldHandoffToThankYou(payment: PaymentRouteClosedInput): boolean {
  if (!payment.orderId) {
    return false;
  }
  if (payment.status === 'paid') {
    return true;
  }
  if (!isPaymentRouteClosed(payment)) {
    return false;
  }
  const orderStatus = payment.orderStatus;
  return orderStatus !== 'cancelled' && orderStatus !== 'refunded';
}

export function markPaymentOrderCompleted(orderId: string): void {
  if (typeof window === 'undefined' || !orderId) {
    return;
  }
  try {
    window.sessionStorage.setItem(COMPLETED_ORDER_KEY, orderId);
  } catch {
    // ignore storage failures
  }
}

export function getCompletedPaymentOrderId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage.getItem(COMPLETED_ORDER_KEY);
  } catch {
    return null;
  }
}

export function isPaymentOrderCompletedInSession(orderId: string | null | undefined): boolean {
  if (!orderId) {
    return false;
  }
  return getCompletedPaymentOrderId() === orderId;
}

export function clearCompletedPaymentOrder(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(COMPLETED_ORDER_KEY);
  } catch {
    // ignore storage failures
  }
}
