'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  FavoritesDocument,
  AddFavoriteDocument,
  RemoveFavoriteDocument,
  type FavoritesQuery,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export type FavoriteItem = FavoritesQuery['favorites'][number];

export type UseFavoritesResult = {
  favorites: FavoriteItem[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  addFavorite: (productId: string) => Promise<FavoriteItem | undefined>;
  removeFavorite: (productId: string) => Promise<boolean | undefined>;
  isFavorite: (productId: string) => boolean;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useFavorites(): UseFavoritesResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(FavoritesDocument, {
    skip: !isAuthenticated,
  });

  const [addFavoriteMutation] = useMutation(AddFavoriteDocument, {
    refetchQueries: [{ query: FavoritesDocument }],
  });
  const [removeFavoriteMutation] = useMutation(RemoveFavoriteDocument, {
    refetchQueries: [{ query: FavoritesDocument }],
  });

  const favorites = data?.favorites ?? [];

  const addFavorite = useCallback(
    async (productId: string) => {
      const result = await addFavoriteMutation({ variables: { input: { productId } } });
      return result.data?.addFavorite;
    },
    [addFavoriteMutation],
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      const result = await removeFavoriteMutation({ variables: { input: { productId } } });
      return result.data?.removeFavorite;
    },
    [removeFavoriteMutation],
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.productId === productId),
    [favorites],
  );

  return {
    favorites,
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
