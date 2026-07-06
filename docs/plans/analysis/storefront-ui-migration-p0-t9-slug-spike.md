# P0-T9: Product Slug Resolution Spike

**Work Plan ID**: P0-T9  
**Date**: 2026-07-06  
**Status**: Complete — **backend escalation required before P1-T5 direct-URL PDP**  
**Unblocks**: AC-003 (with documented interim + backend follow-up)

---

## Summary

Legacy PDP URLs are `/products/[handle]` with **no `storeId` in the path**. The current GraphQL schema requires **both** `slug` and `storeId` for `productBySlug`, and product slugs are **unique per store only** (not globally). Slug-only lookup is **not possible** today without a backend schema change.

**Decision**: **Approach B (context-derived `storeId`) for in-app navigation** + **Approach C (backend escalation) for direct URL / SEO parity**.

| Approach | Description | Verdict |
|----------|-------------|---------|
| A — Globally unique slug, optional storeId | Slug unique platform-wide; storeId optional | **Rejected** — DB index is `(storeId, slug)` composite unique, not global |
| B — Derive storeId from context | Pass storeId from catalog/search card when navigating in-app | **Accepted (interim)** — works when caller has storeId |
| C — Backend schema change | Add slug-only resolution mirroring `storeBySlug` | **Required** — only path matching legacy direct URLs |

---

## Schema Evidence

From `sopet-backend/src/schema.gql`:

```graphql
product(id: String!): ProductType!
productBySlug(slug: String!, storeId: String!): ProductType!
storeBySlug(slug: String!): StoreType!
```

From `product.entity.ts`:

```typescript
@Index(['storeId', 'slug'], { unique: true, where: 'deleted_at IS NULL' })
```

**Implication**: Two stores can each have a product with slug `chew-toy-bone`. Slug alone is ambiguous in a multi-vendor marketplace.

Resolver implementation (`products.service.ts`):

```typescript
async findBySlug(storeId: string, slug: string): Promise<Product> {
  const product = await this.productRepository.findOne({
    where: { storeId, slug },
    ...
  });
}
```

Legacy Medusa storefront resolved handle globally via `listProducts({ handle: [handle] })` — no storeId required (`product-pdp.ts`). New backend does not expose an equivalent slug-only product query.

---

## GraphQL Playground Test Matrix

**Endpoint**: `http://localhost:3002/graphql` (dev default)  
**Note**: Local dev DB had zero published products at spike time. Pass/fail below reflects **schema + resolver behavior**; seed-catalog slugs document **expected** success responses after `yarn db:seed:dev`.

| # | Query | Variables | Expected | Actual (2026-07-06) | Result |
|---|-------|-----------|----------|---------------------|--------|
| 1 | `productBySlug` slug + storeId | `slug: "premium-dog-food-5kg"`, `storeId: "<seed-store-uuid>"` | `ProductType` with matching slug | Not run — empty DB; resolver accepts args | **Pending seed** |
| 2 | `productBySlug` slug only | `slug: "premium-dog-food-5kg"` | Product or validation error | `Field "productBySlug" argument "storeId" of type "String!" is required` | **Fail (blocked)** |
| 3 | `productBySlug` wrong storeId | `slug: "premium-dog-food-5kg"`, `storeId: "00000000-0000-0000-0000-000000000001"` | `PRODUCT_NOT_FOUND` | `{"errors":[{"message":"Product not found","extensions":{"code":"PRODUCT_NOT_FOUND"}}]}` | **Pass (expected 404)** |
| 4 | `product(id:)` valid id | `id: "<published-product-uuid>"` | `ProductType` | Not run — empty DB | **Pending seed** |
| 5 | `product(id:)` invalid id | `id: "00000000-0000-0000-0000-000000000001"` | `PRODUCT_NOT_FOUND` | `{"errors":[{"message":"Product not found","extensions":{"code":"PRODUCT_NOT_FOUND"}}]}` | **Pass (expected 404)** |
| 6 | `storeBySlug` slug only (control) | `slug: "sopet-pet-shop"` | `StoreType` | `{"data":{"storeBySlug":{"id":"c880a541-d7d9-4566-a4a8-73c27e68d2e3","slug":"sopet-pet-shop","name":"SOPet Pet Shop"}}}` | **Pass** |
| 7 | `products(search:)` as slug fallback | `search: "premium-dog-food-5kg"` | Exact slug match | Search uses `ILIKE` on name/description only — **no slug filter** | **Fail (not viable)** |

### Dev seed catalog (post-`yarn db:seed:dev`)

| Slug | Store slug | Notes |
|------|------------|-------|
| `premium-dog-food-5kg` | `sopet-pet-shop` | Published product |
| `cat-litter-10l` | `sopet-pet-shop` | Published product |
| `chew-toy-bone` | `sopet-pet-shop` | Published product |
| `pet-shampoo-500ml` | `sopet-pet-shop` | Published product |

Re-run tests 1 and 4 after seeding; query store id via `{ storeBySlug(slug: "sopet-pet-shop") { id } }`.

