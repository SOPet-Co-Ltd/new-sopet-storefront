import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RootLayout, { metadata } from './layout';
import AuthLayout from './(auth)/layout';
import CheckoutLayout from './(checkout)/layout';
import PaymentLayout from './(payment)/layout';

vi.mock('next/font/google', () => ({
  Google_Sans: () => ({
    variable: '--font-google-sans',
    className: 'google-sans-class',
  }),
}));

vi.mock('@/lib/providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/organisms/Header', () => ({
  Header: () => <header data-testid="checkout-header">Header</header>,
}));

describe('RootLayout', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders html with lang="th"', () => {
    act(() => {
      root.render(
        <RootLayout>
          <div>Page content</div>
        </RootLayout>,
      );
    });

    expect(document.documentElement.getAttribute('lang')).toBe('th');
  });

  it('exports Thai metadata defaults', () => {
    expect(metadata.title).toMatchObject({
      default: 'Sopet',
      template: '%s | Sopet',
    });
    expect(metadata.description).toContain('Sopet');
    expect(metadata.description).toMatch(/[\u0E00-\u0E7F]/);
  });
});

describe('route group layouts', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('AuthLayout wraps children in a main landmark', () => {
    act(() => {
      root.render(
        <AuthLayout>
          <div data-testid="auth-child">Login</div>
        </AuthLayout>,
      );
    });

    expect(container.querySelector('main')).not.toBeNull();
    expect(container.querySelector('[data-testid="auth-child"]')).not.toBeNull();
  });

  it('CheckoutLayout renders header chrome and children', () => {
    act(() => {
      root.render(
        <CheckoutLayout>
          <div data-testid="checkout-child">Checkout</div>
        </CheckoutLayout>,
      );
    });

    expect(container.querySelector('[data-testid="checkout-header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="checkout-child"]')).not.toBeNull();
  });

  it('PaymentLayout passes children through', () => {
    act(() => {
      root.render(
        <PaymentLayout>
          <div data-testid="payment-child">Payment</div>
        </PaymentLayout>,
      );
    });

    expect(container.querySelector('[data-testid="payment-child"]')).not.toBeNull();
  });
});
