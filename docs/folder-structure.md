# Storefront Folder Structure

## `src/app/` — Routes

**Purpose:** Next.js App Router entry points. Keep files thin.

| Route group   | URL examples                             | Layout                    |
| ------------- | ---------------------------------------- | ------------------------- |
| `(main)/`     | `/`, `/cart`, `/product/[id]`, `/user/*` | Header + footer           |
| `(auth)/`     | `/login`, `/login/otp`, `/signout`       | Centered auth shell       |
| `(checkout)/` | `/checkout`                              | Header + full-height main |
| `(payment)/`  | `/payment/[id]`                          | No chrome                 |

**Add a page here when:** Creating a new URL.

**Do NOT add:** Business logic, GraphQL calls (use server component + lib, or delegate to components/hooks).

**Pattern:**

```typescript
// src/app/(main)/my-page/page.tsx
import MyPage from '@/components/pages/MyPage';

export default function Page() {
  return <MyPage />;
}
```

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
| `util/`      | Non-visual helpers                              | React components             |

Existing README: `src/components/README.md`

---

## `src/lib/hooks/` — Data hooks

**Purpose:** Apollo `useQuery`/`useMutation` wrappers with typed interfaces.

**Add when:** New GraphQL operation needs client-side data access.

**Pattern:** `useProducts.ts`, `useOrders.ts`, `useAuth.ts`

**Do NOT add:** UI logic, JSX.

---

## `src/lib/providers/` — React Context

| Provider               | State                            |
| ---------------------- | -------------------------------- |
| `AuthProvider.tsx`     | Customer session, OTP methods    |
| `CartProvider.tsx`     | Cart items, selection, mutations |
| `CheckoutProvider.tsx` | Checkout form state (no GraphQL) |

**Add when:** Multiple components need shared client state.

---

## `src/lib/graphql/` — API client

| File/Folder            | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `client.ts`            | Browser Apollo client + WS subscriptions |
| `apollo-rsc.ts`        | Server Component client + `PreloadQuery` |
| `authLink.ts`          | Bearer token + refresh                   |
| `cachePolicies.ts`     | Apollo cache type policies               |
| `query-variables.ts`   | Variable builders for queries            |
| `operations/*.graphql` | GraphQL operation definitions            |
| `generated/graphql.ts` | Codegen output (do not edit)             |

---

## `src/lib/checkout/` — Checkout business logic

Pure functions and validation:

- `submitCheckout.ts` — order submission orchestration
- `guestCheckoutValidation.ts` — guest field validation
- `pendingCheckout.ts` — session persistence
- `checkoutPaymentMethod.ts` — payment method selection rules

**Add here:** Checkout rules that are not UI and not GraphQL transport.

---

## `src/lib/payment/` — Omise integration

- `omise.ts` — Omise.js tokenization wrapper

---

## `src/lib/search/` — Search utilities

- `searchFilters.ts`, `searchSort.ts`, `constants.ts`

---

## `src/lib/thai-address/` — Thai address dataset

Province/district/subdistrict data and helpers for address forms.

---

## `src/test/` — Test infrastructure

| File                | Purpose                                |
| ------------------- | -------------------------------------- |
| `setup.ts`          | Vitest setup, MSW server, Apollo reset |
| `mocks/handlers.ts` | Default GraphQL MSW handlers           |
| `mocks/fixtures/`   | Test data factories                    |

---

## Config files (root)

| File                 | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `next.config.ts`     | GraphQL rewrite, redirects, image domains |
| `codegen.ts`         | GraphQL Code Generator                    |
| `vitest.config.ts`   | Test runner                               |
| `postcss.config.mjs` | Tailwind v4                               |
| `eslint.config.mjs`  | Lint rules                                |

No `tailwind.config.ts` — tokens in `src/app/globals.css` `@theme` block.

## Related docs

- [Development guide](development-guide.md)
- [Routing](routing.md)
