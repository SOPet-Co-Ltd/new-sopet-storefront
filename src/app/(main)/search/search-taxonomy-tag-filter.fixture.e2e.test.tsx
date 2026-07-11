import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { handlers, sampleApprovedTags } from '@/test/mocks/handlers';
import { sampleProductCard } from '@/test/mocks/fixtures/catalog';

const APPROVED_TAGS_QUERY = gql`
  query ApprovedTags {
    approvedTags {
      id
      name
      slug
    }
  }
`;

type ApprovedTagsQueryData = {
  approvedTags: Array<{ id: string; name: string; slug: string }>;
};

function useApprovedTagsProbe() {
  return useQuery<ApprovedTagsQueryData>(APPROVED_TAGS_QUERY, {
    fetchPolicy: 'network-only',
  });
}

const push = vi.fn((url: string) => {
  const queryIndex = url.indexOf('?');
  searchParams = new URLSearchParams(queryIndex >= 0 ? url.slice(queryIndex + 1) : '');
});
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/search',
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

beforeEach(() => {
  searchParams = new URLSearchParams({ q: 'อาหารแมว' });
  push.mockClear();
});

const createWrapper = createApolloTestWrapper;

function getPushedQuery(): URLSearchParams {
  const pushedUrl = push.mock.calls.at(-1)?.[0] as string;
  const queryIndex = pushedUrl.indexOf('?');
  return new URLSearchParams(queryIndex >= 0 ? pushedUrl.slice(queryIndex + 1) : '');
}

describe('Search taxonomy tag filter fixture-e2e harness', () => {
  it('registers ApprovedTags handler in default MSW handlers', () => {
    expect(
      handlers.some(
        (handler) =>
          'info' in handler &&
          typeof handler.info === 'object' &&
          handler.info !== null &&
          'operationName' in handler.info &&
          handler.info.operationName === 'ApprovedTags',
      ),
    ).toBe(true);
  });

  it('returns approved tags from MSW without unhandled GraphQL errors', async () => {
    const { result } = renderHook(() => useApprovedTagsProbe(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.approvedTags).toHaveLength(sampleApprovedTags.length);
    });

    expect(
      result.current.data?.approvedTags?.map(({ id, name, slug }) => ({ id, name, slug })),
    ).toEqual(sampleApprovedTags.map(({ id, name, slug }) => ({ id, name, slug })));
    expect(result.current.error).toBeUndefined();
  });

  it('loads SearchResultsPage in the fixture-e2e harness', async () => {
    render(<SearchResultsPage initialProducts={[sampleProductCard]} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(screen.getByText(sampleProductCard.name)).toBeInTheDocument();
  });

  it('selects a tag from the sidebar and updates URL with single tag id (AC-020, AC-021)', async () => {
    const user = userEvent.setup();

    render(<SearchResultsPage initialProducts={[sampleProductCard]} />, {
      wrapper: createWrapper(),
    });

    const tagCheckbox = await screen.findByRole('checkbox', { name: 'Grain Free' });
    await user.click(tagCheckbox);

    await waitFor(() => {
      expect(getPushedQuery().get('tag')).toBe('tag-grain-free-id');
    });
  });

  it('preserves tag when price section ล้างค่า is clicked (AC-022)', async () => {
    const user = userEvent.setup();

    searchParams = new URLSearchParams({
      q: 'อาหารแมว',
      petType: 'pet-cat',
      brand: 'brand-1',
      tag: 'tag-grain-free-id',
      minPrice: '100',
      maxPrice: '500',
    });

    render(<SearchResultsPage initialProducts={[sampleProductCard]} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole('button', { name: 'ล้างค่า' }));

    await waitFor(() => {
      const params = getPushedQuery();
      expect(params.get('tag')).toBe('tag-grain-free-id');
      expect(params.get('petType')).toBe('pet-cat');
      expect(params.get('brand')).toBe('brand-1');
      expect(params.has('minPrice')).toBe(false);
      expect(params.has('maxPrice')).toBe(false);
    });
  });
});
