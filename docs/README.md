# Storefront Documentation

Customer-facing Next.js application for SOPET.

## Index

| Document                                      | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| [Architecture](architecture.md)               | App Router, data flow, component hierarchy |
| [Folder structure](folder-structure.md)       | Directory guide                            |
| [Routing](routing.md)                         | Route groups and page patterns             |
| [State management](state-management.md)       | Providers, Apollo cache                    |
| [Components](components.md)                   | Atomic design conventions                  |
| [Hooks](hooks.md)                             | Data hooks pattern                         |
| [GraphQL](graphql.md)                         | Client, codegen, operations                |
| [Coding conventions](coding-conventions.md)   | Naming, testing, styling                   |
| [Feature development](feature-development.md) | Adding pages and features                  |
| [Development guide](development-guide.md)     | Where to put new code                      |
| [SEO](seo.md)                                 | Metadata, sitemap, robots, JSON-LD         |

## Related repos

- [Backend API](../../sopet-backend/docs/api.md) — GraphQL schema owner (`../sopet-backend`)
- Admin panel lives in sibling repo `../sopet-admin`

## Quick start

```bash
cp .env.example .env.local
yarn install
yarn dev    # http://localhost:3000
```

Requires backend at `http://localhost:3002`.
