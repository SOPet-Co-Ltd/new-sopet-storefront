import { act, renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useSearchSuggestions } from '@/lib/hooks/useSearchSuggestions';
import { server } from '@/test/mocks/server';
import { sampleSearchSuggestionsPayload } from '@/test/mocks/fixtures/search';

const TEST_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

vi.mock('@/lib/session', () => ({
  getSessionId: () => TEST_SESSION_ID,
  ensureSessionId: () => TEST_SESSION_ID,
}));

describe('useSearchSuggestions', () => {
  it('does not fetch when query is shorter than 2 characters', async () => {
    const requestSpy = vi.fn();

    server.use(
      graphql.query('SearchSuggestions', () => {
        requestSpy();
        return HttpResponse.json({ data: { searchSuggestions: sampleSearchSuggestionsPayload } });
      }),
    );

    renderHook(() => useSearchSuggestions('r', true), {
      wrapper: createApolloTestWrapper(),
    });

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    });

    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('fetches suggestions after debounce when query length is at least 2', async () => {
    server.use(
      graphql.query('SearchSuggestions', ({ variables }) => {
        expect(variables).toMatchObject({
          query: 'ro',
          sessionId: TEST_SESSION_ID,
        });
        return HttpResponse.json({ data: { searchSuggestions: sampleSearchSuggestionsPayload } });
      }),
    );

    const { result } = renderHook(() => useSearchSuggestions('ro', true), {
      wrapper: createApolloTestWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.products[0]?.name).toBe('Royal Canin Cat Food');
      },
      { timeout: 3000 },
    );
  });
});
