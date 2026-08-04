# Sections

**Atomic design level:** Organisms (page sections)

Full-width or page-level content blocks used to assemble storefront pages. Sections orchestrate organisms, molecules, and atoms into coherent vertical slices (hero, product grids, promos).

## What belongs here

- Homepage hero banners
- Featured or recommended product grids
- Category showcase blocks
- Promotional call-to-action bands
- Testimonials or trust signals
- Newsletter signup strips

## Examples for this storefront

- `HeroSection` — headline, CTA, hero imagery
- `FeaturedProductsSection` — titled grid of `ProductCard` organisms
- `CategoryGridSection` — browse categories with images
- `PromoBannerSection` — sale or campaign messaging
- `NewsletterSection` — email capture form block

## Guidelines

- Compose primarily from `organisms/`, `molecules/`, and `atoms/`
- Accept section-level props or server-fetched data from parent pages
- Designed to drop into `src/app/**/page.tsx` with minimal wrapping
- One section ≈ one semantic `<section>` on the page

## Current files

_Empty — add page section components here._
