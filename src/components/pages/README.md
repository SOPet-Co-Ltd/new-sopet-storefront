# Pages

**Atomic level:** Pages

Concrete page implementations that replace template placeholders with real data, copy, and route-specific behavior.

## What belongs here

- Page components composed from templates, sections, and organisms
- Route-level data wiring (props from loaders, server components, or page containers)
- Page-specific metadata, SEO, or analytics hooks when not handled in `src/app/`

## What does not belong here

- Reusable layout shells without data — use `templates/` or `src/app/**/layout.tsx`
- Shared feature blocks — use `organisms/` or `sections/`
- Primitives or small combos — use `atoms/` or `molecules/`

## In this project

Most pages live as `src/app/**/page.tsx`. Use this folder for page-level React components that are imported by those routes when the page file should stay thin.
