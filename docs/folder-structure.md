# Storefront Folder Structure

## `src/app/` — Routes

**Purpose:** Next.js App Router entry points. Keep files thin.

| Route group   | URL examples                             | Layout                    |
| ------------- | ---------------------------------------- | ------------------------- |
| `(main)/`     | `/`, `/cart`, `/product/[id]`, `/user/*` | Header + footer           |
| `(auth)/`     | `/login`, `/login/otp`, `/signout`       | Centered auth shell       |
| `(checkout)/` | `/checkout`                              | Header + full-height main |
| `(payment)/`  | `/payment/[id]`                          | No chrome                 |

Root-level (outside route groups): `layout.tsx`, `loading.tsx`, `robots.ts`, `sitemap.ts`, `llms.txt/route.ts`.

**Add a page here when:** Creating a new URL.

**Do NOT add:** Business logic or GraphQL in the route file beyond SSR preload/metadata (delegate UI to `src/components/`, data to `src/lib/hooks/`).

**Pattern:**

```typescript
// src/app/(main)/my-page/page.tsx
import MyPage from '@/components/pages/MyPage';

export default function Page() {
  return <MyPage />;
}
```

Some routes co-locate a route-specific client module next to `page.tsx` (for example `OrderConfirmedContent.tsx`, `ThankYouPageContent.tsx`) when the UI is not shared elsewhere.

Permanent redirects (`/products` → `/search`, `/user/wishlist` → `/user/favorites`, etc.) live in `next.config.ts` — see [Routing](routing.md).

---

## `src/components/` — UI

Atomic design tiers. See [components.md](components.md).

| Folder       | Add when                                        | Do NOT add                   |
| ------------ | ----------------------------------------------- | ---------------------------- |
| `atoms/`     | New primitive (button, input, icon)             | Feature logic                |
| `molecules/` | Composing 2–3 atoms (form field, card row)      | Page-level layout            |
| `organisms/` | Feature block (navbar, product gallery)         | Route-specific data fetching |
| `sections/`  | Full page section (cart page, checkout section) | Reusable primitives          |
| `templates/` | Layout shells (account layout, auth guard)      | Content                      |
| `pages/`     | Route-facing page with data wiring              | Atoms                        |
| `util/`      | Non-visual React helpers                        | Domain/business logic        |

Existing README: `src/components/README.md`

Two folders sit outside the atomic tiers, grouped by feature instead of by design level:

| Folder            | Purpose                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `order-tracking/` | Public order-tracking page UI (kebab-case filenames, e.g. `order-shipment-tracking-list.tsx`), shared between `/track/[orderNumber]` and the authenticated order detail page |
| `seo/`            | `JsonLdScript.tsx` — renders JSON-LD `<script>` tags. See [SEO](seo.md).                                                                                                     |

---

## `src/hooks/` — Cross-cutting UI hooks

Top-level (outside `lib/`): generic UI hooks not tied to GraphQL — currently `useIsMobile.ts` (viewport breakpoint detection).

---

## `src/lib/` — Shared application code

Root files:

| File            | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `config.ts`     | GraphQL HTTP/WS URL resolution for browser vs SSR                      |
| `session.ts`    | Guest `sopet_session_id` cookie helpers                                |
| `providers.tsx` | `AppProviders` — Apollo + Auth/Cart/Checkout + toaster + route loading |
| `utils.ts`      | `cn()` (clsx + tailwind-merge)                                         |

---

## `src/lib/hooks/` — Data hooks

**Purpose:** Apollo `useQuery`/`useMutation` wrappers with typed interfaces.

**Add when:** New GraphQL operation needs client-side data access.

**Pattern:** `useProducts.ts`, `useOrders.ts`, `useAuth.ts`

**Do NOT add:** UI logic, JSX.

See [hooks.md](hooks.md).

---

## `src/lib/providers/` — React Context

| Provider               | State                            |
| ---------------------- | -------------------------------- |
| `AuthProvider.tsx`     | Customer session, OTP methods    |
| `CartProvider.tsx`     | Cart items, selection, mutations |
| `CheckoutProvider.tsx` | Checkout form state (no GraphQL) |

**Add when:** Multiple components need shared client state.

Wired from `src/lib/providers.tsx`. See [state management](state-management.md).

---

## `src/lib/graphql/` — API client

