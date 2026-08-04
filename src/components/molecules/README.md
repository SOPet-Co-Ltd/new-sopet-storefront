# Molecules

**Atomic design level:** Molecules

Simple groups of atoms that work together as a single UI unit. Molecules add light interaction or grouping but are not full feature sections.

## What belongs here

- Form fields (label + input + error message)
- Search bars (input + button/icon)
- Quantity selectors (minus + input + plus)
- Breadcrumb trails
- Inline alerts and toasts content
- Thumbnail + caption pairs

## Examples for this storefront

- `SearchBar` — search input with submit control
- `FormField` — label, input, and validation message
- `QuantitySelector` — adjust cart item quantity
- `ProductRating` — stars + review count
- `AddToCartControl` — quantity + add button group

## Guidelines

- Compose only from `atoms/` (and other molecules if needed)
- May hold local UI state (open/closed, hover) but not server data
- Keep molecules portable across different pages and organisms

## Current files

_Empty — add molecule components here._
