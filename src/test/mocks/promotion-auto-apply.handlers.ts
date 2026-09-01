import { graphql, HttpResponse } from 'msw';
import {
  AUTO_APPLY_STORE_A_ID,
  AUTO_APPLY_STORE_B_ID,
  AUTO_APPLY_STORE_C_ID,
  autoApplyPlatformPromotion,
  autoApplyStoreAPromotion,
  autoApplyStoreBPromotion,
  autoApplyStoreCPromotion,
  manualOnlyPlatformPromotion,
  manualOnlyStoreBPromotion,
  validateAutoApplyPlatform,
  validateAutoApplyStoreA,
  validateAutoApplyStoreB,
  validateAutoApplyStoreC,
  validateManualStoreB,
  validateSoftFail,
} from '@/test/mocks/fixtures/promotion-auto-apply';

const validateByCode: Record<string, typeof validateAutoApplyPlatform> = {
  AUTO_PLAT: validateAutoApplyPlatform,
  AUTO_STORE_A: validateAutoApplyStoreA,
  AUTO_STORE_B: validateAutoApplyStoreB,
  AUTO_STORE_C: validateAutoApplyStoreC,
  MANUAL_STORE_B: validateManualStoreB,
  SOFT_FAIL: validateSoftFail,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function validatePromotionsHandler() {
  return graphql.query('ValidatePromotions', ({ variables }) => {
    const input = (variables as { input?: { promotions?: Array<{ id?: string; code?: string }> } })
      ?.input;
    const promotions = input?.promotions ?? [];
    return HttpResponse.json({
      data: {
        validatePromotions: {
          items: promotions.map((row) => {
            const code = row.code ?? '';
            const validation = validateByCode[code];
            return {
              id: row.id ?? null,
              code,
              name: validation?.name ?? code,
              eligible: true,
              ineligibilityReason: null,
              discountAmount: validation?.discountAmount ?? 0,
              freeUnits: validation?.freeUnits ?? null,
            };
          }),
        },
      },
    });
  });
}

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
    if (storeId === AUTO_APPLY_STORE_C_ID) {
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreCPromotion] },
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
  validatePromotionsHandler(),
];

/** Three-store auto-apply with staggered ActiveStorePromotions latency (N-store race). */
export const promotionAutoApplyThreeStoreOverlappingHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: {
        activePlatformPromotions: [manualOnlyPlatformPromotion],
      },
    });
  }),

  graphql.query('ActiveStorePromotions', async ({ variables }) => {
    const storeId = (variables as { storeId?: string } | undefined)?.storeId ?? '';
    if (storeId === AUTO_APPLY_STORE_A_ID) {
      await delay(40);
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreAPromotion] },
      });
    }
    if (storeId === AUTO_APPLY_STORE_B_ID) {
      await delay(5);
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreBPromotion] },
      });
    }
    if (storeId === AUTO_APPLY_STORE_C_ID) {
      await delay(25);
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreCPromotion] },
      });
    }
    return HttpResponse.json({ data: { activeStorePromotions: [] } });
  }),

  graphql.query('ValidatePromotion', async ({ request, variables }) => {
    let code = extractValidateCode(variables);
    if (!code) {
      try {
        const body: unknown = await request.clone().json();
        const nested =
          body && typeof body === 'object' && 'variables' in body
            ? (body as { variables?: unknown }).variables
            : undefined;
        code = extractValidateCode(nested);
      } catch {
        code = '';
      }
    }
    const result = validateByCode[code] ?? validateAutoApplyPlatform;
    return HttpResponse.json({ data: { validatePromotion: result } });
  }),
  validatePromotionsHandler(),
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

/** Overlapping ActiveStorePromotions responses — store B returns first, then store A. */
export const promotionAutoApplyOverlappingStoreHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: {
        activePlatformPromotions: [autoApplyPlatformPromotion, manualOnlyPlatformPromotion],
      },
    });
  }),

  graphql.query('ActiveStorePromotions', async ({ variables }) => {
    const storeId = (variables as { storeId?: string } | undefined)?.storeId ?? '';
    if (storeId === AUTO_APPLY_STORE_A_ID) {
      await delay(60);
      return HttpResponse.json({
        data: { activeStorePromotions: [autoApplyStoreAPromotion] },
      });
    }
    if (storeId === AUTO_APPLY_STORE_B_ID) {
      await delay(5);
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
        const nested =
          body && typeof body === 'object' && 'variables' in body
            ? (body as { variables?: unknown }).variables
            : undefined;
        code = extractValidateCode(nested);
      } catch {
        code = '';
      }
    }
    const result = validateByCode[code] ?? validateAutoApplyPlatform;
    return HttpResponse.json({ data: { validatePromotion: result } });
  }),
  validatePromotionsHandler(),
];

/** Store A auto-applies; store B is manual-only (QA sibling-select path). */
export const promotionAutoApplyStoreAOnlyHandlers = [
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [manualOnlyPlatformPromotion] },
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
        data: { activeStorePromotions: [manualOnlyStoreBPromotion] },
      });
    }
    return HttpResponse.json({ data: { activeStorePromotions: [] } });
  }),

  graphql.query('ValidatePromotion', async ({ request, variables }) => {
    let code = extractValidateCode(variables);
    if (!code) {
      try {
        const body: unknown = await request.clone().json();
        const nested =
          body && typeof body === 'object' && 'variables' in body
            ? (body as { variables?: unknown }).variables
            : undefined;
        code = extractValidateCode(nested);
      } catch {
        code = '';
      }
    }
    const result = validateByCode[code] ?? validateAutoApplyPlatform;
    return HttpResponse.json({ data: { validatePromotion: result } });
  }),
  validatePromotionsHandler(),
];
