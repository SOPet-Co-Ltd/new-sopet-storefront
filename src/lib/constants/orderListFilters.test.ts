import { describe, expect, it } from 'vitest';
import {
  getOrderListEmptyMessage,
  ORDER_LIST_FILTERS,
  parseOrderListFilter,
  parseOrdersPage,
} from './orderListFilters';

describe('orderListFilters', () => {
  it('defines five filter tabs in order', () => {
    expect(ORDER_LIST_FILTERS.map((filter) => filter.id)).toEqual([
      'ALL',
      'PENDING_PAYMENT',
      'IN_PROGRESS',
      'DELIVERED',
      'CANCELLED',
    ]);
  });

  it('parses known filter values', () => {
    expect(parseOrderListFilter('DELIVERED')).toBe('DELIVERED');
  });

  it('falls back to ALL for unknown filter values', () => {
    expect(parseOrderListFilter('unknown')).toBe('ALL');
    expect(parseOrderListFilter(null)).toBe('ALL');
  });

  it('parses page numbers safely', () => {
    expect(parseOrdersPage('2')).toBe(2);
    expect(parseOrdersPage('0')).toBe(1);
    expect(parseOrdersPage('abc')).toBe(1);
  });

  it('returns filter-aware empty messages', () => {
    expect(getOrderListEmptyMessage('ALL')).toBe('ยังไม่มีคำสั่งซื้อ');
    expect(getOrderListEmptyMessage('DELIVERED')).toBe('ไม่มีคำสั่งซื้อในหมวดนี้');
  });
});
