# Util

**Atomic design level:** N/A (supporting code, not a UI tier)

Utility components and wrappers that support the UI layer without being user-facing design elements. Not part of the atom → molecule → organism hierarchy.

## What belongs here

- Client-only render guards (`ClientOnly`)
- Error boundaries and fallbacks
- Portal or slot helpers
- Media-query or breakpoint wrappers
- Development-only helpers

## Examples for this storefront

- `ClientOnly` — render children only after hydration
- `ErrorBoundary` — catch and display component errors
- `Portal` — render modals/tooltips outside the DOM hierarchy
- `ShowAtBreakpoint` — conditionally render by viewport

## Guidelines

- Do not import from `sections/` or `organisms/` (util sits at the bottom of the dependency graph)
- Keep utilities generic and free of storefront-specific copy or branding
- Prefer `src/lib/` for non-React helpers (formatters, API clients)

## Current files

_Empty — add utility components here as needed._
