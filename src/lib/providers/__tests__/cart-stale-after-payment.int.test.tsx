/**
 * Regression: after QR payment the cart UI stayed empty until refresh even though
 * addToCart succeeded. Root causes covered here:
 * - H-C: mutation returned a different cart id than ROOT_QUERY.cart referenced
 * - H-B: a slow in-flight Cart refetch overwrote items the mutation just wrote
 */
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { Observable } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { typePolicies } from '@/lib/graphql/cachePolicies';
import { fragmentRegistry } from '@/lib/graphql/fragmentRegistry';
import { CartProvider, useCart } from '@/lib/providers/CartProvider';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

const SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>();
  return {
    ...actual,
    ensureSessionId: vi.fn(() => SESSION_ID),
    getSessionId: vi.fn(() => SESSION_ID),
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

type CartPayload = {
  __typename: 'CartType';
  id: string;
  sessionId: string | null;
  customerId: string | null;
  items: Array<{
    __typename: 'CartItemType';
    id: string;
    quantity: number;
    variantId: string;
    productVariant: {
      __typename: 'ProductVariantType';
      id: string;
      price: number;
      sku: string;
      optionsJson: string | null;
      product: {
        __typename: 'ProductType';
        id: string;
        name: string;
        slug: string;
        storeId: string;
        thumbnailUrl: string | null;
        store: { __typename: 'StoreType'; id: string; name: string; slug: string };
      };
    };
  }>;
};

function makeCart(cartId: string, itemVariantIds: string[]): CartPayload {
  return {
    __typename: 'CartType',
    id: cartId,
    sessionId: SESSION_ID,
    customerId: null,
    items: itemVariantIds.map((variantId, index) => ({
      __typename: 'CartItemType',
      id: `item-${variantId}`,
      quantity: 1,
      variantId,
      productVariant: {
        __typename: 'ProductVariantType',
        id: variantId,
        price: 100,
        sku: `SKU-${variantId}`,
        optionsJson: null,
        product: {
          __typename: 'ProductType',
          id: `product-${index}`,
          name: `Product ${index}`,
          slug: `product-${index}`,
          storeId: `store-${index}`,
          thumbnailUrl: null,
          store: {
            __typename: 'StoreType',
            id: `store-${index}`,
            name: `Store ${index}`,
            slug: `store-${index}`,
          },
        },
      },
    })),
  };
}

type PendingOperation = {
  operationName: string;
  variables: Record<string, unknown>;
  respond: (data: Record<string, unknown>) => void;
};

function createHarness() {
  const pending: PendingOperation[] = [];

  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        pending.push({
          operationName: operation.operationName ?? 'unknown',
          variables: operation.variables,
          respond: (data) => {
            observer.next({ data });
            observer.complete();
          },
        });
      }),
  );

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({ typePolicies, fragments: fragmentRegistry }),
  });

  const takePending = (operationName: string): PendingOperation => {
    const index = pending.findIndex((entry) => entry.operationName === operationName);
    if (index === -1) {
      throw new Error(
        `No pending "${operationName}" operation. Pending: ${pending
          .map((entry) => entry.operationName)
          .join(', ')}`,
      );
    }
    return pending.splice(index, 1)[0]!;
  };

  const hasPending = (operationName: string): boolean =>
    pending.some((entry) => entry.operationName === operationName);

  return { client, takePending, hasPending };
}

let capturedAddItem: ((variantId: string, quantity?: number) => Promise<void>) | null = null;
let capturedRefetch: (() => Promise<unknown>) | null = null;

function addItemFromProbe(variantId: string): Promise<void> {
  if (!capturedAddItem) {
    throw new Error('addItem not captured — is CartProvider rendered?');
  }
  return capturedAddItem(variantId);
}

function refetchFromProbe(): Promise<unknown> {
  if (!capturedRefetch) {
    throw new Error('refetch not captured — is CartProvider rendered?');
  }
  return capturedRefetch();
}

function CartProbe() {
  const { items, itemCount, loading, addItem, refetch } = useCart();
  useEffect(() => {
    capturedAddItem = addItem;
    capturedRefetch = refetch;
  });
  return (
    <div
      data-testid="probe"
      data-loading={String(loading)}
      data-item-count={String(itemCount)}
      data-variant-ids={items.map((item) => item.variantId).join(',')}
    />
  );
}

function renderCart(client: ApolloClient) {
  return render(
    <ApolloProvider client={client}>
      <CartProvider>
        <CartProbe />
      </CartProvider>
    </ApolloProvider>,
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('cart stale-UI after payment success', () => {
  it('addToCart with the same cart id updates the watched Cart query', async () => {
    const { client, takePending } = createHarness();
    renderCart(client);

    await flush();
    takePending('Cart').respond({ cart: makeCart('cart-1', []) });
    await flush();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '0');

    let addPromise: Promise<void> | undefined;
    await act(async () => {
      addPromise = addItemFromProbe('variant-a');
      await Promise.resolve();
    });
    takePending('AddToCart').respond({ addToCart: makeCart('cart-1', ['variant-a']) });
    await act(async () => {
      await addPromise;
    });

    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '1');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-variant-ids', 'variant-a');
  });

  it('addToCart with a different cart id still updates the watched Cart query', async () => {
    const { client, takePending } = createHarness();
    renderCart(client);

    await flush();
    takePending('Cart').respond({ cart: makeCart('cart-1', []) });
    await flush();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '0');

    let addPromise: Promise<void> | undefined;
    await act(async () => {
      addPromise = addItemFromProbe('variant-a');
      await Promise.resolve();
    });
    // Backend resolved a different cart row (identity split after payment / merge).
    takePending('AddToCart').respond({ addToCart: makeCart('cart-2', ['variant-a']) });
    await act(async () => {
      await addPromise;
    });

    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '1');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-variant-ids', 'variant-a');
  });

  it('in-flight Cart refetch cannot erase items written by a concurrent addToCart', async () => {
    const { client, takePending, hasPending } = createHarness();
    renderCart(client);
    await flush();

    takePending('Cart').respond({ cart: makeCart('cart-1', []) });
    await flush();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '0');

    // Refetch starts first (holds the cart op lock).
    let refetchPromise: Promise<unknown> | undefined;
    await act(async () => {
      refetchPromise = refetchFromProbe();
      await Promise.resolve();
    });
    expect(hasPending('Cart')).toBe(true);

    // addItem waits on the lock — AddToCart must not fire until refetch completes.
    let addPromise: Promise<void> | undefined;
    await act(async () => {
      addPromise = addItemFromProbe('variant-a');
      await Promise.resolve();
    });
    expect(hasPending('AddToCart')).toBe(false);

    // Slow empty refetch resolves; then the queued add runs.
    await act(async () => {
      takePending('Cart').respond({ cart: makeCart('cart-1', []) });
      await refetchPromise;
      await Promise.resolve();
    });

    expect(hasPending('AddToCart')).toBe(true);
    await act(async () => {
      takePending('AddToCart').respond({ addToCart: makeCart('cart-1', ['variant-a']) });
      await addPromise;
    });

    expect(screen.getByTestId('probe')).toHaveAttribute('data-item-count', '1');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-variant-ids', 'variant-a');
  });
});
