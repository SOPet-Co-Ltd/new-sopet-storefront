'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { FAVORITES_PAGE_SIZE } from '@/lib/constants/listPageSize';
import {
  FavoritesDocument,
  AddFavoriteDocument,
  RemoveFavoriteDocument,
  type FavoritesQuery,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export type FavoriteItem = FavoritesQuery['favorites'][number];

export type UseFavoritesParams = {
  page?: number;
  limit?: number;
};

export type UseFavoritesResult = {
  favorites: FavoriteItem[];
  loading: boolean;
  error: Error | undefined;
  page: number;
  hasMore: boolean;
  refetch: () => Promise<unknown>;
  addFavorite: (productId: string) => Promise<FavoriteItem | undefined>;
  removeFavorite: (productId: string) => Promise<boolean | undefined>;
  isFavorite: (productId: string) => boolean;
};

const EMPTY_FAVORITES: FavoriteItem[] = [];

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useFavorites(params?: UseFavoritesParams): UseFavoritesResult {
  const { isAuthenticated } = useAuth();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? FAVORITES_PAGE_SIZE;
  const variables = { page, limit };

  const { data, loading, error, refetch } = useQuery(FavoritesDocument, {
    skip: !isAuthenticated,
    variables,
  });

  const [addFavoriteMutation] = useMutation(AddFavoriteDocument, {
    refetchQueries: [{ query: FavoritesDocument, variables }],
  });
  const [removeFavoriteMutation] = useMutation(RemoveFavoriteDocument, {
    refetchQueries: [{ query: FavoritesDocument, variables }],
  });

  const favorites = data?.favorites ?? EMPTY_FAVORITES;

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
    page,
    hasMore: favorites.length >= limit,
    refetch: () => refetch(),
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
