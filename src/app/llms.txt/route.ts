import { NextResponse } from 'next/server';

import { POLICY_PATHS } from '@/lib/seo/constants';
import { getSiteConfig } from '@/lib/seo/metadata';

export const revalidate = 86400;

const LLMS_CATEGORY_EXAMPLES = [
  { slug: 'dog-food', label: 'Dog Food' },
  { slug: 'cat-food', label: 'Cat Food' },
  { slug: 'pet-supplies', label: 'Pet Supplies' },
] as const;

function buildLlmsTxtContent(): string {
  const { baseUrl, siteName } = getSiteConfig();

  const categoryLines = LLMS_CATEGORY_EXAMPLES.map(
    (category) => `- ${category.label}: ${baseUrl}/categories/${category.slug}`,
  ).join('\n');

  const policyLines = POLICY_PATHS.map(
    (policy) => `- ${policy.title}: ${baseUrl}/policy/${policy.pathSegment}`,
  ).join('\n');

  return `# ${siteName}

> ${siteName} is Thailand's pet pharmacy marketplace connecting pet owners with approved veterinary hospitals and pet pharmacies.

> ${siteName} helps pet owners compare prices, find discounts, and order pet medicine and supplies from verified sellers across Thailand.

## Key URLs

- Home: ${baseUrl}/
${categoryLines}

## Policies

${policyLines}

## URL patterns

- Product detail: ${baseUrl}/product/{uuid}
- Category listing: ${baseUrl}/categories/{slug}
- Seller storefront: ${baseUrl}/sellers/{slug}
- Policy pages: ${baseUrl}/policy/{slug}

## Notes

- Search, checkout, account, and order-tracking pages are not intended for indexing.
- Product URLs use stable UUID identifiers.
`;
}

export async function GET(): Promise<NextResponse> {
  const body = buildLlmsTxtContent();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
