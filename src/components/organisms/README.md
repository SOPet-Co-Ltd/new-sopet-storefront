# Organisms

**Atomic design level:** Organisms

Complex, relatively standalone UI sections built from molecules and atoms. Organisms represent recognizable storefront features and may wire up client-side behavior.

## What belongs here

- Site header and navigation
- Footer with links and newsletter signup
- Product cards and list items
- Cart line items and mini-cart
- Product image gallery
- Filter and sort panels
- Account menu dropdowns

## Examples for this storefront

- `SiteHeader` — logo, nav links, search, cart icon
- `ProductCard` — image, title, price, add-to-cart
- `CartDrawer` — slide-over cart with line items
- `ProductGallery` — main image + thumbnails
- `CategoryNav` — browse-by-category links

## Guidelines

- Compose from `molecules/` and `atoms/`
- May use hooks, context, or client components for interactivity
- Data can be passed in via props; fetching usually happens at the page/section level

## Current files

*Empty — add organism components here.*
