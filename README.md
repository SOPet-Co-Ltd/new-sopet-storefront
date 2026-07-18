# SOPET Storefront

Customer-facing Next.js web application for the SOPET multi-vendor pet e-commerce platform.

**Port:** `3000` · **Stack:** Next.js 16, React 19, GraphQL · **Package manager:** Yarn only

## Overview

Shoppers browse products, search, manage carts, checkout (including guest checkout), pay via Omise, and manage their account (orders, addresses, favorites, reviews, notifications).

## Tech stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router)            |
| UI        | React 19, Tailwind CSS 4           |
| Data      | Apollo Client 4, GraphQL           |
| Testing   | Vitest, React Testing Library, MSW |
| Payments  | Omise.js (browser tokenization)    |
| Codegen   | GraphQL Code Generator             |

## Architecture

```text
app/(main)/page.tsx  →  components/pages|sections/  →  lib/hooks/  →  Apollo  →  /graphql  →  Backend :3002
```

Atomic design components. Apollo cache + React Context for state. See [docs/architecture.md](docs/architecture.md).

## Prerequisites

- Node.js 22+ (CI uses Node 22)
- Yarn 1.22+ (`packageManager: yarn@1.22.22`; `preinstall` enforces Yarn)
- Running [backend](../sopet-backend/) at `http://localhost:3002`
- Backend schema at `../sopet-backend/src/schema.gql` (for GraphQL codegen)

## Installation

```bash
yarn install
cp .env.example .env.local
```

## Environment setup

| Variable                               | Default                           | Purpose                                                             |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL`              | `/graphql`                        | Browser GraphQL (proxied)                                           |
| `GRAPHQL_SSR_URL`                      | `http://localhost:3002/graphql`   | Server-side GraphQL                                                 |
| `GRAPHQL_SSR_BYPASS_SECRET`            | —                                 | Server-only; Cloudflare SSR bypass (see docs/cloudflare-ssr-bypass) |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY`         | —                                 | Must match backend `OMISE_PUBLIC_KEY`                               |
| `NEXT_PUBLIC_FACEBOOK_APP_ID`          | —                                 | Optional; Messenger share on products                               |
| `NEXT_PUBLIC_BASE_URL`                 | `http://localhost:3000`           | Canonical URLs, Open Graph, sitemap, robots                         |
| `NEXT_PUBLIC_SITE_NAME`                | `Sopet`                           | Title template, Open Graph `siteName`                               |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | —                                 | Optional Google Search Console tag                                  |
| `GRAPHQL_SCHEMA_PATH`                  | `../sopet-backend/src/schema.gql` | Codegen schema source (also accepts `sopet-backend/src/schema.gql`) |
| `GRAPHQL_SCHEMA_GITHUB_OWNER/REPO/REF` | —                                 | Optional; fetch schema from GitHub when no local schema (CI/Vercel) |

Optional WebSocket overrides (see `src/lib/config.ts`): `NEXT_PUBLIC_GRAPHQL_WS_URL`, `NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN`, `GRAPHQL_WS_SSR_URL`.

## Running locally

```bash
yarn dev    # http://localhost:3000
```

Customer auth uses phone OTP at `/login`. Requires backend at `http://localhost:3002` (sibling repo `../sopet-backend`).

## Build

```bash
yarn build    # Runs graphql:codegen first (prebuild)
yarn start    # Port 3000
```

## Testing

```bash
yarn test
yarn test:watch
```

Uses Vitest + jsdom + MSW. Setup: `src/test/setup.ts`.

| Pattern                    | Purpose                               |
| -------------------------- | ------------------------------------- |
| `*.test.tsx` / `*.test.ts` | Unit/component (co-located)           |
| `*.int.test.tsx`           | Integration (multi-module flows)      |
| `*.fixture.e2e.test.tsx`   | RTL+MSW user journeys from design ACs |

## Linting & formatting

```bash
yarn lint
yarn format
yarn format:check      # CI
```

## Project structure

```text
src/
├── app/
│   ├── (main)/             # Catalog, search, account (header/footer)
│   ├── (auth)/             # Login, OTP, signout
│   ├── (checkout)/         # Checkout flow
│   ├── (payment)/          # Payment status
│   ├── robots.ts           # robots.txt
│   ├── sitemap.ts          # sitemap.xml
│   └── llms.txt/           # Plain-text LLM crawler route
├── components/             # Atomic design + order-tracking/ + seo/
├── hooks/                  # Cross-cutting UI hooks (e.g. useIsMobile)
├── lib/
│   ├── graphql/            # Client, operations, codegen output
│   ├── hooks/              # Apollo data hooks
│   ├── providers/          # Auth, cart, checkout context
│   ├── checkout/           # Checkout business logic
│   ├── payment/            # Omise integration
│   ├── catalog/, search/   # Domain utilities
│   ├── seo/                # Metadata, sitemap, JSON-LD helpers
│   ├── session.ts          # Guest session cookie
│   └── providers.tsx       # AppProviders composition
└── test/                   # MSW handlers, fixtures, Apollo test wrapper
```

## Documentation

| Document                                           | Description                                |
| -------------------------------------------------- | ------------------------------------------ |
| [Docs index](docs/README.md)                       | Full documentation                         |
| [Architecture](docs/architecture.md)               | App Router, data flow, component hierarchy |
| [Folder structure](docs/folder-structure.md)       | Directory guide                            |
| [Routing](docs/routing.md)                         | Route groups and page patterns             |
| [State management](docs/state-management.md)       | Providers and Apollo cache                 |
| [GraphQL](docs/graphql.md)                         | Client, codegen, operations                |
| [Components](docs/components.md)                   | Atomic design conventions                  |
| [Hooks](docs/hooks.md)                             | Data hook patterns                         |
| [Development guide](docs/development-guide.md)     | Where to put new code                      |
| [Feature development](docs/feature-development.md) | End-to-end feature guide                   |
| [Coding conventions](docs/coding-conventions.md)   | Naming, testing                            |
| [SEO](docs/seo.md)                                 | Metadata, sitemap, robots, JSON-LD         |

## Common commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `yarn dev`             | Development server (:3000)           |
| `yarn graphql:codegen` | Regenerate types from backend schema |
| `yarn graphql:watch`   | Watch schema/document changes        |
| `yarn test`            | Run Vitest                           |
| `yarn lint`            | ESLint                               |
| `yarn format`          | Prettier write                       |
| `yarn build`           | Codegen + Next.js production build   |

## Deployment

Deployed to **Vercel** via GitHub Actions deploy hooks (`vercel.json` disables Vercel git auto-deploy).

| Branch              | Environment |
| ------------------- | ----------- |
| `deploy/production` | production  |
| `deploy/uat`        | uat         |

Push to a deploy branch triggers `.github/workflows/deploy.yml`, which POSTs to `VERCEL_DEPLOY_HOOK_URL` (configured per GitHub Environment).

## Contributing

1. Husky pre-commit runs Prettier via lint-staged; pre-push runs `yarn test`
2. CI on PR (`main`, `uat`): lint → test → build → forbidden-import guard
3. Backend schema changes require `yarn graphql:codegen`
4. Follow atomic design import rules (downward only)
5. Co-locate tests with components/hooks
6. See [feature development guide](docs/feature-development.md)

Schema changes land in `../sopet-backend` first (`src/schema.gql`), then run `yarn graphql:codegen` here (and in `../sopet-admin` if affected). Commit each repo separately.
