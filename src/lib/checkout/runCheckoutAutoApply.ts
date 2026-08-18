import {
  ActivePlatformPromotionsDocument,
  ActiveStorePromotionsDocument,
  type ValidatePromotionInput,
} from '@/lib/graphql/generated/graphql';
import type { PromotionValidation } from '@/lib/hooks/useCheckout';
import {
  rankAutoApplyPromotions,
  type AutoApplyCandidate,
  type ScoredAutoApplyCandidate,
} from '@/lib/checkout/rankAutoApplyPromotions';
import {
  parseStorePromotionConditions,
  type PromotionEstimateCartLine,
  type StorePromotionSelection,
} from '@/lib/checkout/storePromotionUtils';
import { validateCheckoutPromotionCode } from '@/lib/checkout/validateCheckoutPromotion';

/** Active-list row shape used for auto-apply candidacy (platform or store). */
export type AutoApplyListPromotion = {
  id: string;
  code: string;
  name?: string | null;
  type?: string | null;
  priority?: number | null;
  autoApply?: boolean | null;
  conditions?: string | null;
};

export type AutoApplyApolloClient = {
  /** Apollo Client 4 types `query` as `Promise<unknown>` — narrow via `readAutoApplyQueryData`. */
  query: (options: {
    query: typeof ActiveStorePromotionsDocument | typeof ActivePlatformPromotionsDocument;
    variables?: { storeId?: string } | Record<string, never>;
    fetchPolicy?: 'network-only' | 'cache-first' | 'no-cache' | 'cache-only';
  }) => Promise<unknown>;
};

/** Detach list rows from Apollo cache proxies so overlapping store fetches cannot alias. */
function snapshotPromotionList(
  promotions: AutoApplyListPromotion[] | null | undefined,
): AutoApplyListPromotion[] {
  if (!promotions?.length) {
    return [];
  }
  return promotions.map((promo) => ({ ...promo }));
}

function readAutoApplyQueryData(result: unknown):
  | {
      activeStorePromotions?: AutoApplyListPromotion[];
      activePlatformPromotions?: AutoApplyListPromotion[];
    }
  | null
  | undefined {
  if (!result || typeof result !== 'object' || !('data' in result)) {
    return undefined;
  }
  const data = (result as { data?: unknown }).data;
  if (data == null) {
    return data as null | undefined;
  }
  if (typeof data !== 'object') {
    return undefined;
  }
  return data as {
    activeStorePromotions?: AutoApplyListPromotion[];
    activePlatformPromotions?: AutoApplyListPromotion[];
  };
}

