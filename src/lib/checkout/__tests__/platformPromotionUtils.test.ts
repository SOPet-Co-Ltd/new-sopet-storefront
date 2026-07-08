import { describe, expect, it } from 'vitest';
import {
  formatAvailablePromotionSuggestion,
  getPlatformPromotionSectionStage,
} from '@/lib/checkout/platformPromotionUtils';

describe('platformPromotionUtils', () => {
  describe('getPlatformPromotionSectionStage', () => {
    it('returns active when a promotion is applied', () => {
      expect(getPlatformPromotionSectionStage(true, 2)).toBe('active');
      expect(getPlatformPromotionSectionStage(true, 0)).toBe('active');
    });

    it('returns suggest when promotions are available but none applied', () => {
      expect(getPlatformPromotionSectionStage(false, 2)).toBe('suggest');
      expect(getPlatformPromotionSectionStage(false, 1)).toBe('suggest');
    });

    it('returns empty when no promotions are available', () => {
      expect(getPlatformPromotionSectionStage(false, 0)).toBe('empty');
    });
  });

  describe('formatAvailablePromotionSuggestion', () => {
    it('formats the available promotion count in Thai', () => {
      expect(formatAvailablePromotionSuggestion(2)).toBe('พบ 2 ส่วนลดที่ใช้ได้');
    });
  });
});
