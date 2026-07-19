import { delay, graphql, HttpResponse } from 'msw';
import { samplePendingPayment, sampleRetryPendingPayment } from '@/test/mocks/fixtures/checkout';

export type MidQrPaymentFixture = typeof samplePendingPayment;

export const ORDER_NOT_PAYABLE_MESSAGE = 'This order is no longer awaiting payment';

/** Live Mid-QR: pending PromptPay with non-expired QR (CTA eligible). */
export const midQrLivePayment: MidQrPaymentFixture = {
  ...samplePendingPayment,
  qrCodeUrl: 'https://example.com/qr.png',
  expiresAt: '2030-01-01T00:00:00.000Z',
  authorizeUri: null,
  paymentMethod: 'promptpay',
  status: 'pending',
};

/** QR-expired interim: pending + qrCodeUrl + past expiresAt. */
export const midQrExpiredInterimPayment: MidQrPaymentFixture = {
  ...midQrLivePayment,
  expiresAt: '2020-01-01T00:00:00.000Z',
};

export const WAIT_RETURN_AUTHORIZE_URI = 'https://pay.omise.co/offsites/ofsp_test/pay';

/** WaitReturn: pending card with authorizeUri (after one-shot redirect gate). */
export const waitReturnPayment: MidQrPaymentFixture = {
  ...samplePendingPayment,
  qrCodeUrl: null,
  authorizeUri: WAIT_RETURN_AUTHORIZE_URI,
  paymentMethod: 'credit_card',
  expiresAt: null,
  status: 'pending',
};

/** Failed payment — PaymentRetryPanel always expanded. */
export const failedPayment: MidQrPaymentFixture = {
  ...waitReturnPayment,
  status: 'failed',
  authorizeUri: null,
};

export function paymentQueryHandler(payment: MidQrPaymentFixture) {
  return graphql.query('Payment', () => HttpResponse.json({ data: { payment } }));
}

export function createPaymentSuccessHandler(
  created: MidQrPaymentFixture = sampleRetryPendingPayment,
  options?: { onVariables?: (variables: unknown) => void; delayMs?: number },
) {
  return graphql.mutation('CreatePayment', async ({ variables }) => {
    options?.onVariables?.(variables);
    if (options?.delayMs) {
      await delay(options.delayMs);
    }
    return HttpResponse.json({ data: { createPayment: created } });
  });
}

export function createPaymentSameIdHandler() {
  return graphql.mutation('CreatePayment', () =>
    HttpResponse.json({
      data: {
        createPayment: {
          ...samplePendingPayment,
          id: samplePendingPayment.id,
        },
      },
    }),
  );
}

export function createPaymentOrderNotPayableHandler() {
  return graphql.mutation('CreatePayment', () =>
    HttpResponse.json({
      errors: [
        {
          message: ORDER_NOT_PAYABLE_MESSAGE,
          extensions: { code: 'ORDER_NOT_PAYABLE' },
        },
      ],
    }),
  );
}
