import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_NAV_ITEMS,
  getNavItems,
  isAccountNavActive,
  type NavVisibilityFlag,
} from './accountNavConfig';

const EXPECTED_HREFS = [
  '/user/profile',
  '/user/orders',
  '/user/addresses',
  '/user/favorites',
  '/user/reviews',
  '/user/notifications',
  '/user/credit',
  '/user/returns',
  '/user/delete',
];

describe('accountNavConfig', () => {
  describe('ACCOUNT_NAV_ITEMS', () => {
    it('contains exactly 9 destinations in contract order', () => {
      expect(ACCOUNT_NAV_ITEMS).toHaveLength(9);
      expect(ACCOUNT_NAV_ITEMS.map((item) => item.href)).toEqual(EXPECTED_HREFS);
    });

    it('does not include wishlist', () => {
      const hrefs = ACCOUNT_NAV_ITEMS.map((item) => item.href);
      expect(hrefs).not.toContain('/user/wishlist');
    });

    it('does not include removed dashboard or settings routes', () => {
      const hrefs = ACCOUNT_NAV_ITEMS.map((item) => item.href);
      expect(hrefs).not.toContain('/user');
      expect(hrefs).not.toContain('/user/settings');
    });
  });

  describe('getNavItems', () => {
    it('returns 9 sidebar items in stable order', () => {
      const items = getNavItems('showInSidebar');
      expect(items).toHaveLength(9);
      expect(items.map((item) => item.href)).toEqual(EXPECTED_HREFS);
    });

    it('returns 9 mobile nav items in stable order', () => {
      const items = getNavItems('showInMobileNav');
      expect(items).toHaveLength(9);
      expect(items.map((item) => item.href)).toEqual(EXPECTED_HREFS);
    });

    it('returns 7 navbar menu items in stable order', () => {
      const items = getNavItems('showInNavbarMenu');
      expect(items).toHaveLength(7);
      expect(items.map((item) => item.href)).toEqual([
        '/user/profile',
        '/user/orders',
        '/user/addresses',
        '/user/favorites',
        '/user/notifications',
        '/user/credit',
        '/user/delete',
      ]);
    });

    it('returns 5 settings items in stable order', () => {
      const items = getNavItems('showInSettings');
      expect(items).toHaveLength(5);
      expect(items.map((item) => item.href)).toEqual([
        '/user/profile',
        '/user/addresses',
        '/user/notifications',
        '/user/credit',
        '/user/delete',
      ]);
    });

    it('returns empty array for unmatched flag', () => {
      expect(getNavItems('invalid' as NavVisibilityFlag)).toEqual([]);
    });

    it('never includes wishlist in any filter output', () => {
      const flags: NavVisibilityFlag[] = [
        'showInSidebar',
        'showInMobileNav',
        'showInNavbarMenu',
        'showInSettings',
      ];

      for (const flag of flags) {
        const hrefs = getNavItems(flag).map((item) => item.href);
        expect(hrefs).not.toContain('/user/wishlist');
      }
    });
  });

  describe('isAccountNavActive', () => {
    it('matches exact pathname', () => {
      expect(isAccountNavActive('/user/orders', '/user/orders')).toBe(true);
    });

    it('matches sub-routes for non-root href', () => {
      expect(isAccountNavActive('/user/orders/abc-123', '/user/orders')).toBe(true);
    });

    it('keeps reviews active for tab deep links with query string', () => {
      expect(isAccountNavActive('/user/reviews?tab=written', '/user/reviews')).toBe(true);
    });

    it('keeps reviews active for pending tab path', () => {
      expect(isAccountNavActive('/user/reviews', '/user/reviews')).toBe(true);
    });

    it('does not activate unrelated segments', () => {
      expect(isAccountNavActive('/user/favorites', '/user/reviews')).toBe(false);
    });
  });
});
