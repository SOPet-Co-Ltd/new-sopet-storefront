'use client';

import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  UpdateProfileDocument,
  type UpdateProfileInput,
  type UpdateProfileMutation,
} from '@/lib/graphql/generated/graphql';
import { MeDocument } from '@/lib/graphql/generated/graphql';

export type UpdatedProfile = UpdateProfileMutation['updateProfile'];

export type UseProfileResult = {
  updateProfile: (input: UpdateProfileInput) => Promise<UpdatedProfile | undefined>;
  updating: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useProfile(): UseProfileResult {
  const [updateProfileMutation, { loading, error }] = useMutation(UpdateProfileDocument, {
    refetchQueries: [{ query: MeDocument }],
  });

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const result = await updateProfileMutation({ variables: { input } });
      return result.data?.updateProfile;
    },
    [updateProfileMutation],
  );

  return {
    updateProfile,
    updating: loading,
    error: toHookError(error),
  };
}
