# Templates

**Atomic level:** Templates

Page-level layout shells that define structure using placeholder or slot content. Templates wire together organisms and sections without binding to real route data.

## What belongs here

- Reusable layout compositions (e.g. `ShopLayout`, `ProductDetailLayout`)
- Grid or column structures with named slots for children
- Shared chrome around page content (sidebars, aside panels)

## What does not belong here

- Route-specific data fetching or GraphQL calls — use `pages/` (or `src/app/**/page.tsx`)
- Small UI primitives — use `atoms/`
- Feature blocks with business logic — use `organisms/` or `sections/`

## In this project

Next.js App Router layouts in `src/app/**/layout.tsx` often fulfill the template role. Add shared template components here when the same structural shell is reused across multiple routes.
