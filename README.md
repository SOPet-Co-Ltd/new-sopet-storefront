# SOPET Storefront

Customer-facing Next.js web application for the SOPET multi-vendor pet e-commerce platform.

## Overview

Shoppers browse products, search, manage carts, checkout (including guest checkout), pay via Omise, and manage their account (orders, addresses, favorites, reviews).

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
app/(main)/page.tsx  →  components/pages/  →  lib/hooks/  →  Apollo  →  /graphql  →  Backend
```

Atomic design components. Apollo cache + React Context for state. See [docs/architecture.md](docs/architecture.md).

## Prerequisites

- Node.js 20+
- Yarn 1.22+
- Running [backend](../sopet-backend/) at `http://localhost:3002`

## Installation

```bash
yarn install
cp .env.example .env.local
```

## Environment setup

| Variable                       | Default                         | Purpose                               |
| ------------------------------ | ------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL`      | `/graphql`                      | Browser GraphQL (proxied)             |
| `GRAPHQL_SSR_URL`              | `http://localhost:3002/graphql` | Server-side GraphQL                   |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | —                               | Must match backend `OMISE_PUBLIC_KEY` |

## Running locally

```bash
yarn dev    # http://localhost:3000
```

Full stack: [workspace getting started](../new-sopet-workspace/docs/developer/getting-started.md).

## Build

```bash
yarn build    # Runs graphql:codegen first
yarn start
```

## Testing

```bash
yarn test
yarn test:watch
```

Uses Vitest + jsdom + MSW. Setup: `src/test/setup.ts`.

## Linting

```bash
yarn lint
```

## Project structure

```text
src/
├── app/                    # Routes (main, auth, checkout, payment)
├── components/             # Atomic design UI
└── lib/
    ├── graphql/            # Client, operations, codegen output
    ├── hooks/              # Data hooks
    ├── providers/          # Auth, cart, checkout context
    ├── checkout/           # Checkout business logic
    └── payment/            # Omise integration
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

**Cross-repo:** [Workspace developer docs](../new-sopet-workspace/docs/developer/README.md)

## Common commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `yarn dev`             | Development server (:3000)           |
| `yarn graphql:codegen` | Regenerate types from backend schema |
| `yarn graphql:watch`   | Watch schema changes                 |
| `yarn test`            | Run Vitest                           |
| `yarn lint`            | ESLint                               |

## Contributing

1. Backend schema changes require `yarn graphql:codegen`
2. Follow atomic design import rules (downward only)
3. Co-locate tests with components/hooks
4. CI: lint → test → build (sparse-checkouts backend schema from GitHub)
5. See [feature development guide](docs/feature-development.md)