export type RunCheckoutAutoApplyParams = {
  /** C1 snapshot — platform emptiness = `promotionCode == null`. */
  promotionCode: string | null;
  /** C1 snapshot — store emptiness = no `storePromotionsByStoreId[storeId]?.code`. */
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
  storeIds: string[];
  platformSubtotal: number;
  storeSubtotals: Record<string, number>;
  /** Order-wide shipping fee for platform-lane shipping promos. */
  platformShippingFee?: number;
  /** Per-store shipping fee for store-lane shipping promos. */
  storeShippingFees?: Record<string, number>;
  platformLines?: PromotionEstimateCartLine[];
  storeLinesByStoreId?: Record<string, PromotionEstimateCartLine[]>;
  /**
   * Platform active list (from page-level query). When empty and `client` is set,
   * runner also `client.query`s ActivePlatformPromotions (readiness race safety).
   */
  platformPromotions: AutoApplyListPromotion[];
  validatePromotion: (input: ValidatePromotionInput) => Promise<PromotionValidation | undefined>;
  /** Apollo client for per-store (and optional platform) `client.query` prefetch. */
  client?: AutoApplyApolloClient;
  /** Test seam — overrides platform list fetch. */
  fetchPlatformPromotions?: () => Promise<AutoApplyListPromotion[]>;
  /** Test seam — overrides `client.query` per storeId. */
  fetchStorePromotions?: (storeId: string) => Promise<AutoApplyListPromotion[]>;
  setPromotion: (code: string | null) => void;
  setPromotionName: (name: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
  setPromotionType: (type: string | null) => void;
  setPromotionFreeUnits: (freeUnits: number | null) => void;
  setPromotionProductId: (productId: string | null) => void;
  setStorePromotion: (storeId: string, promotion: StorePromotionSelection) => void;
};

export type RunCheckoutAutoApplyResult = {
  /** Always true when the runner returns — caller should `markAutoApplyAttempted`. */
  settled: true;
  appliedPlatformCode: string | null;
  appliedStoreCodes: Record<string, string>;
};

type ScoredWithConditions = ScoredAutoApplyCandidate & {
  listConditions?: string | null;
};

function toCandidate(promo: AutoApplyListPromotion): AutoApplyCandidate {
  return {
    id: promo.id,
    code: promo.code,
    priority: promo.priority ?? 0,
    autoApply: promo.autoApply === true,
    name: promo.name,
    type: promo.type,
  };
}

async function scoreLaneCandidates(
  promotions: AutoApplyListPromotion[],
  options: {
    subtotal: number;
    storeId?: string;
    shippingFee?: number;
    lines?: PromotionEstimateCartLine[];
    validatePromotion: RunCheckoutAutoApplyParams['validatePromotion'];
  },
): Promise<ScoredWithConditions[]> {
  const eligible = promotions.filter((promo) => promo.autoApply === true);

  const scoredOrNull = await Promise.all(
    eligible.map(async (promo): Promise<ScoredWithConditions | null> => {
      try {
        const validation = await validateCheckoutPromotionCode({
          code: promo.code,
          subtotal: options.subtotal,
          storeId: options.storeId,
          shippingFee: options.shippingFee,
          lines: options.lines,
          validatePromotion: options.validatePromotion,
        });

        return {
          ...toCandidate(promo),
          autoApply: true,
          discountAmount: validation.discountAmount,
          validation,
          listConditions: promo.conditions,
        };
      } catch {
        // Soft/hard validate failures: skip candidate; never throw to error boundary.
        return null;
      }
    }),
  );

  return scoredOrNull.filter((entry): entry is ScoredWithConditions => entry != null);
}

function applyPlatformWinner(
  winner: ScoredWithConditions,
  setters: Pick<
    RunCheckoutAutoApplyParams,
    | 'setPromotion'
    | 'setPromotionName'
    | 'setPromotionDiscount'
    | 'setPromotionType'
    | 'setPromotionFreeUnits'
    | 'setPromotionProductId'
  >,
): void {
  const productId = parseStorePromotionConditions(winner.listConditions).productId ?? null;
  setters.setPromotion(winner.validation.code);
  setters.setPromotionName(winner.validation.name);
  setters.setPromotionDiscount(winner.validation.discountAmount);
  setters.setPromotionType(winner.type ?? null);
  setters.setPromotionFreeUnits(winner.validation.freeUnits ?? null);
  setters.setPromotionProductId(productId);
}

function applyStoreWinner(
  storeId: string,
  winner: ScoredWithConditions,
  setStorePromotion: RunCheckoutAutoApplyParams['setStorePromotion'],
): void {
  const productId = parseStorePromotionConditions(winner.listConditions).productId ?? null;
  setStorePromotion(storeId, {
    code: winner.validation.code,
    name: winner.validation.name,
    discountAmount: winner.validation.discountAmount,
    type: winner.type ?? null,
    freeUnits: winner.validation.freeUnits ?? null,
    productId,
  });
}

async function fetchPlatformList(
  params: Pick<
    RunCheckoutAutoApplyParams,
    'client' | 'fetchPlatformPromotions' | 'platformPromotions'
  >,
): Promise<AutoApplyListPromotion[]> {
  try {
    if (params.fetchPlatformPromotions) {
      return snapshotPromotionList(await params.fetchPlatformPromotions());
    }

    // Prefer imperative client.query when available (closes hook readiness race).
    // no-cache: overlapping store/platform fetches must not share a live cache result.
    if (params.client) {
      const result = await params.client.query({
        query: ActivePlatformPromotionsDocument,
        variables: {},
        fetchPolicy: 'no-cache',
      });
      return snapshotPromotionList(readAutoApplyQueryData(result)?.activePlatformPromotions);
    }
  } catch {
    // Fall through to provided list.
  }

  return snapshotPromotionList(params.platformPromotions);
}

async function fetchStoreList(
  storeId: string,
  params: Pick<RunCheckoutAutoApplyParams, 'client' | 'fetchStorePromotions'>,
): Promise<AutoApplyListPromotion[] | null> {
  try {
    if (params.fetchStorePromotions) {
      return snapshotPromotionList(await params.fetchStorePromotions(storeId));
    }

    if (!params.client) {
      return [];
    }

    const result = await params.client.query({
      query: ActiveStorePromotionsDocument,
      variables: { storeId },
      fetchPolicy: 'no-cache',
    });

    return snapshotPromotionList(readAutoApplyQueryData(result)?.activeStorePromotions);
  } catch {
    // Active list fetch error → soft-fail that store lane.
    return null;
  }
}

/**
 * One-shot checkout auto-apply orchestration (Design Doc Phase C / MSA Element C).
 * C1: snapshot emptiness before any validate/apply. Prefetch: `client.query` per cart storeId.
 * Soft-fails expected list/validate errors; always returns `settled: true` for once-gate.
 */
export async function runCheckoutAutoApply(
  params: RunCheckoutAutoApplyParams,
): Promise<RunCheckoutAutoApplyResult> {
  // C1 snapshot — before any I/O (UI-AA-006 / Mount Sequence step 5).
  const platformEmpty = params.promotionCode == null;
  const emptyStoreIds = params.storeIds.filter(
    (storeId) => !params.storePromotionsByStoreId[storeId]?.code,
  );

  const appliedStoreCodes: Record<string, string> = {};
  let appliedPlatformCode: string | null = null;

  // Prefetch platform in parallel with stores. Store catalogs are sequential so a
  // shared/live list cannot be overwritten before we snapshot the previous store.
  const platformListPromise = fetchPlatformList(params);
  const storeLists: Array<{
    storeId: string;
    list: AutoApplyListPromotion[] | null;
  }> = [];
  for (const storeId of params.storeIds) {
    storeLists.push({ storeId, list: await fetchStoreList(storeId, params) });
  }
  const platformList = await platformListPromise;
  const listByStoreId = new Map(storeLists.map((entry) => [entry.storeId, entry.list]));

  let platformWinner: ScoredWithConditions | undefined;
  const storeWinners: Array<{ storeId: string; winner: ScoredWithConditions }> = [];

  const platformTask = (async () => {
    if (!platformEmpty) {
      return;
    }

    try {
      const scored = await scoreLaneCandidates(platformList, {
        subtotal: params.platformSubtotal,
        shippingFee: params.platformShippingFee ?? 0,
        lines: params.platformLines,
        validatePromotion: params.validatePromotion,
      });
      const ranked = rankAutoApplyPromotions(scored);
      platformWinner = ranked[0] as ScoredWithConditions | undefined;
    } catch {
      // Soft-fail platform lane.
    }
  })();

  const storeTasks = emptyStoreIds.map(async (storeId) => {
    const list = listByStoreId.get(storeId);
    if (list == null) {
      return;
    }

    try {
      const scored = await scoreLaneCandidates(list, {
        subtotal: params.storeSubtotals[storeId] ?? 0,
        storeId,
        shippingFee: params.storeShippingFees?.[storeId] ?? 0,
        lines: params.storeLinesByStoreId?.[storeId],
        validatePromotion: params.validatePromotion,
      });
      const ranked = rankAutoApplyPromotions(scored);
      const winner = ranked[0] as ScoredWithConditions | undefined;
      if (!winner) {
        return;
      }
      storeWinners.push({ storeId, winner });
    } catch {
      // Soft-fail store lane.
    }
  });

  await Promise.all([platformTask, ...storeTasks]);

  // Apply after every lane has scored so sibling store writes land in one tick.
  if (platformWinner) {
    applyPlatformWinner(platformWinner, params);
    appliedPlatformCode = platformWinner.validation.code;
  }
  for (const { storeId, winner } of storeWinners) {
    applyStoreWinner(storeId, winner, params.setStorePromotion);
    appliedStoreCodes[storeId] = winner.validation.code;
  }

  return {
    settled: true,
    appliedPlatformCode,
    appliedStoreCodes,
  };
}
