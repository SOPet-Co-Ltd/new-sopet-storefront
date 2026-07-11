'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { UpArrowIcon } from '@/components/atoms/icons/filled/UpArrowIcon';
import { FilterFunnelIcon } from '@/components/atoms/icons/filled/FilterFunnelIcon';
import { ApprovedBrandsDocument, ApprovedPetTypesDocument } from '@/lib/graphql/generated/graphql';
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

export function SearchFilterSidebar({ className }: SearchFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedSections, setExpandedSections] = useState<Set<FilterSectionId>>(
    () => new Set(FILTER_SECTIONS.map((section) => section.id)),
  );

  const petTypeExpanded = expandedSections.has('pet-type');
  const brandExpanded = expandedSections.has('brand');

  const { data: petTypesData } = useQuery(ApprovedPetTypesDocument, {
    skip: !petTypeExpanded,
  });
  const { data: brandsData } = useQuery(ApprovedBrandsDocument, {
    skip: !brandExpanded,
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

  const [selectedPetTypeIds, setSelectedPetTypeIds] = useState<Set<string>>(() =>
    parsePetTypeIds(searchParams.get('petType')),
  );
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(() =>
    parseBrandIdList(searchParams.get('brand')),
  );
  const [minPrice, setMinPrice] = useState(() => parseMinPrice(searchParams.get('minPrice')));
  const [maxPrice, setMaxPrice] = useState(() => parseMaxPrice(searchParams.get('maxPrice')));

  useEffect(() => {
    setSelectedPetTypeIds(parsePetTypeIds(searchParams.get('petType')));
    setSelectedBrandIds(parseBrandIdList(searchParams.get('brand')));
    setMinPrice(parseMinPrice(searchParams.get('minPrice')));
    setMaxPrice(parseMaxPrice(searchParams.get('maxPrice')));
  }, [searchParams]);

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
        petTypeIds: nextPetTypeIds,
        brandIds: selectedBrandIds,
        minPrice,
        maxPrice,
      });
    },
    [maxPrice, minPrice, pushFilters, selectedBrandIds, selectedPetTypeIds],
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
        petTypeIds: selectedPetTypeIds,
        brandIds: nextBrandIds,
        minPrice,
        maxPrice,
      });
    },
    [maxPrice, minPrice, pushFilters, selectedBrandIds, selectedPetTypeIds],
  );

  const handleClear = useCallback(() => {
    const clearedFilters: FilterState = {
      petTypeIds: new Set(),
      brandIds: new Set(),
      minPrice: SEARCH_FILTER_PRICE_MIN,
      maxPrice: SEARCH_FILTER_PRICE_MAX,
    };

    setSelectedPetTypeIds(clearedFilters.petTypeIds);
    setSelectedBrandIds(clearedFilters.brandIds);
    setMinPrice(clearedFilters.minPrice);
    setMaxPrice(clearedFilters.maxPrice);
    pushFilters(clearedFilters);
  }, [pushFilters]);

  const handleApplyPrice = useCallback(() => {
    pushFilters({
      petTypeIds: selectedPetTypeIds,
      brandIds: selectedBrandIds,
      minPrice,
      maxPrice,
    });
  }, [maxPrice, minPrice, pushFilters, selectedBrandIds, selectedPetTypeIds]);

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

              {isExpanded && section.id === 'price' && (
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
                      onClick={handleClear}
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
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
