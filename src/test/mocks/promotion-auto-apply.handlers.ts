import { graphql, HttpResponse } from 'msw';
import {
  AUTO_APPLY_STORE_A_ID,
  AUTO_APPLY_STORE_B_ID,
  autoApplyPlatformPromotion,
  autoApplyStoreAPromotion,
  autoApplyStoreBPromotion,
  manualOnlyPlatformPromotion,
  validateAutoApplyPlatform,
  validateAutoApplyStoreA,
  validateAutoApplyStoreB,
  validateSoftFail,
} from '@/test/mocks/fixtures/promotion-auto-apply';

const validateByCode: Record<string, typeof validateAutoApplyPlatform> = {
  AUTO_PLAT: validateAutoApplyPlatform,
  AUTO_STORE_A: validateAutoApplyStoreA,
  AUTO_STORE_B: validateAutoApplyStoreB,
  SOFT_FAIL: validateSoftFail,
};

/** Happy-path dual-lane lists + validate scores for Journey 1. */
export const promotionAutoApplyHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: {
        activePlatformPromotions: [autoApplyPlatformPromotion, manualOnlyPlatformPromotion],
      },
    });
  }),

  graphql.query('ActiveStorePromotions', ({ variables }) => {
    const storeId = (variables as { storeId?: string } | undefined)?.storeId ?? '';
    if (storeId === AUTO_APPLY_STORE_A_ID) {
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreAPromotion] },
      });
    }
    if (storeId === AUTO_APPLY_STORE_B_ID) {
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreBPromotion] },
      });
    }
    return HttpResponse.json({ data: { activeStorePromotions: [] } });
  }),

  graphql.query('ValidatePromotion', async ({ request, variables }) => {
    let code = extractValidateCode(variables);
    if (!code) {
      try {
        const body: unknown = await request.clone().json();
        const variables =
          body && typeof body === 'object' && 'variables' in body
            ? (body as { variables?: unknown }).variables
            : undefined;
        code = extractValidateCode(variables);
      } catch {
        code = '';
      }
    }

    const serialized = JSON.stringify({ variables, code });
    const result =
      validateByCode[code] ??
      Object.entries(validateByCode).find(([key]) => serialized.includes(key))?.[1];

    if (!result) {
      // Last resort: return platform stub so apply path is exercisable when code parse fails.
      return HttpResponse.json({
        data: { validatePromotion: validateAutoApplyPlatform },
      });
    }
    return HttpResponse.json({ data: { validatePromotion: result } });
  }),
];

function extractValidateCode(variables: unknown): string {
  if (!variables || typeof variables !== 'object') {
    return '';
  }
  const record = variables as Record<string, unknown>;
  const input = record.input;
  if (input && typeof input === 'object' && input !== null && 'code' in input) {
    return String((input as { code: unknown }).code ?? '').trim();
  }
  if (typeof record.code === 'string') {
    return record.code.trim();
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object' && 'code' in value) {
      return String((value as { code: unknown }).code ?? '').trim();
    }
  }
  return '';
}

/** Zero autoApply===true candidates — gate must still set (Journey 2). */
export const promotionAutoApplyZeroCandidatesHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [manualOnlyPlatformPromotion] },
    });
  }),

  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: {
        activeStorePromotions: [{ ...autoApplyStoreAPromotion, autoApply: false }],
      },
    });
  }),

  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({ data: { validatePromotion: validateAutoApplyPlatform } });
  }),
];

/** Soft-fail all validates — gate must still set (Journey 2). */
export const promotionAutoApplySoftFailHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: {
        activePlatformPromotions: [
          { ...autoApplyPlatformPromotion, code: 'SOFT_FAIL', id: 'soft-plat' },
        ],
      },
    });
  }),

  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: {
        activeStorePromotions: [
          { ...autoApplyStoreAPromotion, code: 'SOFT_FAIL', id: 'soft-store' },
        ],
      },
    });
  }),

  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({ data: { validatePromotion: validateSoftFail } });
  }),
];
