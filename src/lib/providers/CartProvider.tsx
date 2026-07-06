'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  AddToCartDocument,
  CartDocument,
  MergeCartDocument,
  RemoveCartItemDocument,
  UpdateCartItemDocument,
  type CartQuery,
} from '@/lib/graphql/generated/graphql';
import {
  computeCartItemCount,
  computeCartSubtotal,
  groupCartItemsByStore,
  type StoreCartGroup,
} from '@/lib/cart/cartUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import { ensureSessionId } from '@/lib/session';

export type CartContextValue = {
  cart: CartQuery['cart'] | null;
  items: CartQuery['cart']['items'];
  itemsByStore: StoreCartGroup[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  error: Error | undefined;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refetch: () => Promise<unknown>;
};

const CartContext = createContext<CartContextValue | null>(null);

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

function getSessionIdForCart(): string {
  return ensureSessionId();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const sessionId = typeof window !== 'undefined' ? getSessionIdForCart() : null;

  const { data, loading, error, refetch } = useQuery(CartDocument, {
    variables: { sessionId: sessionId ?? undefined },
    skip: !sessionId,
    fetchPolicy: 'cache-and-network',
  });

  const [addToCartMutation] = useMutation(AddToCartDocument);
  const [updateCartItemMutation] = useMutation(UpdateCartItemDocument);
  const [removeCartItemMutation] = useMutation(RemoveCartItemDocument);
  const [mergeCartMutation] = useMutation(MergeCartDocument);

  const cart = data?.cart ?? null;
  const items = cart?.items ?? [];

  const itemsByStore = useMemo(() => groupCartItemsByStore(items), [items]);
  const itemCount = useMemo(() => computeCartItemCount(items), [items]);
  const subtotal = useMemo(() => computeCartSubtotal(items), [items]);

  const runCartMutation = useCallback(async (operation: () => Promise<unknown>, errorMessage: string) => {
      try {
        const result = (await operation()) as {
          errors?: Array<{ message: string }>;
        };
        if (result.errors?.length) {
          throw new Error(result.errors[0]?.message ?? errorMessage);
        }
      } catch (mutationError) {
        const message =
          mutationError instanceof Error ? mutationError.message : errorMessage;
        toast.error(message);
        throw mutationError;
      }
    }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const activeSessionId = getSessionIdForCart();
      await runCartMutation(
        () =>
          addToCartMutation({
            variables: {
              input: {
                variantId,
                quantity,
                sessionId: isAuthenticated ? undefined : activeSessionId,
              },
            },
          }),
        'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้',
      );
      toast.success('เพิ่มสินค้าลงตะกร้าแล้ว');
    },
    [addToCartMutation, isAuthenticated, runCartMutation],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        return;
      }

      const activeSessionId = getSessionIdForCart();
      await runCartMutation(
        () =>
          updateCartItemMutation({
            variables: {
              input: {
                itemId,
                quantity,
                sessionId: isAuthenticated ? undefined : activeSessionId,
              },
            },
          }),
        'ไม่สามารถอัปเดตจำนวนสินค้าได้',
      );
    },
    [isAuthenticated, runCartMutation, updateCartItemMutation],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const activeSessionId = getSessionIdForCart();
      await runCartMutation(
        () =>
          removeCartItemMutation({
            variables: {
              input: {
                itemId,
                sessionId: isAuthenticated ? undefined : activeSessionId,
              },
            },
          }),
        'ไม่สามารถลบสินค้าออกจากตะกร้าได้',
      );
      toast.success('ลบสินค้าออกจากตะกร้าแล้ว');
    },
    [isAuthenticated, removeCartItemMutation, runCartMutation],
  );

  useEffect(() => {
    const becameAuthenticated = isAuthenticated && !wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!becameAuthenticated || typeof window === 'undefined') {
      return;
    }

    const guestSessionId = getSessionIdForCart();

    void mergeCartMutation({
      variables: { sessionId: guestSessionId },
    })
      .then(() => refetch())
      .catch(() => {
        toast.error('ไม่สามารถรวมตะกร้าหลังเข้าสู่ระบบได้');
      });
  }, [isAuthenticated, mergeCartMutation, refetch]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items,
      itemsByStore,
      itemCount,
      subtotal,
      loading: Boolean(sessionId) && loading,
      error: toHookError(error),
      addItem,
      updateItem,
      removeItem,
      refetch: () => refetch(),
    }),
    [
      addItem,
      cart,
      error,
      itemCount,
      items,
      itemsByStore,
      loading,
      refetch,
      removeItem,
      sessionId,
      subtotal,
      updateItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
