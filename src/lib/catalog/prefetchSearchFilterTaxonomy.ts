import { ApprovedBrandsDocument, ApprovedPetTypesDocument } from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';

export type SearchFilterTaxonomyTarget = 'petTypes' | 'brands';

const prefetchedTaxonomyTargets = new Set<SearchFilterTaxonomyTarget>();
const inflightTaxonomyPrefetches = new Map<SearchFilterTaxonomyTarget, Promise<unknown>>();

function prefetchTaxonomyQuery(target: SearchFilterTaxonomyTarget): void {
  if (prefetchedTaxonomyTargets.has(target) || inflightTaxonomyPrefetches.has(target)) {
    return;
  }

  const query = target === 'petTypes' ? ApprovedPetTypesDocument : ApprovedBrandsDocument;

  const promise = getApolloClient()
    .query({
      query,
      fetchPolicy: 'cache-first',
    })
    .then(() => {
      prefetchedTaxonomyTargets.add(target);
    })
    .finally(() => {
      inflightTaxonomyPrefetches.delete(target);
    });

  inflightTaxonomyPrefetches.set(target, promise);
}

export function prefetchSearchFilterPetTypes(): void {
  prefetchTaxonomyQuery('petTypes');
}

export function prefetchSearchFilterBrands(): void {
  prefetchTaxonomyQuery('brands');
}

export function createSearchFilterSectionPrefetchHandlers(sectionId: 'pet-type' | 'brand'): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  const prefetch =
    sectionId === 'pet-type' ? prefetchSearchFilterPetTypes : prefetchSearchFilterBrands;

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}
