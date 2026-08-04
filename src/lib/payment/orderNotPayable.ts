import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const PAYMENT_ORDER_NOT_PAYABLE_COPY =
  'คำสั่งซื้อนี้หมดเวลาชำระเงินแล้ว หรือถูกยกเลิกแล้ว กรุณาทำรายการสั่งซื้อใหม่';

export function hasQrExpiredAt(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiresMs = Date.parse(expiresAt);
  return !Number.isNaN(expiresMs) && expiresMs <= nowMs;
}

export function isOrderNotPayableError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((graphError) => graphError.extensions?.code === 'ORDER_NOT_PAYABLE');
  }

  if (error instanceof Error) {
    return (
      error.message.includes('ORDER_NOT_PAYABLE') ||
      error.message.includes('no longer awaiting payment')
    );
  }

  return false;
}
