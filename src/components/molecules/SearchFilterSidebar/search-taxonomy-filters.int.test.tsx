import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchFilterSidebar } from '@/components/molecules/SearchFilterSidebar/SearchFilterSidebar';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleApprovedTags } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';

const push = vi.fn();
let pathname = '/categories/dog-food';
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

const createWrapper = createApolloTestWrapper;

function getPushedQuery(): URLSearchParams {
  const pushedUrl = push.mock.calls.at(-1)?.[0] as string;
  const queryIndex = pushedUrl.indexOf('?');
  return new URLSearchParams(queryIndex >= 0 ? pushedUrl.slice(queryIndex + 1) : '');
}

beforeEach(() => {
  pathname = '/categories/dog-food';
  searchParams = new URLSearchParams();
  push.mockClear();
});

describe('SearchFilterSidebar taxonomy filters', () => {
  it('updates URL on current pathname when pet type is toggled (AC-019)', async () => {
    const user = userEvent.setup();

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

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
  });

  it('lazy-loads approved tags when tag section is expanded (AC-020)', async () => {
    const user = userEvent.setup();
    let approvedTagsRequested = false;

    server.use(
      graphql.query('ApprovedTags', () => {
        approvedTagsRequested = true;
        return HttpResponse.json({
          data: { approvedTags: sampleApprovedTags },
        });
      }),
    );

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

    const tagSectionToggle = screen.getByRole('button', { name: /แท็ก/ });
    await user.click(tagSectionToggle);
    await user.click(tagSectionToggle);

    await waitFor(() => {
      expect(approvedTagsRequested).toBe(true);
    });

    expect(await screen.findByRole('checkbox', { name: 'Grain Free' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Organic' })).toBeInTheDocument();
  });

  it('shows empty copy when approved tags list is empty (AC-020)', async () => {
    server.use(
      graphql.query('ApprovedTags', () => {
        return HttpResponse.json({
          data: { approvedTags: [] },
        });
      }),
    );

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

    expect(await screen.findByText('ไม่มีแท็ก')).toBeInTheDocument();
  });

  it('shows error copy when approved tags query fails (AC-020)', async () => {
    server.use(
      graphql.query('ApprovedTags', () => {
        return HttpResponse.json({
          errors: [{ message: 'Approved tags unavailable' }],
        });
      }),
    );

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

    expect(await screen.findByText('โหลดแท็กไม่สำเร็จ')).toBeInTheDocument();
  });

  it('sets single tag id in URL and replaces prior selection (AC-021)', async () => {
    const user = userEvent.setup();

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

    const firstTag = await screen.findByRole('checkbox', { name: 'Grain Free' });
    await user.click(firstTag);

    await waitFor(() => {
      expect(getPushedQuery().get('tag')).toBe('tag-grain-free-id');
    });

    const secondTag = screen.getByRole('checkbox', { name: 'Organic' });
    await user.click(secondTag);

    await waitFor(() => {
      const params = getPushedQuery();
      expect(params.get('tag')).toBe('tag-organic-id');
      expect(params.getAll('tag')).toHaveLength(1);
    });

    await user.click(secondTag);

    await waitFor(() => {
      expect(getPushedQuery().has('tag')).toBe(false);
    });
  });

  it('preserves petType, brand, and tag when clearing price only (AC-022)', async () => {
    const user = userEvent.setup();

    searchParams = new URLSearchParams({
      petType: 'pet-dog',
      brand: 'brand-1',
      tag: 'tag-grain-free-id',
      minPrice: '100',
      maxPrice: '500',
      page: '2',
    });

    render(<SearchFilterSidebar />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: 'ล้างค่า' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });

    const params = getPushedQuery();
    expect(params.get('petType')).toBe('pet-dog');
    expect(params.get('brand')).toBe('brand-1');
    expect(params.get('tag')).toBe('tag-grain-free-id');
    expect(params.has('minPrice')).toBe(false);
    expect(params.has('maxPrice')).toBe(false);
    expect(params.has('page')).toBe(false);
  });
});
