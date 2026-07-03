# Components

Shared React UI for the SOPET storefront, organized with [atomic design](https://bradfrost.com/blog/post/atomic-web-design/).

## Folder structure

| Folder | Atomic level | Purpose |
|--------|--------------|---------|
| `atoms/` | Atoms | Smallest reusable UI primitives |
| `molecules/` | Molecules | Simple combinations of atoms |
| `organisms/` | Organisms | Self-contained, feature-rich UI blocks |
| `sections/` | Organisms (page sections) | Full-width or page-level content blocks composed for layouts |
| `templates/` | Templates | Reusable page shells and slot-based layout structure |
| `pages/` | Pages | Concrete page components with real data and route behavior |
| `util/` | — | Non-visual helpers and wrappers (not a design tier) |

## Templates & pages in Next.js

Route files in `src/app/**/layout.tsx` and `page.tsx` often map to templates and pages. Use `templates/` and `pages/` here for shared components those routes import. Compose from `sections/`, `organisms/`, `molecules/`, and `atoms/` as needed.

## Conventions

- One component per file; use PascalCase filenames (e.g. `ProductCard.tsx`)
- Export the component as the default or a named export consistently within each folder
- Prefer importing downward in the hierarchy (organisms → molecules → atoms), never the reverse
- Co-locate component tests next to the component when added (`*.test.tsx`)

## Current status

Folders are scaffolded and ready for components. No component files exist yet.
