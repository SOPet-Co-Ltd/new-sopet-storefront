# Atoms

**Atomic design level:** Atoms

The smallest foundational UI elements. Atoms are single-purpose, highly reusable, and carry no business layout on their own.

## What belongs here

- Buttons, links styled as controls
- Text inputs, checkboxes, radio buttons
- Typography primitives (headings, body text, labels)
- Icons and logos
- Badges, chips, tags
- Price display, rating stars
- Skeleton loaders and spinners

## Examples for this storefront

- `Button` — primary, secondary, ghost variants
- `Input` — text, email, password fields
- `Price` — formatted currency display
- `Badge` — sale, new, out-of-stock labels
- `Icon` — wrapper around SVG icons

## Guidelines

- No GraphQL or data fetching; accept values via props
- Minimal or no internal state (except controlled form primitives)
- Style with design tokens / Tailwind utilities from `globals.css`

## Current files

_Empty — add atom components here as the design system grows._
