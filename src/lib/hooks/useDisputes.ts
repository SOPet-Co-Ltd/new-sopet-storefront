'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  MyDisputesDocument,
  CreateDisputeDocument,
  type MyDisputesQuery,
  type CreateDisputeInput,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export type DisputeItem = MyDisputesQuery['myDisputes'][number];

export type UseDisputesResult = {
  disputes: DisputeItem[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  createDispute: (input: CreateDisputeInput) => Promise<DisputeItem | undefined>;
  creating: boolean;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useDisputes(): UseDisputesResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(MyDisputesDocument, {
    skip: !isAuthenticated,
  });

  const [createDisputeMutation, { loading: creating }] = useMutation(CreateDisputeDocument, {
    refetchQueries: [{ query: MyDisputesDocument }],
  });

  const createDispute = useCallback(
    async (input: CreateDisputeInput) => {
      const result = await createDisputeMutation({ variables: { input } });
      return result.data?.createDispute;
    },
    [createDisputeMutation],
  );

  return {
    disputes: data?.myDisputes ?? [],
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    createDispute,
    creating,
  };
}
