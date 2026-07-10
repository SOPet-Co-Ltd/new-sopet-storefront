'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  PaymentMethodsDocument,
  AddPaymentMethodDocument,
  DeletePaymentMethodDocument,
  SetDefaultPaymentMethodDocument,
  type PaymentMethodsQuery,
  type AddPaymentMethodInput,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export type SavedPaymentMethod = PaymentMethodsQuery['paymentMethods'][number];

export type UsePaymentMethodsResult = {
  paymentMethods: SavedPaymentMethod[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  addPaymentMethod: (input: AddPaymentMethodInput) => Promise<SavedPaymentMethod | undefined>;
  deletePaymentMethod: (id: string) => Promise<boolean | undefined>;
  setDefaultPaymentMethod: (id: string) => Promise<SavedPaymentMethod | undefined>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function usePaymentMethods(): UsePaymentMethodsResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(PaymentMethodsDocument, {
    skip: !isAuthenticated,
  });

  const [addMutation] = useMutation(AddPaymentMethodDocument);
  const [deleteMutation] = useMutation(DeletePaymentMethodDocument, {
    refetchQueries: [{ query: PaymentMethodsDocument }],
    awaitRefetchQueries: false,
  });
  const [setDefaultMutation] = useMutation(SetDefaultPaymentMethodDocument, {
    refetchQueries: [{ query: PaymentMethodsDocument }],
    awaitRefetchQueries: false,
  });

  const addPaymentMethod = useCallback(
    async (input: AddPaymentMethodInput) => {
      const result = await addMutation({
        variables: { input },
        refetchQueries: [{ query: PaymentMethodsDocument }],
        awaitRefetchQueries: false,
      });

      const method = result.data?.addPaymentMethod;
      if (method) {
        return method;
      }

      if (CombinedGraphQLErrors.is(result.error)) {
        throw result.error;
      }

      throw new Error('ไม่สามารถเพิ่มบัตรได้');
    },
    [addMutation],
  );

  const deletePaymentMethod = useCallback(
    async (id: string) => {
      const result = await deleteMutation({ variables: { id } });
      return result.data?.deletePaymentMethod;
    },
    [deleteMutation],
  );

  const setDefaultPaymentMethod = useCallback(
    async (id: string) => {
      const result = await setDefaultMutation({ variables: { id } });
      return result.data?.setDefaultPaymentMethod;
    },
    [setDefaultMutation],
  );

  return {
    paymentMethods: data?.paymentMethods ?? [],
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
}
