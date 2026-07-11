import { describe, expect, it } from 'vitest';
import { CustomerOrderListFilter } from '@/lib/graphql/generated/graphql';
import {
  getOrderListEmptyMessage,
  ORDER_LIST_FILTERS,
  parseOrderListFilter,
  parseOrdersPage,
} from './orderListFilters';

describe('orderListFilters', () => {
  it('defines five filter tabs in order', () => {
    expect(ORDER_LIST_FILTERS.map((filter) => filter.id)).toEqual([
      CustomerOrderListFilter.All,
      CustomerOrderListFilter.PendingPayment,
      CustomerOrderListFilter.InProgress,
      CustomerOrderListFilter.Delivered,
      CustomerOrderListFilter.Cancelled,
    ]);
  });

  it('parses known filter values', () => {
    expect(parseOrderListFilter('DELIVERED')).toBe(CustomerOrderListFilter.Delivered);
  });

  it('falls back to ALL for unknown filter values', () => {
    expect(parseOrderListFilter('unknown')).toBe(CustomerOrderListFilter.All);
    expect(parseOrderListFilter(null)).toBe(CustomerOrderListFilter.All);
  });

  it('parses page numbers safely', () => {
    expect(parseOrdersPage('2')).toBe(2);
    expect(parseOrdersPage('0')).toBe(1);
    expect(parseOrdersPage('abc')).toBe(1);
  });

  it('returns filter-aware empty messages', () => {
    expect(getOrderListEmptyMessage(CustomerOrderListFilter.All)).toBe('ยังไม่มีคำสั่งซื้อ');
    expect(getOrderListEmptyMessage(CustomerOrderListFilter.Delivered)).toBe(
      'ไม่มีคำสั่งซื้อในหมวดนี้',
    );
  });
});
