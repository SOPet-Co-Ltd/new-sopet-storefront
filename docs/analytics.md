# Analytics (GTM + GA4)

Storefront analytics is **GTM-first**, with optional direct GA4 for reliability.

| Concern             | Location                                          |
| ------------------- | ------------------------------------------------- |
| Config / ID checks  | `src/lib/analytics/config.ts`                     |
| `dataLayer` helpers | `src/lib/analytics/dataLayer.ts`                  |
| Typed events        | `src/lib/analytics/events.ts`                     |
| Item mappers        | `src/lib/analytics/items.ts`                      |
| Script injection    | `src/components/analytics/AnalyticsScripts.tsx`   |
| SPA `page_view`     | `src/components/analytics/AnalyticsPageViews.tsx` |
| Root wiring         | `src/app/layout.tsx`                              |

## Environment variables

Add to `.env.local` (see `.env.example`):

| Variable                         | Example    | Required                     |
| -------------------------------- | ---------- | ---------------------------- |
| `NEXT_PUBLIC_GTM_ID`             | `GTM-XXXX` | Recommended (primary loader) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXX`   | Optional dual bootstrap      |
| `NEXT_PUBLIC_ANALYTICS_ENABLED`  | `false`    | Optional kill-switch         |

Behaviour:

- **No IDs** → analytics is a no-op (local/dev safe; app does not break).
- **Invalid IDs** → ignored (must match `GTM-*` / `G-*`).
- **`NEXT_PUBLIC_ANALYTICS_ENABLED=false`** (or `0`) → disables scripts and all `dataLayer` / `gtag` pushes even if IDs are set.
- When unset, analytics loads whenever at least one valid ID is present.

IDs are never hardcoded. Prefer Vercel/project env for UAT/prod.

## How loading works

1. When enabled, root layout injects:
   - Early `dataLayer` + `gtag` stub (`beforeInteractive`)
   - **GTM** container script + `<noscript>` iframe (when `NEXT_PUBLIC_GTM_ID` is set)
   - **Direct GA4** `gtag/js` + `gtag('config', …, { send_page_view: false })` when `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set
2. Client navigations fire a `page_view` dataLayer event (and `gtag('event','page_view')` when GA4 ID is set) via `AnalyticsPageViews`.

`send_page_view: false` avoids double-counting with our SPA tracker when direct GA4 is enabled.

## Google Tag Manager UI setup

Recommended container tags:

1. **GA4 Configuration** tag
   - Tag type: Google Analytics → GA4 Configuration
   - Measurement ID: your `G-XXXX` (or a GTM variable)
   - Trigger: **Initialization – All Pages** (or All Pages)
   - Optional: disable the built-in page view if you only want App Router `page_view` events from the site (see below).

2. **GA4 Event – page_view (SPA)**
   - Tag type: GA4 Event
   - Event name: `page_view`
   - Event parameters: map `page_path`, `page_title`, `page_location` from the dataLayer
   - Trigger: Custom Event = `page_view`

3. **GA4 Event – ecommerce** (or rely on GA4 enhanced measurement / a single GA4 Event tag with event name from dataLayer)
   - Custom Event triggers for: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
   - Pass the `ecommerce` object (clear-then-set pattern is already applied in code).

Publish the container after configuring. Until publish, optional direct GA4 still records if `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set.

## Events fired today

| Event            | When                                                          |
| ---------------- | ------------------------------------------------------------- |
| `page_view`      | Initial load + every App Router client navigation             |
| `view_item`      | Product detail page once product data is available            |
| `add_to_cart`    | After successful add from product PDP (Add to cart / Buy now) |
| `begin_checkout` | Checkout page mount when selected cart lines exist            |
| `purchase`       | Thank-you page once order query resolves (once per order id)  |

Currency defaults to **THB**. Helpers (`trackViewItem`, `trackAddToCart`, …) live in `@/lib/analytics` for future extensions.

## Privacy / PDPA (Thailand)

There is **no cookie consent / CMP** in the storefront yet. Tags load when env enables them.

Future improvement: gate `AnalyticsScripts` and `pushToDataLayer` behind PDPA-compliant consent (e.g. only load GTM/GA4 after marketing analytics consent). Until then, keep production IDs out of local `.env` if you need a clean local session, or set `NEXT_PUBLIC_ANALYTICS_ENABLED=false`.

## Extending

```ts
import { pushToDataLayer, trackAddToCart } from '@/lib/analytics';

// Prefer typed helpers for ecommerce
trackAddToCart({ value: 199, items: [{ item_id: '…', item_name: '…', quantity: 1 }] });

// Or raw dataLayer for custom events
pushToDataLayer({ event: 'custom_event', foo: 'bar' });
```

## Related

- [SEO](seo.md) — metadata / Search Console verification (separate from GA4)
- Root [README](../README.md) — env table
