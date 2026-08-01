import { describe, expect, it } from 'vitest';
import { NOTIFICATION_TYPE_CONFIG } from '@/app/(main)/user/notifications/page';

describe('NOTIFICATION_TYPE_CONFIG hold types', () => {
  it('configures order_items_on_hold with warning badge', () => {
    expect(NOTIFICATION_TYPE_CONFIG.order_items_on_hold).toEqual(
      expect.objectContaining({
        label: 'พักการจัดส่ง',
        badgeClasses: expect.stringContaining('warning'),
      }),
    );
  });

  it('configures order_items_hold_resumed with success badge', () => {
    expect(NOTIFICATION_TYPE_CONFIG.order_items_hold_resumed).toEqual(
      expect.objectContaining({
        label: 'กลับมาดำเนินการ',
        badgeClasses: expect.stringContaining('success'),
      }),
    );
  });
});
