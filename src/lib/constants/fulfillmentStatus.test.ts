import { describe, expect, it } from 'vitest';
import { labelFulfillmentStatus } from './fulfillmentStatus';

/** Admin mirror: sopet-admin/src/lib/i18n/th.ts fulfillmentStatusLabels */
const ADMIN_MIRROR_LABELS: [status: string, label: string][] = [
  ['pending', 'รอดำเนินการ'],
  ['processing', 'กำลังเตรียม'],
  ['shipped', 'จัดส่งแล้ว'],
  ['delivered', 'ส่งถึงแล้ว'],
  ['cancelled', 'ยกเลิก'],
];

describe('labelFulfillmentStatus', () => {
  // AC-018: Fulfillment status labels mirror admin fulfillmentStatusLabels map.
  // Behavior: Known enum values → hardcoded Thai labels matching admin i18n.
  // @category: unit
  // @lane: unit
  it.each(ADMIN_MIRROR_LABELS)('maps %s to admin-mirror Thai label %s', (status, expectedLabel) => {
    expect(labelFulfillmentStatus(status)).toBe(expectedLabel);
  });

  // AC-018: Unknown fulfillment status falls back to raw enum string.
  // Behavior: Unmapped status value → returns input unchanged.
  // @category: unit
  // @lane: unit
  it('falls back to raw enum string for unknown status', () => {
    expect(labelFulfillmentStatus('custom_status')).toBe('custom_status');
  });
});
