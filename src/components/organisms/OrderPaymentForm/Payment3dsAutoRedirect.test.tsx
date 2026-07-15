import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Payment3dsAutoRedirect,
  resetPayment3dsAutoRedirectMemory,
  threeDSAutoRedirectStorageKey,
} from './Payment3dsAutoRedirect';

const PAYMENT_ID = 'pay-111';
const AUTHORIZE_URI = 'https://pay.omise.co/offsites/ofsp_test/pay';
const OTHER_URI = 'https://pay.omise.co/offsites/ofsp_test/pay-other';

describe('Payment3dsAutoRedirect', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
    navigate.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
  });

  it('first effect with authorizeUri redirects once and writes key before navigate', () => {
    navigate.mockImplementation(() => {
      // Roundtrip: value written before navigate must equal authorizeUri compared on return
      expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(PAYMENT_ID))).toBe(AUTHORIZE_URI);
    });

    render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(AUTHORIZE_URI);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(PAYMENT_ID))).toBe(AUTHORIZE_URI);
  });

  it('pre-seeded same URI does not redirect (same-value / AC-012)', () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(PAYMENT_ID), AUTHORIZE_URI);

    render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).not.toHaveBeenCalled();
  });

  it('null or empty authorizeUri does not force redirect (empty input)', () => {
    const { rerender } = render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={null}
        navigate={navigate}
      />,
    );
    expect(navigate).not.toHaveBeenCalled();

    rerender(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri=""
        navigate={navigate}
      />,
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sessionStorage unavailable uses in-memory fallback and skips on remount (unavailable boundary)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sessionStorage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sessionStorage unavailable');
    });

    const { unmount } = render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(AUTHORIZE_URI);

    unmount();
    navigate.mockReset();

    render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).not.toHaveBeenCalled();
  });

  it('new paymentId uses a distinct key and can auto-redirect again', () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(PAYMENT_ID), AUTHORIZE_URI);
    const newPaymentId = 'pay-222';

    render(
      <Payment3dsAutoRedirect
        paymentId={newPaymentId}
        status="pending"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(newPaymentId))).toBe(AUTHORIZE_URI);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(PAYMENT_ID))).toBe(AUTHORIZE_URI);
  });

  it('changed authorizeUri on same paymentId allows a new auto-redirect', () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(PAYMENT_ID), AUTHORIZE_URI);

    render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="pending"
        authorizeUri={OTHER_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).toHaveBeenCalledWith(OTHER_URI);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(PAYMENT_ID))).toBe(OTHER_URI);
  });

  it('does not redirect when status is not pending', () => {
    render(
      <Payment3dsAutoRedirect
        paymentId={PAYMENT_ID}
        status="paid"
        authorizeUri={AUTHORIZE_URI}
        navigate={navigate}
      />,
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(PAYMENT_ID))).toBeNull();
  });
});
