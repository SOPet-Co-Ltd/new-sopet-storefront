# SEO

SEO logic lives in `src/lib/seo/`, with root-level Next.js conventions (`robots.ts`, `sitemap.ts`) and a route handler (`llms.txt/route.ts`) consuming it.

## Metadata

**File:** `src/lib/seo/metadata.ts`

`buildPageMetadata()` is the shared builder — every page-level metadata function (`buildHomeMetadata`, `buildProductMetadata`, `buildCategoryMetadata`, `buildSellerMetadata`, `buildSearchMetadata`, `buildPolicyPageMetadata`) calls it. It sets:

- `title`, truncated `description` (Markdown stripped via `stripMarkdownForMeta`)
- `alternates.canonical` from `NEXT_PUBLIC_BASE_URL`
- `openGraph` and `twitter` cards, with `og:image` falling back to `DEFAULT_OG_IMAGE_PATH` (`src/lib/seo/constants.ts`)
- `robots` — passed per-page based on indexability rules

Site name/base URL resolve via `getSiteConfig()` from `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_BASE_URL`.

Root metadata defaults (title template, `openGraph.siteName`, Google Search Console verification) are built by `buildRootMetadata()` in `src/app/layout.tsx`.

## Indexability rules

**File:** `src/lib/seo/indexability.ts`

| Page     | Indexable when                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| Product  | `product.status === 'published'` (`isProductIndexable`)                                                         |
| Seller   | `store.status === 'approved'` (`isSellerIndexable`)                                                             |
| Category | Page 1 and no filter query params (`petType`, `brand`, `tag`, `minPrice`, `maxPrice`) — `getCategoryIndexation` |
| Search   | Never indexed (`getSearchIndexation`)                                                                           |

Non-indexable pages still render `follow: true` (except search) so link equity flows without being indexed themselves.

## JSON-LD

**File:** `src/lib/seo/json-ld.ts` · **Component:** `src/components/seo/JsonLdScript.tsx`

- `buildProductJsonLd(product, pageUrl, reviews?)` — `Product` schema with:
  - `Offer` (price from server-fetched data only, never client variant-selection state; includes `seller` when the store is present)
  - `brand` when `brandName` is present (approved catalog brand)
  - `AggregateRating` when `reviewCount > 0` (`bestRating: 5`, `worstRating: 1`)
  - up to 4 `Review` entries from the server-fetched review list (matches the PDP’s initial visible count)
- `buildFaqJsonLd()` — `FAQPage` from `HOME_FAQ_ITEMS`, emitted on the homepage only (product pages may still show the FAQ UI without duplicating FAQ schema)
- `buildWebPageJsonLd()` — policy and regulatory pages (`/policy/*`, `/security`) via `PolicyMarkdownLayout`, with breadcrumbs
- `buildCollectionPageJsonLd()` — indexable category listings, with breadcrumbs
- `buildOrganizationJsonLd()`, `buildWebSiteJsonLd()` (includes `SearchAction` for sitelinks search box), `buildBreadcrumbJsonLd()`

Product pages SSR-fetch `productReviews` alongside the product so review text is in the first HTML and in JSON-LD. A review-query failure still renders the product page and omits the `review` array.

`JsonLdScript` renders `<script type="application/ld+json">`, escaping `<` and returning `null` for empty payloads.

## Sitemap

**File:** `src/app/sitemap.ts` → `src/lib/seo/sitemap-sources.ts`

`collectSitemapUrls()` combines the home page, all `POLICY_PATHS`, `REGULATORY_PATHS` (e.g. `/security`), and GraphQL-backed approved categories, published products, and approved stores (fetched in parallel via `src/lib/seo/fetch.ts`). If a GraphQL source fails, its URLs are omitted rather than failing the whole sitemap. Revalidates hourly (`revalidate = 3600`).

## Robots

**File:** `src/app/robots.ts`

Disallows account, auth, cart, checkout, payment, order-tracking, order-confirmation, thank-you, recommend, and search paths. Points to `${baseUrl}/sitemap.xml`.

## `llms.txt`

**File:** `src/app/llms.txt/route.ts`

Plain-text route handler describing the site to LLM crawlers: home URL, live approved categories from GraphQL (`fetchApprovedCategories`), policy links, trust/security links (`REGULATORY_PATHS`), URL patterns, and notes that search/checkout/account/order-tracking are not intended for indexing and that each product page carries that product’s rating and reviews. If the category fetch fails, category lines are omitted. Revalidates daily (`revalidate = 86400`).

## Related docs

- [Routing](routing.md)
- [Folder structure](folder-structure.md)
