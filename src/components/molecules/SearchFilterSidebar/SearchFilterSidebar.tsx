'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { UpArrowIcon } from '@/components/atoms/icons/filled/UpArrowIcon';
import { FilterFunnelIcon } from '@/components/atoms/icons/filled/FilterFunnelIcon';
import {
  ApprovedBrandsDocument,
  ApprovedPetTypesDocument,
  ApprovedTagsDocument,
} from '@/lib/graphql/generated/graphql';
import { createSearchFilterSectionPrefetchHandlers } from '@/lib/catalog/prefetchSearchFilterTaxonomy';
import { cn } from '@/lib/utils';
import { parseSearchFilters } from '@/lib/search/searchFilters';
import {
  SEARCH_FILTER_PRICE_MAX,
  SEARCH_FILTER_PRICE_MIN,
  SearchFilterPriceRange,
} from './SearchFilterPriceRange';

const FILTER_SECTIONS = [
  { id: 'pet-type', label: 'ประเภทสัตว์เลี้ยง' },
  { id: 'brand', label: 'แบรนด์' },
  { id: 'tag', label: 'แท็ก' },
  { id: 'price', label: 'ราคา' },
] as const;

type FilterSectionId = (typeof FILTER_SECTIONS)[number]['id'];

type SearchFilterSidebarProps = {
  className?: string;
};

type FilterOption = {
  id: string;
  label: string;
};

function chunkPairs<T>(items: T[]): Array<[T | undefined, T | undefined]> {
  const pairs: Array<[T | undefined, T | undefined]> = [];

  for (let index = 0; index < items.length; index += 2) {
    pairs.push([items[index], items[index + 1]]);
  }

  return pairs;
}

function parsePetTypeIds(value: string | null): Set<string> {
  return new Set(
    parseSearchFilters({ get: (key) => (key === 'petType' ? value : null) }).petTypeIds,
  );
}

function parseBrandIdList(value: string | null): Set<string> {
  return new Set(parseSearchFilters({ get: (key) => (key === 'brand' ? value : null) }).brandIds);
}

function parseTagId(value: string | null): string | null {
  return parseSearchFilters({ get: (key) => (key === 'tag' ? value : null) }).tagId ?? null;
}

function parseMinPrice(value: string | null): number {
  return (
    parseSearchFilters({ get: (key) => (key === 'minPrice' ? value : null) }).minPrice ??
    SEARCH_FILTER_PRICE_MIN
  );
}

function parseMaxPrice(value: string | null): number {
  return (
    parseSearchFilters({ get: (key) => (key === 'maxPrice' ? value : null) }).maxPrice ??
    SEARCH_FILTER_PRICE_MAX
  );
}

type FilterState = {
  petTypeIds: Set<string>;
  brandIds: Set<string>;
  tagId: string | null;
  minPrice: number;
  maxPrice: number;
};

function buildFilterSearchParams(
  baseParams: URLSearchParams,
  filters: FilterState,
): URLSearchParams {
  const params = new URLSearchParams(baseParams.toString());

  if (filters.petTypeIds.size > 0) {
    params.set('petType', [...filters.petTypeIds].join(','));
  } else {
    params.delete('petType');
  }

  if (filters.brandIds.size > 0) {
    params.set('brand', [...filters.brandIds].join(','));
  } else {
    params.delete('brand');
  }

  if (filters.tagId) {
    params.set('tag', filters.tagId);
  } else {
    params.delete('tag');
  }

  if (filters.minPrice > SEARCH_FILTER_PRICE_MIN) {
    params.set('minPrice', String(filters.minPrice));
  } else {
    params.delete('minPrice');
  }

  if (filters.maxPrice < SEARCH_FILTER_PRICE_MAX) {
    params.set('maxPrice', String(filters.maxPrice));
  } else {
    params.delete('maxPrice');
  }

  params.delete('page');

  return params;
}

