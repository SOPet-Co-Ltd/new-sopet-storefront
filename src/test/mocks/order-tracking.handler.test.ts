import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { handlers } from '@/test/mocks/handlers';
import {
  ORDER_TRACKING_EXCLUDED_PII_KEYS,
  ORDER_TRACKING_SEED_NUMBER,
  sampleOrderTracking,
  type OrderTrackingFixture,
} from '@/test/mocks/fixtures/order-tracking';

const ORDER_TRACKING_QUERY = gql`
  query OrderTracking($orderNumber: String!) {
    orderTracking(orderNumber: $orderNumber) {
      orderNumber
      status
      createdAt
      subtotal
      shippingFee
      discountAmount
      total
      items {
        storeId
        productId
        productName
        productImageUrl
        quantity
        unitPrice
        subtotal
        fulfillmentStatus
        trackingNumber
        fulfillmentProvider
        trackingUrl
      }
      storeShippings {
        storeId
        optionName
        shippingFee
      }
    }
  }
`;

type OrderTrackingQueryData = {
  orderTracking: OrderTrackingFixture;
};

function useOrderTrackingProbe(orderNumber: string) {
  return useQuery<OrderTrackingQueryData>(ORDER_TRACKING_QUERY, {
    variables: { orderNumber },
    fetchPolicy: 'network-only',
  });
}

function collectKeys(value: unknown): string[] {
  if (value === null || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectKeys(entry));
  }

  return [...Object.keys(value), ...Object.values(value).flatMap((entry) => collectKeys(entry))];
}

describe('orderTracking MSW handler', () => {
  it('registers OrderTracking handler in default handlers export', () => {
    expect(handlers.length).toBeGreaterThan(0);
    expect(
      handlers.some(
        (handler) =>
          'info' in handler &&
          typeof handler.info === 'object' &&
          handler.info !== null &&
          'operationName' in handler.info &&
          handler.info.operationName === 'OrderTracking',
      ),
    ).toBe(true);
  });

  it('returns ORD-SEED-001 fixture without PII keys', async () => {
    const { result } = renderHook(() => useOrderTrackingProbe(ORDER_TRACKING_SEED_NUMBER), {
      wrapper: createApolloTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.orderTracking).toBeDefined();
    });

    const payload = result.current.data?.orderTracking;
    expect(payload).toMatchObject({
      orderNumber: ORDER_TRACKING_SEED_NUMBER,
      status: sampleOrderTracking.status,
      subtotal: sampleOrderTracking.subtotal,
      shippingFee: sampleOrderTracking.shippingFee,
      discountAmount: sampleOrderTracking.discountAmount,
      total: sampleOrderTracking.total,
    });
    expect(payload?.items[0]).toMatchObject({
      productName: sampleOrderTracking.items[0].productName,
      productImageUrl: sampleOrderTracking.items[0].productImageUrl,
      trackingUrl: sampleOrderTracking.items[0].trackingUrl,
    });
    expect(payload?.storeShippings[0]).toMatchObject({
      optionName: sampleOrderTracking.storeShippings[0].optionName,
      shippingFee: sampleOrderTracking.storeShippings[0].shippingFee,
    });

    const responseKeys = new Set(collectKeys(payload));
    for (const excludedKey of ORDER_TRACKING_EXCLUDED_PII_KEYS) {
      expect(responseKeys.has(excludedKey)).toBe(false);
    }
  });
});
