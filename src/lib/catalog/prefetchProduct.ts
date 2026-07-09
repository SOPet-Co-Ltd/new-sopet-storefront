import { ProductByIdDocument } from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';

const prefetchedProductIds = new Set<string>();
const inflightPrefetches = new Map<string, Promise<unknown>>();

export function prefetchProductById(id: string): void {
  if (!id || prefetchedProductIds.has(id) || inflightPrefetches.has(id)) {
    return;
  }

  const promise = getApolloClient()
    .query({
      query: ProductByIdDocument,
      variables: { id },
      fetchPolicy: 'cache-first',
    })
    .then(() => {
      prefetchedProductIds.add(id);
    })
    .finally(() => {
      inflightPrefetches.delete(id);
    });

  inflightPrefetches.set(id, promise);
}
