import { afterEach, describe, expect, it } from 'vitest';
import {
  getOrdersListReturnUrl,
  saveOrdersListReturnUrl,
} from './orderListReturnUrl';

describe('orderListReturnUrl', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores and returns the orders list URL with filters', () => {
    saveOrdersListReturnUrl('/user/orders?filter=PENDING_PAYMENT&page=2');
    expect(getOrdersListReturnUrl()).toBe('/user/orders?filter=PENDING_PAYMENT&page=2');
  });

  it('falls back to /user/orders when nothing is stored', () => {
    expect(getOrdersListReturnUrl()).toBe('/user/orders');
  });

  it('ignores invalid stored URLs', () => {
    saveOrdersListReturnUrl('/user/profile');
    expect(getOrdersListReturnUrl()).toBe('/user/orders');
  });
});
