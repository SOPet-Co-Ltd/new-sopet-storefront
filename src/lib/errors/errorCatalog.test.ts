import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from './errorCodes';
import { ERROR_CATALOG_DOCS } from './errorCatalogDocs';
import { ERROR_CATALOG, ERROR_MESSAGES } from './errorMessages';
import {
  filterErrorCatalog,
  groupErrorCatalog,
  matchesErrorCatalogEntry,
} from './filterErrorCatalog';

describe('ERROR_CATALOG', () => {
  it('includes every ERROR_MESSAGES code with matching message and group', () => {
    const codes = Object.keys(ERROR_MESSAGES);
    expect(ERROR_CATALOG).toHaveLength(codes.length);

    for (const entry of ERROR_CATALOG) {
      expect(ERROR_MESSAGES[entry.code]).toBe(entry.message);
      expect(entry.group.length).toBeGreaterThan(0);
      expect(typeof entry.message).toBe('string');
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });

  it('attaches optional docs only when present and never empty strings', () => {
    const withDocs = ERROR_CATALOG.filter(
      (entry) => entry.why || entry.possibleIssue || entry.howToFix,
    );
    expect(withDocs.length).toBeGreaterThan(20);

    for (const entry of withDocs) {
      const docs = ERROR_CATALOG_DOCS[entry.code];
      expect(docs).toBeDefined();
      if (entry.why) {
        expect(entry.why).toBe(docs?.why);
        expect(entry.why.trim().length).toBeGreaterThan(0);
      }
      if (entry.possibleIssue) {
        expect(entry.possibleIssue).toBe(docs?.possibleIssue);
      }
      if (entry.howToFix) {
        expect(entry.howToFix).toBe(docs?.howToFix);
      }
    }
  });

  it('documents high-traffic auth, cart, payment, and promotion codes', () => {
    const required = [
      ERROR_CODES.INVALID_OTP,
      ERROR_CODES.UNAUTHENTICATED,
      ERROR_CODES.INSUFFICIENT_STOCK,
      ERROR_CODES.STORE_SUSPENDED,
      ERROR_CODES.ORDER_NOT_PAYABLE,
      ERROR_CODES.OMISE_ERROR,
      ERROR_CODES.GUEST,
      ERROR_CODES.PROMOTION_EXPIRED,
      ERROR_CODES.NETWORK_ERROR,
    ];

    for (const code of required) {
      const entry = ERROR_CATALOG.find((item) => item.code === code);
      expect(entry?.why).toBeTruthy();
      expect(entry?.possibleIssue).toBeTruthy();
      expect(entry?.howToFix).toBeTruthy();
    }
  });
});

describe('filterErrorCatalog', () => {
  it('returns all entries for empty / whitespace query', () => {
    expect(filterErrorCatalog(ERROR_CATALOG, '')).toHaveLength(ERROR_CATALOG.length);
    expect(filterErrorCatalog(ERROR_CATALOG, '   ')).toHaveLength(ERROR_CATALOG.length);
  });

  it('matches by code (case-insensitive)', () => {
    const results = filterErrorCatalog(ERROR_CATALOG, 'invalid_otp');
    expect(results.some((entry) => entry.code === 'INVALID_OTP')).toBe(true);
  });

  it('matches by Thai message text', () => {
    const results = filterErrorCatalog(ERROR_CATALOG, 'รหัส OTP');
    expect(results.some((entry) => entry.code === 'INVALID_OTP')).toBe(true);
  });

  it('matches by optional docs fields', () => {
    const results = filterErrorCatalog(ERROR_CATALOG, 'Omise');
    expect(results.some((entry) => entry.code === 'OMISE_ERROR')).toBe(true);
  });

  it('matches by group label', () => {
    const results = filterErrorCatalog(ERROR_CATALOG, 'Promotions');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.group === 'Promotions')).toBe(true);
  });

  it('returns empty when nothing matches', () => {
    expect(filterErrorCatalog(ERROR_CATALOG, 'zzz-not-a-real-error-qqq')).toEqual([]);
  });
});

describe('matchesErrorCatalogEntry / groupErrorCatalog', () => {
  it('matchesErrorCatalogEntry is true for blank query', () => {
    expect(matchesErrorCatalogEntry(ERROR_CATALOG[0]!, '')).toBe(true);
  });

  it('groupErrorCatalog keeps consecutive group order', () => {
    const grouped = groupErrorCatalog(ERROR_CATALOG);
    expect(grouped[0]?.group).toBe('Auth');
    expect(grouped.every((section) => section.items.length > 0)).toBe(true);

    for (const section of grouped) {
      expect(section.items.every((item) => item.group === section.group)).toBe(true);
    }
  });
});
