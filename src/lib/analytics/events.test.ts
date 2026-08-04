import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  trackAddToCart,
  trackBeginCheckout,
  trackPageView,
  trackPurchase,
  trackViewItem,
} from './events';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  delete window.dataLayer;
  delete window.gtag;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  delete window.dataLayer;
  delete window.gtag;
});

describe('trackPageView', () => {
  it('no-ops without analytics IDs', () => {
    expect(trackPageView({ page_path: '/search' })).toBe(false);
    expect(window.dataLayer).toBeUndefined();
  });

  it('pushes page_view with path/title/location', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST01');
    document.title = 'ค้นหา | Sopet';

    expect(
      trackPageView({
        page_path: '/search?q=dog',
        page_title: 'ค้นหา | Sopet',
        page_location: 'http://localhost:3000/search?q=dog',
      }),
    ).toBe(true);

    expect(window.dataLayer).toContainEqual({
      event: 'page_view',
      page_path: '/search?q=dog',
      page_title: 'ค้นหา | Sopet',
      page_location: 'http://localhost:3000/search?q=dog',
    });
  });

  it('also calls gtag when GA4 measurement ID is set', () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST01');
    const gtag = vi.fn();
    window.gtag = gtag;
    window.dataLayer = [];

    trackPageView({ page_path: '/' });

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: '/',
        send_to: 'G-TEST01',
      }),
    );
  });
});

describe('ecommerce events', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST01');
  });

  it('trackViewItem clears ecommerce then pushes view_item', () => {
    trackViewItem({
      value: 199,
      items: [{ item_id: 'p1', item_name: 'Food', price: 199, quantity: 1 }],
    });

    expect(window.dataLayer?.[0]).toEqual({ ecommerce: null });
    expect(window.dataLayer?.[1]).toEqual({
      event: 'view_item',
      ecommerce: {
        currency: 'THB',
        value: 199,
        items: [{ item_id: 'p1', item_name: 'Food', price: 199, quantity: 1 }],
      },
    });
  });

  it('trackAddToCart / begin_checkout / purchase push typed events', () => {
    const item = { item_id: 'p1', item_name: 'Food', price: 100, quantity: 2 };

    trackAddToCart({ value: 200, items: [item] });
    trackBeginCheckout({ value: 200, items: [item], coupon: 'SAVE10' });
    trackPurchase({
      transaction_id: 'ORD-1',
      value: 250,
      shipping: 50,
      items: [item],
    });

    const events = (window.dataLayer ?? [])
      .filter((entry) => typeof entry.event === 'string')
      .map((entry) => entry.event);

    expect(events).toEqual(['add_to_cart', 'begin_checkout', 'purchase']);
  });
});
