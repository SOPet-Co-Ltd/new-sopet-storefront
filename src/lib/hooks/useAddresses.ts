'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AddressesDocument,
  CreateAddressDocument,
  DeleteAddressDocument,
  SetDefaultAddressDocument,
  UpdateAddressDocument,
  type AddressesQuery,
  type CreateAddressInput,
  type UpdateAddressInput,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export type SavedAddress = AddressesQuery['addresses'][number];

export type UseAddressesResult = {
  addresses: SavedAddress[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  createAddress: (input: CreateAddressInput) => Promise<SavedAddress | undefined>;
  updateAddress: (
    id: string,
    input: UpdateAddressInput,
  ) => Promise<SavedAddress | undefined>;
  deleteAddress: (id: string) => Promise<boolean | undefined>;
  setDefaultAddress: (id: string) => Promise<SavedAddress | undefined>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useAddresses(): UseAddressesResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(AddressesDocument, {
    skip: !isAuthenticated,
  });

  const [createAddressMutation] = useMutation(CreateAddressDocument, {
    refetchQueries: [{ query: AddressesDocument }],
  });
  const [updateAddressMutation] = useMutation(UpdateAddressDocument, {
    refetchQueries: [{ query: AddressesDocument }],
  });
  const [deleteAddressMutation] = useMutation(DeleteAddressDocument, {
    refetchQueries: [{ query: AddressesDocument }],
  });
  const [setDefaultAddressMutation] = useMutation(SetDefaultAddressDocument, {
    refetchQueries: [{ query: AddressesDocument }],
  });

  const createAddress = useCallback(
    async (input: CreateAddressInput) => {
      const result = await createAddressMutation({ variables: { input } });
      return result.data?.createAddress;
    },
    [createAddressMutation],
  );

  const updateAddress = useCallback(
    async (id: string, input: UpdateAddressInput) => {
      const result = await updateAddressMutation({ variables: { id, input } });
      return result.data?.updateAddress;
    },
    [updateAddressMutation],
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      const result = await deleteAddressMutation({ variables: { id } });
      return result.data?.deleteAddress;
    },
    [deleteAddressMutation],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      const result = await setDefaultAddressMutation({ variables: { id } });
      return result.data?.setDefaultAddress;
    },
    [setDefaultAddressMutation],
  );

  return {
    addresses: data?.addresses ?? [],
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
