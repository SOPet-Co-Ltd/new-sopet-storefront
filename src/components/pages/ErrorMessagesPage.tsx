'use client';

import { useId, useMemo, useState } from 'react';
import { SearchIcon, XIcon } from '@/components/atoms/icons';
import { ERROR_CATALOG, type ErrorCatalogEntry } from '@/lib/errors/errorMessages';
import { filterErrorCatalog, groupErrorCatalog } from '@/lib/errors/filterErrorCatalog';
import { cn } from '@/lib/utils';

const FIELD_LABELS = {
  why: 'สาเหตุ',
  possibleIssue: 'ปัญหาที่เป็นไปได้',
  howToFix: 'วิธีแก้ไข',
} as const;

const ALL_GROUPS_ID = 'all';

type CatalogGroupSummary = {
  group: string;
  count: number;
};

function getDocFields(entry: ErrorCatalogEntry) {
  return (
    [
      ['why', entry.why],
      ['possibleIssue', entry.possibleIssue],
      ['howToFix', entry.howToFix],
    ] as const
  ).filter(([, value]) => Boolean(value));
}

function ErrorCatalogEntryRow({ entry }: { entry: ErrorCatalogEntry }) {
  const fields = getDocFields(entry);
  const hasDocs = fields.length > 0;

  const header = (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <code
        className={cn(
          'shrink-0 font-mono text-[11px] leading-snug tracking-wide text-sop-primary-600',
          'sm:w-[min(18rem,42%)] sm:text-xs',
        )}
      >
        {entry.code}
      </code>
      <p className="min-w-0 sop-body-sm-medium text-sop-neutral-gray-100 sm:sop-body-md-medium">
        {entry.message}
      </p>
    </div>
  );

  if (!hasDocs) {
    return (
      <li
        className="border-b border-sop-neutral-grayalpha-200 py-3.5 last:border-b-0"
        data-testid={`error-catalog-entry-${entry.code}`}
      >
        {header}
      </li>
    );
  }

  return (
    <li
      className="border-b border-sop-neutral-grayalpha-200 last:border-b-0"
      data-testid={`error-catalog-entry-${entry.code}`}
    >
      <details className="group/entry">
        <summary
          className={cn(
            'flex cursor-pointer list-none items-start gap-3 py-3.5',
            'outline-none focus-visible:ring-2 focus-visible:ring-sop-primary-400 focus-visible:ring-offset-2',
            '[&::-webkit-details-marker]:hidden',
          )}
          aria-label={`ดูรายละเอียด ${entry.code}`}
        >
          {header}
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sop-4',
              'text-sop-neutral-gray-400 transition-transform duration-150',
              'group-open/entry:rotate-180',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.25 4.5L6 8.25L9.75 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>

        <dl className="mb-4 ml-0 space-y-3 border-l-2 border-sop-primary-300 pl-4 sm:ml-[min(18rem,42%)] sm:pl-4">
          {fields.map(([key, value]) => (
            <div key={key} className="space-y-0.5">
              <dt className="sop-body-xs-medium text-sop-neutral-gray-400">{FIELD_LABELS[key]}</dt>
              <dd className="sop-body-sm-regular text-sop-neutral-gray-300">{value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </li>
  );
}

function GroupFilterChips({
  groups,
  selectedGroup,
  onSelect,
  searchedCounts,
}: {
  groups: CatalogGroupSummary[];
  selectedGroup: string;
  onSelect: (group: string) => void;
  searchedCounts: Map<string, number>;
}) {
  return (
    <div
      className={cn(
        '-mx-1 overflow-x-auto overscroll-x-contain touch-pan-x',
        // Keep swipe/scroll; hide the visible scrollbar (Firefox, IE/Edge, WebKit)
        '[-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
      )}
      role="tablist"
      aria-label="กรองตามกลุ่ม"
      data-testid="error-catalog-group-filters"
    >
      <div className="flex w-max gap-2 px-1">
        <button
          type="button"
          role="tab"
          aria-selected={selectedGroup === ALL_GROUPS_ID}
          data-testid="error-catalog-group-all"
          onClick={() => onSelect(ALL_GROUPS_ID)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-sop-8 px-3 py-1.5',
            'sop-body-xs-medium transition-colors',
            selectedGroup === ALL_GROUPS_ID
              ? 'bg-sop-primary-200 text-sop-primary-600'
              : 'bg-sop-neutral-gray-500 text-sop-neutral-gray-300 hover:bg-sop-neutral-grayalpha-100',
          )}
        >
          ทั้งหมด
          <span
            className={cn(
              'sop-body-2xs-regular tabular-nums',
              selectedGroup === ALL_GROUPS_ID
                ? 'text-sop-primary-500'
                : 'text-sop-neutral-gray-400',
            )}
          >
            {searchedCounts.get(ALL_GROUPS_ID) ?? 0}
          </span>
        </button>

        {groups.map(({ group }) => {
          const count = searchedCounts.get(group) ?? 0;
          const isSelected = selectedGroup === group;
          const isDisabled = count === 0;

          return (
            <button
              key={group}
              type="button"
              role="tab"
              aria-selected={isSelected}
              disabled={isDisabled}
              data-testid={`error-catalog-group-${group}`}
              onClick={() => onSelect(group)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-sop-8 px-3 py-1.5',
                'sop-body-xs-medium transition-colors',
                isSelected
                  ? 'bg-sop-primary-200 text-sop-primary-600'
                  : 'bg-sop-neutral-gray-500 text-sop-neutral-gray-300 hover:bg-sop-neutral-grayalpha-100',
                isDisabled && 'cursor-not-allowed opacity-40 hover:bg-sop-neutral-gray-500',
              )}
            >
              {group}
              <span
                className={cn(
                  'sop-body-2xs-regular tabular-nums',
                  isSelected ? 'text-sop-primary-500' : 'text-sop-neutral-gray-400',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Matches Header spacer so sticky toolbar sits below the fixed site header. */
const STICKY_TOP_CLASS =
  'top-[calc(6.3125rem+env(safe-area-inset-top,0px))] md:top-[calc(6.8125rem+env(safe-area-inset-top,0px))]';

const CONTENT_COLUMN_CLASS = 'mx-auto w-full max-w-4xl px-4 sm:px-6';

export function ErrorMessagesPage() {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUPS_ID);

  const catalogGroups = useMemo(
    () =>
      groupErrorCatalog(ERROR_CATALOG).map(({ group, items }) => ({
        group,
        count: items.length,
      })),
    [],
  );

  const searched = useMemo(() => filterErrorCatalog(ERROR_CATALOG, query), [query]);

  const searchedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set(ALL_GROUPS_ID, searched.length);
    for (const entry of searched) {
      counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);
    }
    return counts;
  }, [searched]);

  const filtered = useMemo(() => {
    if (selectedGroup === ALL_GROUPS_ID) return searched;
    return searched.filter((entry) => entry.group === selectedGroup);
  }, [searched, selectedGroup]);

  const grouped = useMemo(() => groupErrorCatalog(filtered), [filtered]);
  const trimmedQuery = query.trim();
  const resultCount = filtered.length;
  const totalCount = ERROR_CATALOG.length;
  const hasActiveFilters = Boolean(trimmedQuery) || selectedGroup !== ALL_GROUPS_ID;

  const clearFilters = () => {
    setQuery('');
    setSelectedGroup(ALL_GROUPS_ID);
  };

  return (
    <main className="w-full py-8 sm:py-12" data-testid="error-messages-page">
      <div className={CONTENT_COLUMN_CLASS}>
        <header className="max-w-2xl space-y-2">
          <h1 className="sop-headline-sm-medium text-sop-neutral-gray-100">รหัสข้อผิดพลาด</h1>
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">
            ค้นหารหัสข้อผิดพลาด ความหมายภาษาไทย และคำอธิบายเพิ่มเติม กดแถวที่มีลูกศรเพื่อดูสาเหตุ
            ปัญหา และวิธีแก้ไข
          </p>
        </header>
      </div>

      {/*
        Full-viewport sticky shell (matches body bg-sop-primary-100) with edge-to-edge border,
        like admin error-messages-catalog-page. Controls stay in the content column.
      */}
      <div
        className={cn(
          'sticky z-10 mt-6 min-w-0 border-b border-sop-neutral-grayalpha-200',
          'bg-sop-primary-100/95 backdrop-blur supports-backdrop-filter:bg-sop-primary-100/90',
          STICKY_TOP_CLASS,
        )}
        data-testid="error-catalog-sticky-toolbar"
      >
        <div className={cn(CONTENT_COLUMN_CLASS, 'space-y-3 py-3')}>
          <label htmlFor={searchId} className="sr-only">
            ค้นหารหัสข้อผิดพลาด
          </label>
          <div
            className={cn(
              'sop-body-sm-regular flex h-11 w-full items-center gap-2 rounded-sop-8',
              'border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-500 px-3 sm:px-4',
              'text-sop-neutral-gray-300',
              'focus-within:border-sop-primary-300 focus-within:ring-2 focus-within:ring-sop-primary-400 focus-within:ring-offset-1',
            )}
          >
            <SearchIcon
              size={{ mobile: 18, desktop: 18 }}
              color="currentColor"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหารหัส, ข้อความไทย, หรือคำอธิบาย…"
              autoComplete="off"
              enterKeyHint="search"
              aria-controls="error-catalog-results"
              className={cn(
                'sop-body-sm-regular min-w-0 flex-1 appearance-none border-0 bg-transparent outline-none',
                'text-sop-neutral-gray-100 placeholder:text-sop-neutral-gray-400',
                // Hide native search clear so we use our own control
                '[&::-webkit-search-cancel-button]:hidden',
              )}
            />
            {trimmedQuery ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sop-4 text-sop-neutral-gray-400 hover:bg-sop-neutral-grayalpha-100 hover:text-sop-neutral-gray-200"
                aria-label="ล้างการค้นหา"
                data-testid="error-catalog-clear-search"
              >
                <XIcon size={{ mobile: 14 }} color="currentColor" />
              </button>
            ) : null}
          </div>

          <GroupFilterChips
            groups={catalogGroups}
            selectedGroup={selectedGroup}
            onSelect={setSelectedGroup}
            searchedCounts={searchedCounts}
          />

          <p
            className={cn(
              'sop-body-xs-regular tabular-nums',
              hasActiveFilters ? 'text-sop-primary-600' : 'text-sop-neutral-gray-300',
            )}
            aria-live="polite"
          >
            {hasActiveFilters
              ? `พบ ${resultCount} จาก ${totalCount} รายการ`
              : `${totalCount} รหัสข้อผิดพลาด`}
          </p>
        </div>
      </div>

      <div id="error-catalog-results" className={cn(CONTENT_COLUMN_CLASS, 'mt-6')}>
        {grouped.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-16 text-center"
            data-testid="error-catalog-empty"
          >
            <p className="sop-body-md-medium text-sop-neutral-gray-200">ไม่พบรหัสข้อผิดพลาด</p>
            <p className="max-w-sm sop-body-sm-regular text-sop-neutral-gray-400">
              {trimmedQuery
                ? `ไม่มีรายการที่ตรงกับ “${trimmedQuery}”`
                : 'ไม่มีรายการในกลุ่มที่เลือก'}
              {selectedGroup !== ALL_GROUPS_ID && trimmedQuery ? ` ในกลุ่ม ${selectedGroup}` : ''}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'mt-1 rounded-sop-4 bg-sop-primary-600 px-4 py-2',
                'sop-body-sm-medium text-sop-base-white hover:bg-sop-primary-700',
              )}
              data-testid="error-catalog-clear-filters"
            >
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ group, items }) => (
              <section key={group} aria-labelledby={`error-group-${group}`}>
                <h2
                  id={`error-group-${group}`}
                  className="mb-1 flex items-baseline gap-2 border-b border-sop-neutral-gray-500 pb-2 sop-body-md-medium text-sop-neutral-gray-100"
                >
                  {group}
                  <span className="sop-body-xs-regular tabular-nums text-sop-neutral-gray-400">
                    {items.length}
                  </span>
                </h2>
                <ul className="divide-y-0">
                  {items.map((entry) => (
                    <ErrorCatalogEntryRow key={entry.code} entry={entry} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