---

## Selected Strategy

### 1. Primary query: `productBySlug(slug, storeId)`

Use when `storeId` is available (catalog cards, search results, seller page product grids all return `ProductType.storeId`).

### 2. Fallback query: `product(id:)`

Use when navigating from cart, orders, or wishlist where the product UUID is already known. Not suitable for URL `[handle]` resolution.

### 3. Direct URL `/products/[handle]` (legacy parity)

**Blocked** until backend provides one of:

| Option | GraphQL change | Behavior |
|--------|----------------|----------|
| **Recommended** | `productBySlug(slug: String!, storeId: String): ProductType!` — make `storeId` optional | 0 matches → 404; 1 match → product; 2+ matches → `AMBIGUOUS_PRODUCT_SLUG` with store hints |
| Alternative | New `productByGlobalSlug(slug: String!): ProductType!` | Same disambiguation rules |
| Not recommended | Global unique index on `products.slug` | Breaks multi-vendor same-slug products |

### 4. Interim in-app navigation (until backend ships)

Product links from list/search components should carry `storeId`:

- **Preferred**: `<Link href={/products/${slug}}>` with `storeId` passed via React context or sessionStorage set on card click (survives client navigation, not refresh).
- **Optional query param** (not in legacy path): `?storeId=<uuid>` — acceptable for spike but requires P1 UX decision; omit from SEO canonical URL.

---

## Spike Hook

**File**: `src/lib/hooks/useProductBySlug.ts`  
**GraphQL ops**: `src/lib/graphql/operations/product.graphql` (merge into P1-T1 `product.graphql`)

```typescript
// Client component (P1-T5 ProductDetails client shell)
const { product, loading, error, missingStoreId } = useProductBySlug({
  slug: handle,
  storeId: resolvedStoreId, // from context, query param, or backend slug-only query
});

if (missingStoreId) {
  // Show 404 or "product unavailable" until backend slug-only support
}
```

```typescript
// Server component (P1-T5 page.tsx + generateMetadata)
import { executeQuery } from '@/lib/graphql/client';
import { ProductBySlugDocument, type ProductBySlugQuery } from '@/lib/graphql/generated/graphql';

const data = await executeQuery<ProductBySlugQuery>(ProductBySlugDocument, {
  slug: handle,
  storeId,
});
const product = data.productBySlug;
if (!product) notFound();
```

When `storeId` is omitted, the hook sets `missingStoreId: true` and skips the query — **fail-fast** rather than calling an invalid operation.

---

## Backend Escalation (TBD-01)

**To**: Backend team  
**Priority**: Blocker for P1-T5 direct-URL PDP (bookmarks, SEO, external links)

**Request**: Add slug-only product resolution with multi-vendor disambiguation, mirroring the existing `storeBySlug(slug:)` pattern.

**Suggested schema**:

```graphql
productBySlug(slug: String!, storeId: String): ProductType!
```

**Suggested resolver logic**:

1. If `storeId` provided → current `findBySlugPublished(storeId, slug)` behavior.
2. If `storeId` omitted → query published products by slug across stores:
   - 0 results → `PRODUCT_NOT_FOUND`
   - 1 result → return product
   - 2+ results → `AMBIGUOUS_PRODUCT_SLUG` (include `{ slug, storeIds: [...] }` in error details)

**Reference**: `stores.resolver.ts` `storeBySlug` — store slugs are globally unique; product slugs intentionally are not.

---

## Open Questions (Resolved / Deferred)

| Question | Resolution |
|----------|------------|
| Is slug globally unique? | **No** — composite unique on `(storeId, slug)` |
| Can `productBySlug` omit storeId? | **No** — GraphQL validation rejects missing arg |
| Can `products(search:)` substitute? | **No** — search matches name/description, not slug |
| Can `product(id:)` serve PDP URLs? | **No** — URL carries slug, not UUID |
| Legacy handle resolution | Medusa global handle lookup — needs backend equivalent |

---

## Handoff

| Task | Action |
|------|--------|
| **P1-T1** | Fold `product.graphql` spike ops into catalog ops file; remove spike comment |
| **P1-T5** | Implement PDP using `fetchProductBySlug` / `useProductBySlug`; wire storeId resolution per strategy above |
| **Backend** | Implement optional `storeId` on `productBySlug` before P1-T5 gate if direct URLs required |
| **P0-T8** | Add RTL + MockedProvider test for hook when test scaffold lands |

---

## AC-003 Unblock Statement

AC-003 PDP resolution path is **defined**:

- **In-app navigation**: `productBySlug(slug, storeId)` via spike hook ✅
- **Direct URL / SEO**: Documented backend escalation; frontend fail-fast until shipped ⚠️
- **UUID-known paths**: `product(id:)` fallback documented ✅

No blocking unknowns remain for P1-T5 **implementation planning**; P1-T5 **direct-URL production readiness** depends on backend shipping slug-only support or an approved storeId propagation UX.