function FilterCheckboxRow({
  left,
  right,
  selectedIds,
  onToggle,
}: {
  left?: FilterOption;
  right?: FilterOption;
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const renderOption = (option?: FilterOption) => {
    if (!option) {
      return <div className="min-w-0 flex-1" aria-hidden />;
    }

    const checked = selectedIds.has(option.id);

    return (
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <Checkbox
          size="sm"
          checked={checked}
          aria-label={option.label}
          onChange={(nextChecked) => onToggle(option.id, nextChecked)}
        />
        <span className="truncate sop-body-sm-regular text-sop-neutral-gray-200">
          {option.label}
        </span>
      </label>
    );
  };

  return (
    <div className="flex w-full gap-2 px-4">
      <div className="flex w-[150px] shrink-0 items-center">{renderOption(left)}</div>
      {renderOption(right)}
    </div>
  );
}

function FilterCheckboxGrid({
  options,
  selectedIds,
  onToggle,
}: {
  options: FilterOption[];
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const rows = chunkPairs(options);

  return (
    <div className="flex flex-col gap-2">
      {rows.map(([left, right], index) => (
        <FilterCheckboxRow
          key={`${left?.id ?? 'empty'}-${right?.id ?? 'empty'}-${index}`}
          left={left}
          right={right}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function SearchFilterPriceSection({
  initialMinPrice,
  initialMaxPrice,
  urlFilters,
  pushFilters,
}: {
  initialMinPrice: number;
  initialMaxPrice: number;
  urlFilters: FilterState;
  pushFilters: (filters: FilterState) => void;
}) {
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const handleClearPrice = useCallback(() => {
    const clearedMinPrice = SEARCH_FILTER_PRICE_MIN;
    const clearedMaxPrice = SEARCH_FILTER_PRICE_MAX;

    setMinPrice(clearedMinPrice);
    setMaxPrice(clearedMaxPrice);
    pushFilters({
      ...urlFilters,
      minPrice: clearedMinPrice,
      maxPrice: clearedMaxPrice,
    });
  }, [pushFilters, urlFilters]);

  const handleApplyPrice = useCallback(() => {
    pushFilters({
      ...urlFilters,
      minPrice,
      maxPrice,
    });
  }, [maxPrice, minPrice, pushFilters, urlFilters]);

  return (
    <div className="flex flex-col">
      <SearchFilterPriceRange
        minValue={minPrice}
        maxValue={maxPrice}
        onMinChange={setMinPrice}
        onMaxChange={setMaxPrice}
      />

      <div className="flex items-start justify-center gap-3 px-4 pt-5">
        <Button
          type="button"
          size="sm"
          rounded="full"
          variant="outline"
          className="h-8 w-[130px] min-w-[130px] border-sop-additionalblue-400 bg-transparent text-sop-additionalblue-400 hover:bg-sop-additionalblue-100"
          onClick={handleClearPrice}
        >
          ล้างค่า
        </Button>
        <Button
          type="button"
          size="sm"
          rounded="full"
          className="h-8 w-[130px] min-w-[130px] border-transparent bg-sop-additionalblue-400 text-sop-neutral-grayfixed-600 hover:bg-sop-additionalblue-500"
          onClick={handleApplyPrice}
        >
          ตกลง
        </Button>
      </div>
    </div>
  );
}

export function SearchFilterSidebar({ className }: SearchFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedSections, setExpandedSections] = useState<Set<FilterSectionId>>(() => new Set());

  const petTypeExpanded = expandedSections.has('pet-type');
  const brandExpanded = expandedSections.has('brand');
  const tagExpanded = expandedSections.has('tag');

  const { data: petTypesData } = useQuery(ApprovedPetTypesDocument, {
    skip: !petTypeExpanded,
  });
  const { data: brandsData } = useQuery(ApprovedBrandsDocument, {
    skip: !brandExpanded,
  });
  const {
    data: tagsData,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(ApprovedTagsDocument, {
    skip: !tagExpanded,
  });

  const petTypeOptions = useMemo<FilterOption[]>(
    () =>
      (petTypesData?.approvedPetTypes ?? []).map((petType) => ({
        id: petType.id,
        label: petType.name,
      })),
    [petTypesData?.approvedPetTypes],
  );

  const brandOptions = useMemo<FilterOption[]>(
    () =>
      (brandsData?.approvedBrands ?? []).map((brand) => ({
        id: brand.id,
        label: brand.name,
      })),
    [brandsData?.approvedBrands],
  );

  const tagOptions = useMemo<FilterOption[]>(
    () =>
      (tagsData?.approvedTags ?? []).map((tag) => ({
        id: tag.id,
        label: tag.name,
      })),
    [tagsData?.approvedTags],
  );

  const urlFilters = useMemo<FilterState>(
    () => ({
      petTypeIds: parsePetTypeIds(searchParams.get('petType')),
      brandIds: parseBrandIdList(searchParams.get('brand')),
      tagId: parseTagId(searchParams.get('tag')),
      minPrice: parseMinPrice(searchParams.get('minPrice')),
      maxPrice: parseMaxPrice(searchParams.get('maxPrice')),
    }),
    [searchParams],
  );

  const [selectedPetTypeIds, setSelectedPetTypeIds] = useState<Set<string>>(
    () => urlFilters.petTypeIds,
  );
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(() => urlFilters.brandIds);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(() => urlFilters.tagId);

  const activeFilters = useMemo<FilterState>(
    () => ({
      petTypeIds: selectedPetTypeIds,
      brandIds: selectedBrandIds,
      tagId: selectedTagId,
      minPrice: urlFilters.minPrice,
      maxPrice: urlFilters.maxPrice,
    }),
    [selectedBrandIds, selectedPetTypeIds, selectedTagId, urlFilters.maxPrice, urlFilters.minPrice],
  );

  const pushFilters = useCallback(
    (filters: FilterState) => {
      const params = buildFilterSearchParams(searchParams, filters);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const togglePetType = useCallback(
    (id: string, checked: boolean) => {
      const nextPetTypeIds = new Set(selectedPetTypeIds);

      if (checked) {
        nextPetTypeIds.add(id);
      } else {
        nextPetTypeIds.delete(id);
      }

      setSelectedPetTypeIds(nextPetTypeIds);
      pushFilters({
        ...activeFilters,
        petTypeIds: nextPetTypeIds,
      });
    },
    [activeFilters, pushFilters, selectedPetTypeIds],
  );

  const toggleBrand = useCallback(
    (id: string, checked: boolean) => {
      const nextBrandIds = new Set(selectedBrandIds);

      if (checked) {
        nextBrandIds.add(id);
      } else {
        nextBrandIds.delete(id);
      }

      setSelectedBrandIds(nextBrandIds);
      pushFilters({
        ...activeFilters,
        brandIds: nextBrandIds,
      });
    },
    [activeFilters, pushFilters, selectedBrandIds],
  );

  const toggleTag = useCallback(
    (id: string, checked: boolean) => {
      const nextTagId = checked ? id : null;

      setSelectedTagId(nextTagId);
      pushFilters({
        ...activeFilters,
        tagId: nextTagId,
      });
    },
    [activeFilters, pushFilters],
  );

  const selectedTagIds = useMemo(
    () => new Set(selectedTagId ? [selectedTagId] : []),
    [selectedTagId],
  );

  const toggleSection = useCallback((sectionId: FilterSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  }, []);

  return (
    <aside
      className={cn('overflow-hidden rounded-sop-20 bg-white pb-6 shadow-xs', className)}
      data-testid="search-filter-sidebar"
    >
      <div className="flex h-16 items-center gap-2 rounded-t-sop-20 bg-sop-additionalblue-400 px-5 py-3">
        <FilterFunnelIcon size={{ mobile: 20, desktop: 20 }} color="#ffffff" />
        <p className="sop-body-lg-medium text-white">ค้นหาแบบละเอียด</p>
      </div>

      <div className="flex flex-col gap-1">
        {FILTER_SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const sectionPrefetchHandlers =
            section.id === 'pet-type' || section.id === 'brand'
              ? createSearchFilterSectionPrefetchHandlers(section.id)
              : null;

          return (
            <div key={section.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                aria-expanded={isExpanded}
                onClick={() => toggleSection(section.id)}
                {...sectionPrefetchHandlers}
              >
                <span className="sop-body-md-regular text-sop-neutral-gray-300">
                  {section.label}
                </span>
                <UpArrowIcon
                  size={{ mobile: 12, desktop: 12 }}
                  color="#454547"
                  className={cn('shrink-0 transition-transform', !isExpanded && 'rotate-180')}
                />
              </button>

              {isExpanded && section.id === 'pet-type' && (
                <FilterCheckboxGrid
                  options={petTypeOptions}
                  selectedIds={selectedPetTypeIds}
                  onToggle={togglePetType}
                />
              )}

              {isExpanded && section.id === 'brand' && (
                <FilterCheckboxGrid
                  options={brandOptions}
                  selectedIds={selectedBrandIds}
                  onToggle={toggleBrand}
                />
              )}

              {isExpanded && section.id === 'tag' && (
                <div className="flex flex-col gap-2">
                  {tagsError ? (
                    <p className="px-4 sop-body-sm-regular text-sop-semantic-error-500">
                      โหลดแท็กไม่สำเร็จ
                    </p>
                  ) : tagsLoading ? null : tagOptions.length === 0 ? (
                    <p className="px-4 sop-body-sm-regular text-sop-neutral-gray-200">ไม่มีแท็ก</p>
                  ) : (
                    <FilterCheckboxGrid
                      options={tagOptions}
                      selectedIds={selectedTagIds}
                      onToggle={toggleTag}
                    />
                  )}
                </div>
              )}

              {isExpanded && section.id === 'price' && (
                <SearchFilterPriceSection
                  key={`${urlFilters.minPrice}-${urlFilters.maxPrice}`}
                  initialMinPrice={urlFilters.minPrice}
                  initialMaxPrice={urlFilters.maxPrice}
                  urlFilters={activeFilters}
                  pushFilters={pushFilters}
                />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
