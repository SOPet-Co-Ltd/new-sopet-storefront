import { getAnalyticsConfig } from './config';
import { callGtag, pushToDataLayer } from './dataLayer';

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  currency?: string;
};

export type EcommercePayload = {
  currency?: string;
  value?: number;
  transaction_id?: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items?: AnalyticsItem[];
};

export type PageViewParams = {
  page_path: string;
  page_title?: string;
  page_location?: string;
};

const DEFAULT_CURRENCY = 'THB';

/** Clears the previous ecommerce object (GA4/GTM recommended before each ecommerce event). */
function clearEcommerce(): void {
  pushToDataLayer({ ecommerce: null });
}

function pushEcommerceEvent(event: string, ecommerce: EcommercePayload): boolean {
  const { enabled } = getAnalyticsConfig();
  if (!enabled) {
    return false;
  }

  clearEcommerce();
  const pushed = pushToDataLayer({ event, ecommerce });

  // Direct GA4 path (when gtag.js is loaded)
  callGtag('event', event, {
    ...ecommerce,
    send_to: getAnalyticsConfig().ga4MeasurementId ?? undefined,
  });

  return pushed;
}

/**
 * SPA / virtual page view. Prefer this over relying solely on GTM History Change
 * so App Router client navigations are always visible to GTM + optional gtag.
 */
export function trackPageView(params: PageViewParams): boolean {
  const { enabled, ga4MeasurementId } = getAnalyticsConfig();
  if (!enabled) {
    return false;
  }

  const page_path = params.page_path;
  const page_title =
    params.page_title ?? (typeof document !== 'undefined' ? document.title : undefined);
  const page_location =
    params.page_location ?? (typeof window !== 'undefined' ? window.location.href : undefined);

  const pushed = pushToDataLayer({
    event: 'page_view',
    page_path,
    page_title,
    page_location,
  });

  if (ga4MeasurementId) {
    callGtag('event', 'page_view', {
      page_path,
      page_title,
      page_location,
      send_to: ga4MeasurementId,
    });
  }

  return pushed;
}

export function trackViewItem(params: {
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
}): boolean {
  return pushEcommerceEvent('view_item', {
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    items: params.items,
  });
}

export function trackAddToCart(params: {
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
}): boolean {
  return pushEcommerceEvent('add_to_cart', {
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    items: params.items,
  });
}

export function trackBeginCheckout(params: {
  currency?: string;
  value?: number;
  coupon?: string;
  items: AnalyticsItem[];
}): boolean {
  return pushEcommerceEvent('begin_checkout', {
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    coupon: params.coupon,
    items: params.items,
  });
}

export function trackPurchase(params: {
  transaction_id: string;
  currency?: string;
  value: number;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items: AnalyticsItem[];
}): boolean {
  return pushEcommerceEvent('purchase', {
    transaction_id: params.transaction_id,
    currency: params.currency ?? DEFAULT_CURRENCY,
    value: params.value,
    shipping: params.shipping,
    tax: params.tax,
    coupon: params.coupon,
    items: params.items,
  });
}
