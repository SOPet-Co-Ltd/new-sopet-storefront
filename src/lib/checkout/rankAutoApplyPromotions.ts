import type { PromotionValidation } from '@/lib/hooks/useCheckout';

export type AutoApplyCandidate = {
  id: string;
  code: string;
  priority: number;
  autoApply: boolean;
  name?: string | null;
  type?: string | null;
};

export type ScoredAutoApplyCandidate = AutoApplyCandidate & {
  discountAmount: number;
  validation: PromotionValidation;
};

/**
 * Pure AA2/C2 ranking: filter autoApply===true, then sort by
 * discountAmount DESC → priority DESC → code ASC → id ASC.
 * Score is validatePromotion.discountAmount only (client estimate helpers are out of scope).
 */
export function rankAutoApplyPromotions(
  scored: ScoredAutoApplyCandidate[],
): ScoredAutoApplyCandidate[] {
  return scored
    .filter((candidate) => candidate.autoApply === true)
    .slice()
    .sort((a, b) => {
      if (b.discountAmount !== a.discountAmount) {
        return b.discountAmount - a.discountAmount;
      }
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      const codeCmp = a.code.localeCompare(b.code);
      if (codeCmp !== 0) {
        return codeCmp;
      }
      return a.id.localeCompare(b.id);
    });
}
