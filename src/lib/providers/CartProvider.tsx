'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  selectedItems: CartQuery['cart']['items'];
  selectedItemsByStore: StoreCartGroup[];
  selectedItemCount: number;
  selectedSubtotal: number;
  allItemsSelected: boolean;
  isItemSelected: (itemId: string) => boolean;
  isStoreSelected: (storeId: string) => boolean;
  toggleItemSelected: (itemId: string) => void;
  setStoreSelected: (storeId: string, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
  loading: boolean;
  error: Error | undefined;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  changeItemVariant: (itemId: string, variantId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  pruneDeselectedIds: (itemIds: string[]) => void;
  refetch: () => Promise<unknown>;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_SELECTION_STORAGE_KEY = 'sopet.cart.deselected';

function loadDeselectedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(CART_SELECTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

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

  // `sessionId` is null during SSR but defined on the client, which flips the
  // derived `loading` state between the server and the first client render.
  // Track hydration so the initial client render matches the server output.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

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
  const items = useMemo(() => cart?.items ?? [], [cart]);

  const itemsByStore = useMemo(() => groupCartItemsByStore(items), [items]);
  const itemCount = useMemo(() => computeCartItemCount(items), [items]);
  const subtotal = useMemo(() => computeCartSubtotal(items), [items]);

  // Selection is modeled as the set of explicitly de-selected item ids, so newly
  // added items default to selected without needing to reconcile against the cart.
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(
    () => new Set(loadDeselectedIds()),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        CART_SELECTION_STORAGE_KEY,
        JSON.stringify(Array.from(deselectedIds)),
      );
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }, [deselectedIds]);

  const selectedItems = useMemo(
    () => items.filter((item) => !deselectedIds.has(item.id)),
    [items, deselectedIds],
  );
  const selectedItemsByStore = useMemo(
    () => groupCartItemsByStore(selectedItems),
    [selectedItems],
  );
  const selectedItemCount = useMemo(
    () => computeCartItemCount(selectedItems),
    [selectedItems],
  );
  const selectedSubtotal = useMemo(
    () => computeCartSubtotal(selectedItems),
    [selectedItems],
  );
  const allItemsSelected =
    items.length > 0 && items.every((item) => !deselectedIds.has(item.id));

  const isItemSelected = useCallback(
    (itemId: string) => !deselectedIds.has(itemId),
    [deselectedIds],
  );

  const isStoreSelected = useCallback(
    (storeId: string) => {
      const group = itemsByStore.find((entry) => entry.storeId === storeId);
      if (!group || group.items.length === 0) return false;
      return group.items.every((item) => !deselectedIds.has(item.id));
    },
    [itemsByStore, deselectedIds],
  );

  const toggleItemSelected = useCallback((itemId: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const setStoreSelected = useCallback(
    (storeId: string, selected: boolean) => {
      const group = itemsByStore.find((entry) => entry.storeId === storeId);
      if (!group) return;
      setDeselectedIds((prev) => {
        const next = new Set(prev);
        for (const item of group.items) {
          if (selected) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
        }
        return next;
      });
    },
    [itemsByStore],
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      setDeselectedIds(() =>
        selected ? new Set() : new Set(items.map((item) => item.id)),
      );
    },
    [items],
  );

  const pruneDeselectedIds = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return;
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      for (const itemId of itemIds) {
        next.delete(itemId);
      }
      return next;
    });
  }, []);

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

  // The backend has no dedicated "change variant" mutation. Changing only the
  // quantity is a plain update; switching variant is modeled as adding the new
  // variant with the chosen quantity and removing the old line.
  const changeItemVariant = useCallback(
    async (itemId: string, variantId: string, quantity: number) => {
      const target = items.find((item) => item.id === itemId);
      if (!target) {
        return;
      }

      const nextQuantity = Math.max(quantity, 1);
      const sameVariant = target.variantId === variantId;
      if (sameVariant && target.quantity === nextQuantity) {
        return;
      }

      const activeSessionId = getSessionIdForCart();
      const sessionArg = isAuthenticated ? undefined : activeSessionId;

      if (sameVariant) {
        await runCartMutation(
          () =>
            updateCartItemMutation({
              variables: { input: { itemId, quantity: nextQuantity, sessionId: sessionArg } },
            }),
          'ไม่สามารถเปลี่ยนตัวเลือกสินค้าได้',
        );
      } else {
        await runCartMutation(async () => {
          await addToCartMutation({
            variables: {
              input: { variantId, quantity: nextQuantity, sessionId: sessionArg },
            },
          });
          return removeCartItemMutation({
            variables: { input: { itemId, sessionId: sessionArg } },
          });
        }, 'ไม่สามารถเปลี่ยนตัวเลือกสินค้าได้');
      }

      toast.success('เปลี่ยนตัวเลือกสินค้าแล้ว');
    },
    [
      addToCartMutation,
      isAuthenticated,
      items,
      removeCartItemMutation,
      runCartMutation,
      updateCartItemMutation,
    ],
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
      selectedItems,
      selectedItemsByStore,
      selectedItemCount,
      selectedSubtotal,
      allItemsSelected,
      isItemSelected,
      isStoreSelected,
      toggleItemSelected,
      setStoreSelected,
      setAllSelected,
      loading: !hydrated || (Boolean(sessionId) && loading),
      error: toHookError(error),
      addItem,
      updateItem,
      changeItemVariant,
      removeItem,
      pruneDeselectedIds,
      refetch: () => refetch(),
    }),
    [
      addItem,
      allItemsSelected,
      cart,
      changeItemVariant,
      error,
      hydrated,
      isItemSelected,
      isStoreSelected,
      itemCount,
      items,
      itemsByStore,
      loading,
      pruneDeselectedIds,
      refetch,
      removeItem,
      selectedItemCount,
      selectedItems,
      selectedItemsByStore,
      selectedSubtotal,
      sessionId,
      setAllSelected,
      setStoreSelected,
      subtotal,
      toggleItemSelected,
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
