import { describe, expect, it } from 'vitest';
import {
  formatFlashSaleCountdown,
  formatFlashSaleCountdownLabel,
  formatFlashSaleTitle,
} from './ProductFlashSaleStrip';

describe('formatFlashSaleCountdown', () => {
  it('formats under 24 hours as HH:MM:SS', () => {
    expect(formatFlashSaleCountdown(3_721_000)).toBe('01:02:01');
  });

  it('formats 24 hours and more with Thai day label', () => {
    // 23 days + 10h + 35m + 24s
    const ms = ((23 * 24 + 10) * 3600 + 35 * 60 + 24) * 1000;
    expect(formatFlashSaleCountdown(ms)).toBe('23 วัน 10:35:24');
  });

  it('does not dump total hours past 24', () => {
    const ms = 562 * 3600 * 1000;
    expect(formatFlashSaleCountdown(ms)).toBe('23 วัน 10:00:00');
    expect(formatFlashSaleCountdown(ms)).not.toMatch(/^562:/);
  });

  it('clamps negative remaining to zero', () => {
    expect(formatFlashSaleCountdown(-1000)).toBe('00:00:00');
  });
});

describe('formatFlashSaleCountdownLabel', () => {
  it('uses live remaining when available', () => {
    expect(formatFlashSaleCountdownLabel(3_661_000, '2026-08-31T00:00:00.000Z')).toBe('01:01:01');
  });

  it('shows open-ended label when campaign has no expiresAt', () => {
    expect(formatFlashSaleCountdownLabel(null, null)).toBe('ตลอดแคมเปญ');
    expect(formatFlashSaleCountdownLabel(null, undefined)).toBe('ตลอดแคมเปญ');
  });

  it('shows zero countdown when expiry exists but remaining is null', () => {
    expect(formatFlashSaleCountdownLabel(null, '2026-08-31T00:00:00.000Z')).toBe('00:00:00');
  });
});

describe('formatFlashSaleTitle', () => {
  it('uses the campaign name when provided', () => {
    expect(formatFlashSaleTitle(10, 'ลดราคาหน้าฝน')).toBe('ลดราคาหน้าฝน · ถูกกว่าเดิม 10%');
  });

  it('falls back to Flash Sale when campaign name is missing', () => {
    expect(formatFlashSaleTitle(10, null)).toBe('Flash Sale · ถูกกว่าเดิม 10%');
    expect(formatFlashSaleTitle(10, '   ')).toBe('Flash Sale · ถูกกว่าเดิม 10%');
  });
});
