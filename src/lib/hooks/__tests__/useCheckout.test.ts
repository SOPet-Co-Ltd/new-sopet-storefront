import { ApolloProvider } from '@apollo/client/react';
import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApolloClient } from '@/lib/graphql/client';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { useShippingOptions } from '@/lib/hooks/useShippingOptions';
import { server } from '@/test/mocks/server';
import {
  CHECKOUT_STORE_ID,
  sampleOrder,
  samplePaidPayment,
  samplePendingPayment,
  samplePromotionValidation,
  sampleSavedAddress,
  sampleShippingOption,
} from '@/test/mocks/fixtures/checkout';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ApolloProvider, { client }, children);
  };
}

afterEach(async () => {
  mockUseAuth.mockReset();
  await getApolloClient().clearStore();
});

describe('useAddresses', () => {
  it('skips the addresses query when anonymous', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.addresses).toEqual([]);
  });

  it('returns saved addresses when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    });

    server.use(
      graphql.query('Addresses', () => {
        return HttpResponse.json({
          data: { addresses: [sampleSavedAddress] },
        });
      }),
    );

    const { result } = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.addresses[0]?.fullName).toBe('สมชาย ใจดี');
    });

    expect(result.current.loading).toBe(false);
  });
});

describe('useShippingOptions', () => {
  it('returns shipping options for a store', async () => {
    server.use(
      graphql.query('StoreShippingOptions', ({ variables }) => {
        expect(variables).toMatchObject({ storeId: CHECKOUT_STORE_ID });
        return HttpResponse.json({
          data: { storeShippingOptions: [sampleShippingOption] },
        });
      }),
    );

    const { result } = renderHook(() => useShippingOptions(CHECKOUT_STORE_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.options[0]?.name).toBe('จัดส่งมาตรฐาน');
    });

    expect(result.current.options).toHaveLength(1);
  });
});

describe('useCheckout', () => {
  it('returns promotion validation payload', async () => {
    server.use(
      graphql.query('ValidatePromotion', ({ variables }) => {
        expect(variables).toMatchObject({
          input: { code: 'SAVE10', subtotal: 500 },
        });
        return HttpResponse.json({
          data: { validatePromotion: samplePromotionValidation },
        });
      }),
    );

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    const validation = await result.current.validatePromotion({
      code: 'SAVE10',
      subtotal: 500,
    });

    expect(validation).toEqual(samplePromotionValidation);
  });

  it('calls createOrder and createPayment with typed variables', async () => {
    server.use(
      graphql.mutation('CreateOrder', ({ variables }) => {
        expect(variables).toMatchObject({
          input: {
            paymentMethod: 'promptpay',
            savedAddressId: sampleSavedAddress.id,
          },
        });
        return HttpResponse.json({
          data: { createOrder: sampleOrder },
        });
      }),
      graphql.mutation('CreatePayment', ({ variables }) => {
        expect(variables).toMatchObject({
          input: {
            orderId: sampleOrder.id,
            amount: sampleOrder.total,
            paymentMethod: 'promptpay',
          },
        });
        return HttpResponse.json({
          data: { createPayment: samplePendingPayment },
        });
      }),
    );

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    const order = await result.current.createOrder({
      paymentMethod: 'promptpay',
      savedAddressId: sampleSavedAddress.id,
      items: sampleOrder.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });

    const payment = await result.current.createPayment({
      orderId: order?.id ?? '',
      amount: order?.total ?? 0,
      paymentMethod: 'promptpay',
    });

    expect(order?.orderNumber).toBe('ORD-1001');
    expect(payment?.status).toBe('pending');
  });

  it('integrates addresses, shipping, and checkout mutations via MSW', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    server.use(
      graphql.query('Addresses', () =>
        HttpResponse.json({ data: { addresses: [sampleSavedAddress] } }),
      ),
      graphql.query('StoreShippingOptions', () =>
        HttpResponse.json({ data: { storeShippingOptions: [sampleShippingOption] } }),
      ),
      graphql.query('ValidatePromotion', () =>
        HttpResponse.json({ data: { validatePromotion: samplePromotionValidation } }),
      ),
      graphql.mutation('CreateOrder', () =>
        HttpResponse.json({ data: { createOrder: sampleOrder } }),
      ),
      graphql.mutation('CreatePayment', () =>
        HttpResponse.json({ data: { createPayment: samplePaidPayment } }),
      ),
    );

    const addressesHook = renderHook(() => useAddresses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(addressesHook.result.current.addresses[0]?.id).toBe(sampleSavedAddress.id);
    });

    const shippingHook = renderHook(() => useShippingOptions(CHECKOUT_STORE_ID), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(shippingHook.result.current.options[0]?.id).toBe(sampleShippingOption.id);
    });

    const checkoutHook = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    const validation = await checkoutHook.result.current.validatePromotion({
      code: 'SAVE10',
      subtotal: sampleOrder.subtotal,
    });
    const order = await checkoutHook.result.current.createOrder({
      paymentMethod: 'promptpay',
      savedAddressId: sampleSavedAddress.id,
      items: sampleOrder.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
    const payment = await checkoutHook.result.current.createPayment({
      orderId: order?.id ?? '',
      amount: order?.total ?? 0,
      paymentMethod: 'promptpay',
    });

    expect(validation?.discountAmount).toBe(10);
    expect(order?.orderNumber).toBe('ORD-1001');
    expect(payment?.status).toBe('paid');
  });
});