| File/Folder             | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `client.ts`             | Browser Apollo client + WS subscriptions |
| `apollo-rsc.ts`         | Server Component client + `PreloadQuery` |
| `authLink.ts`           | Bearer token + refresh                   |
| `cachePolicies.ts`      | Apollo cache type policies               |
| `fragmentRegistry.ts`   | Registered GraphQL fragments for cache   |
| `query-variables.ts`    | Variable builders for queries            |
| `operations/*.graphql`  | GraphQL operation definitions            |
| `operations/fragments/` | Shared fragments (e.g. product card)     |
| `generated/graphql.ts`  | Codegen output (do not edit)             |

---

## `src/lib/checkout/` — Checkout business logic

Pure functions and validation (no React UI):

| File                           | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `submitCheckout.ts`            | Order submission orchestration               |
| `guestCheckoutValidation.ts`   | Guest field validation / order input mapping |
| `pendingCheckout.ts`           | Session persistence for pending payment      |
| `checkoutPaymentMethod.ts`     | Payment method selection rules               |
| `checkoutTotalsUtils.ts`       | Totals derivation helpers                    |
| `platformPromotionUtils.ts`    | Platform promotion display/selection helpers |
| `storePromotionUtils.ts`       | Store promotion display/selection helpers    |
| `validateCheckoutPromotion.ts` | Promotion validation error helpers           |

**Add here:** Checkout rules that are not UI and not GraphQL transport.

---

## `src/lib/payment/` — Omise integration

- `omise.ts` — Omise.js tokenization wrapper

---

## `src/lib/search/` — Search utilities

- `searchFilters.ts`, `searchSort.ts`, `constants.ts`

---

## `src/lib/thai-address/` — Thai address dataset

Province/district/subdistrict data and helpers for address forms (`dataset.ts`, `helpers.ts`, `useThaiAddressDataset.ts`).

---

## `src/lib/seo/` — SEO and metadata

Metadata builders, indexability rules, sitemap/JSON-LD helpers used by `robots.ts`, `sitemap.ts`, `llms.txt/route.ts`, and page-level `generateMetadata`. See [SEO](seo.md).

---

## Other `src/lib/` domain utility folders

Small, focused modules — pure functions plus co-located tests, no GraphQL:

| Folder            | Purpose                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `account/`        | `prefetchAccountPage.ts` — idle-time prefetch for account nav data                                           |
| `address/`        | `formatSavedAddressLine.ts` — address display formatting                                                     |
| `cart/`           | `cartUtils.ts` — cart item grouping, item count, subtotal calculations                                       |
| `catalog/`        | `prefetchProduct.ts`, `prefetchProductsListing.ts`, `prefetchSearchFilterTaxonomy.ts` — SSR prefetch helpers |
| `constants/`      | `orderStatus.ts`, `fulfillmentStatus.ts`, `orderListFilters.ts`                                              |
| `datetime/`       | `formatThaiDatetime.ts`, `calendarUtils.ts`                                                                  |
| `helpers/`        | `email.ts`, `phone.ts`, `dateOfBirth.ts` — form field validation/formatting                                  |
| `order-tracking/` | `order-tracking-progress.ts`, `group-items-by-store-shipment.ts`                                             |
| `orders/`         | `invalidateCustomerOrders.ts`, `orderListReturnUrl.ts`                                                       |
| `routing/`        | `categoryRoutes.ts` — category URL helpers                                                                   |
| `upload/`         | `uploadProfileImage.ts`, `uploadReviewImage.ts` — file upload to backend                                     |

**Add here:** a small pure-function module scoped to one domain concern that multiple hooks/components share.

---

## `src/test/` — Test infrastructure

| File/Folder                   | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `setup.ts`                    | Vitest setup, MSW server, Apollo reset |
| `createApolloTestWrapper.tsx` | Apollo + provider wrapper for tests    |
| `mocks/handlers.ts`           | Default GraphQL MSW handlers           |
| `mocks/fixtures/`             | Test data factories                    |
| `mocks/server.ts`             | MSW server instance                    |

---

## Config and tooling (repo root)

| File / folder        | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `next.config.ts`     | GraphQL rewrite, redirects, image domains                 |
| `codegen.ts`         | GraphQL Code Generator                                    |
| `vitest.config.ts`   | Test runner                                               |
| `postcss.config.mjs` | Tailwind v4                                               |
| `eslint.config.mjs`  | Lint rules                                                |
| `vercel.json`        | Vercel install command; git deploys disabled (hook-based) |
| `scripts/`           | Schema ensure, codegen duplicate fix, forbidden-import CI |
| `.github/workflows/` | `ci.yml` (PR), `deploy.yml` (Vercel deploy hooks)         |

No `tailwind.config.ts` — tokens in `src/app/globals.css` `@theme` block.

## Related docs

- [Development guide](development-guide.md)
- [Routing](routing.md)
- [SEO](seo.md)
