import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { CheckoutProvider, useCheckout, type CheckoutContextValue } from './CheckoutProvider';

function CheckoutProbe({ onContext }: { onContext: (context: CheckoutContextValue) => void }) {
  const context = useCheckout();
  onContext(context);
  return (
    <div
      data-step={context.step}
      data-address={context.selectedAddressId ?? ''}
      data-promotion={context.promotionCode ?? ''}
      data-payment={context.paymentMethod ?? ''}
      data-shipping-count={Object.keys(context.shippingByStoreId).length}
      data-required-stores={context.requiredStoreIds.length}
    />
  );
}

function renderCheckoutProbe(onContext: (context: CheckoutContextValue) => void): {
  container: HTMLDivElement;
  root: Root;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <CheckoutProvider>
        <CheckoutProbe onContext={onContext} />
      </CheckoutProvider>,
    );
  });

  return { container, root };
}

describe('CheckoutProvider', () => {
  let roots: Root[] = [];

  afterEach(() => {
    for (const root of roots) {
      act(() => {
        root.unmount();
      });
    }
    roots = [];
    document.body.innerHTML = '';
  });

  it('exposes the design-doc initial state', () => {
    let context: CheckoutContextValue | null = null;
    const { root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    expect(context).not.toBeNull();
    expect(context!.step).toBe('shipping');
    expect(context!.shippingByStoreId).toEqual({});
    expect(context!.selectedAddressId).toBeNull();
    expect(context!.promotionCode).toBeNull();
    expect(context!.paymentMethod).toBeNull();
    expect(context!.requiredStoreIds).toEqual([]);
  });

  it('updates step via setStep when shipping is complete for all stores', () => {
    let context: CheckoutContextValue | null = null;
    const { container, root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setRequiredStoreIds(['store-1']);
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setStep('payment');
    });

    expect(container.querySelector('[data-step]')?.getAttribute('data-step')).toBe('payment');
  });

  it('blocks advancing to payment when one store lacks shipping selection', () => {
    let context: CheckoutContextValue | null = null;
    const { container, root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setRequiredStoreIds(['store-1', 'store-2']);
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setStep('payment');
    });

    expect(container.querySelector('[data-step]')?.getAttribute('data-step')).toBe('shipping');
    expect(context!.canAdvanceToPayment()).toBe(false);
  });

  it('allows advancing to payment when every required store has shipping', () => {
    let context: CheckoutContextValue | null = null;
    const { root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setRequiredStoreIds(['store-1', 'store-2']);
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setShipping('store-2', { shippingOptionId: 'ship-opt-2' });
    });

    expect(context!.canAdvanceToPayment()).toBe(true);

    act(() => {
      context!.setStep('payment');
    });

    expect(context!.step).toBe('payment');
  });

  it('blocks advancing to review without a payment method', () => {
    let context: CheckoutContextValue | null = null;
    const { root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setRequiredStoreIds(['store-1']);
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setStep('payment');
      context!.setStep('review');
    });

    expect(context!.step).toBe('payment');
    expect(context!.canAdvanceToReview()).toBe(false);
  });

  it('stores per-store shipping via setShipping', () => {
    let context: CheckoutContextValue | null = null;
    const { container, root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
    });

    expect(context!.shippingByStoreId).toEqual({
      'store-1': { shippingOptionId: 'ship-opt-1' },
    });
    expect(
      container.querySelector('[data-shipping-count]')?.getAttribute('data-shipping-count'),
    ).toBe('1');
  });

  it('restores defaults when reset is called', () => {
    let context: CheckoutContextValue | null = null;
    const { container, root } = renderCheckoutProbe((value) => {
      context = value;
    });
    roots.push(root);

    act(() => {
      context!.setRequiredStoreIds(['store-1']);
      context!.setStep('review');
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setAddress('addr-1');
      context!.setPromotion('SAVE10');
      context!.setPaymentMethod('card');
    });

    act(() => {
      context!.reset();
    });

    expect(context!.step).toBe('shipping');
    expect(context!.shippingByStoreId).toEqual({});
    expect(context!.selectedAddressId).toBeNull();
    expect(context!.promotionCode).toBeNull();
    expect(context!.paymentMethod).toBeNull();
    expect(context!.requiredStoreIds).toEqual([]);
    expect(container.querySelector('[data-step]')?.getAttribute('data-step')).toBe('shipping');
  });

  it('throws when useCheckout is used outside CheckoutProvider', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    expect(() => {
      act(() => {
        root.render(<CheckoutProbe onContext={() => {}} />);
      });
    }).toThrow('useCheckout must be used within CheckoutProvider');
  });
});

describe('CheckoutProvider imports', () => {
  it('does not import Zustand', () => {
    const source = readFileSync(resolve(import.meta.dirname, 'CheckoutProvider.tsx'), 'utf8');

    expect(source).not.toMatch(/zustand/i);
  });
});
