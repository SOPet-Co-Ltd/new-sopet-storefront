'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const HEADER_SELECTOR = 'header[aria-label="Site header"]';

function isPaymentDialogTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('[role="dialog"]'));
}

function blockKeyboard(event: KeyboardEvent) {
  if (isPaymentDialogTarget(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
}

/**
 * Blocks the checkout page while payment is in flight.
 * Dialogs such as the saved-card CVV prompt stay above this layer.
 */
export function CheckoutProcessingShield() {
  useEffect(() => {
    const header = document.querySelector(HEADER_SELECTOR);
    if (header instanceof HTMLElement) {
      header.inert = true;
    }

    const active = document.activeElement;
    if (active instanceof HTMLElement && !isPaymentDialogTarget(active)) {
      active.blur();
    }

    document.addEventListener('keydown', blockKeyboard, true);
    document.addEventListener('keyup', blockKeyboard, true);

    return () => {
      if (header instanceof HTMLElement) {
        header.inert = false;
      }
      document.removeEventListener('keydown', blockKeyboard, true);
      document.removeEventListener('keyup', blockKeyboard, true);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[45] cursor-wait"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="checkout-processing-shield"
    >
      <span className="sr-only">กำลังดำเนินการชำระเงิน</span>
    </div>,
    document.body,
  );
}
