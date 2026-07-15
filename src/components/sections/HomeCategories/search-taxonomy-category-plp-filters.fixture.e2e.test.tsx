import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryPLP } from '@/components/sections/ProductListing';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleCategories, samplePetTypes, sampleProductCard } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

const SAMPLE_HOME_CATEGORIES = [
  {
    __typename: 'CategoryType' as const,
    id: 'cat-1',
    name: 'อาหารสุนัข',
    slug: 'dog-food',
    imageUrl: 'https://example.com/dog-food-category.jpg',
  },
];

const push = vi.fn();
let pathname = '/';
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

function getPushedQuery(): URLSearchParams {
  const pushedUrl = push.mock.calls.at(-1)?.[0] as string;
  const queryIndex = pushedUrl.indexOf('?');
  return new URLSearchParams(queryIndex >= 0 ? pushedUrl.slice(queryIndex + 1) : '');
}

async function expandSection(user: ReturnType<typeof userEvent.setup>, name: RegExp | string) {
  await user.click(screen.getByRole('button', { name }));
}

beforeEach(() => {
  pathname = '/';
  searchParams = new URLSearchParams();
  push.mockClear();
});

describe('Category PLP filter journey', () => {
  it('navigates from home categories to PLP with sidebar and toggles pet type filter (AC-018, AC-019)', async () => {
    const user = userEvent.setup();
    let latestProductsVariables: Record<string, unknown> | undefined;

    server.use(
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
      ),
      graphql.query('ApprovedPetTypes', () =>
        HttpResponse.json({ data: { approvedPetTypes: samplePetTypes } }),
      ),
      graphql.query('Products', ({ variables }) => {
        latestProductsVariables = variables;
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    const { rerender } = render(<HomeCategories initialCategories={SAMPLE_HOME_CATEGORIES} />, {
      wrapper: createWrapper(),
    });

    const categoryLink = screen.getByRole('link', { name: 'ดูหมวดหมู่ อาหารสุนัข' });
    fireEvent.mouseEnter(categoryLink);

    pathname = '/categories/dog-food';
    rerender(
      <CategoryPLP
        categorySlug="dog-food"
        categoryFilter="Dog Food"
        initialProducts={[sampleProductCard]}
      />,
    );

    expect(await screen.findByTestId('search-filter-sidebar')).toBeInTheDocument();
    expect(await screen.findByTestId('product-listing')).toBeInTheDocument();
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();

    const sidebar = screen.getByTestId('search-filter-sidebar');
    const listing = screen.getByTestId('product-listing');
    expect(
      sidebar.compareDocumentPosition(listing) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await expandSection(user, /ประเภทสัตว์เลี้ยง/);
    const petTypeCheckbox = await screen.findByRole('checkbox', { name: 'สุนัข' });
    await user.click(petTypeCheckbox);

    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });

    const pushedUrl = push.mock.calls.at(-1)?.[0] as string;
    expect(pushedUrl.startsWith('/categories/dog-food?')).toBe(true);

    const params = getPushedQuery();
    expect(params.get('petType')).toBe('pet-dog');
    expect(params.has('page')).toBe(false);

    searchParams = new URLSearchParams({ petType: 'pet-dog' });
    rerender(
      <CategoryPLP
        categorySlug="dog-food"
        categoryFilter="Dog Food"
        initialProducts={[sampleProductCard]}
      />,
    );

    await waitFor(() => {
      expect(latestProductsVariables).toMatchObject({
        category: 'Dog Food',
        petTypeIds: ['pet-dog'],
      });
    });
  });
});
