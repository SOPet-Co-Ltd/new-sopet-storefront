import { NextResponse } from 'next/server';

import { POLICY_PATHS, REGULATORY_PATHS } from '@/lib/seo/constants';
import { fetchApprovedCategories } from '@/lib/seo/fetch';
import { getSiteConfig } from '@/lib/seo/metadata';

export const revalidate = 86400;

async function buildLlmsTxtContent(): Promise<string> {
  const { baseUrl, siteName } = getSiteConfig();

  const categories = await fetchApprovedCategories();
  const categoryLines =
    categories && categories.length > 0
      ? categories
          .map((category) => `- ${category.name}: ${baseUrl}/categories/${category.slug}`)
          .join('\n')
      : '';

  const policyLines = POLICY_PATHS.map(
    (policy) => `- ${policy.title}: ${baseUrl}/policy/${policy.pathSegment}`,
  ).join('\n');

  const regulatoryLines = REGULATORY_PATHS.map(
    (page) => `- ${page.title}: ${baseUrl}${page.path}`,
  ).join('\n');

  return `# ${siteName}

> ${siteName} is Thailand's pet pharmacy marketplace connecting pet owners with approved veterinary hospitals and pet pharmacies.

> ${siteName} helps pet owners compare prices, find discounts, and order pet medicine and supplies from verified sellers across Thailand.

## Key URLs

- Home: ${baseUrl}/
${categoryLines}

## Policies

${policyLines}

## Trust and security

${regulatoryLines}

## URL patterns

- Product detail: ${baseUrl}/product/{uuid}
- Category listing: ${baseUrl}/categories/{slug}
- Seller storefront: ${baseUrl}/sellers/{slug}
- Policy pages: ${baseUrl}/policy/{slug}

## Notes

- Search, checkout, account, and order-tracking pages are not intended for indexing.
- Product URLs use stable UUID identifiers.
- Each product page includes that product's customer rating and reviews in structured data.
`;
}

export async function GET(): Promise<NextResponse> {
  const body = await buildLlmsTxtContent();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
