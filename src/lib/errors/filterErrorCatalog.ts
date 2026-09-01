import type { ErrorCatalogEntry } from './errorMessages';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function entrySearchText(entry: ErrorCatalogEntry): string {
  return [entry.code, entry.message, entry.group, entry.why, entry.possibleIssue, entry.howToFix]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join('\n')
    .toLowerCase();
}

/** True when the entry matches the search query (code, message, group, or docs). */
export function matchesErrorCatalogEntry(entry: ErrorCatalogEntry, query: string): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) return true;
  return entrySearchText(entry).includes(normalized);
}

/** Client-side filter for the public error catalog page. */
export function filterErrorCatalog(
  entries: ErrorCatalogEntry[],
  query: string,
): ErrorCatalogEntry[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return entries;
  return entries.filter((entry) => matchesErrorCatalogEntry(entry, normalized));
}

/** Group consecutive catalog entries that share the same `group` label. */
export function groupErrorCatalog(
  entries: ErrorCatalogEntry[],
): Array<{ group: string; items: ErrorCatalogEntry[] }> {
  const groups: Array<{ group: string; items: ErrorCatalogEntry[] }> = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.group === entry.group) {
      last.items.push(entry);
    } else {
      groups.push({ group: entry.group, items: [entry] });
    }
  }

  return groups;
}
