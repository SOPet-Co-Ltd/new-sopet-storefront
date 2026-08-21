import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { UnreadBadge } from '@/components/molecules/UnreadBadge';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

describe('UnreadBadge', () => {
  it('renders count with design-system error colors (not legacy bg-danger)', async () => {
    server.use(
      graphql.query('UnreadCount', () =>
        HttpResponse.json({ data: { unreadNotificationsCount: 23 } }),
      ),
    );

    render(<UnreadBadge />, { wrapper: createApolloTestWrapper() });

    const badge = await screen.findByTestId('navbar-unread-badge');
    expect(badge).toHaveTextContent('23');
    expect(badge).toHaveClass('bg-sop-system-error-400', 'text-sop-base-white');
    expect(badge.className).not.toMatch(/bg-danger/);
  });

  it('returns null when unread count is zero', async () => {
    server.use(
      graphql.query('UnreadCount', () =>
        HttpResponse.json({ data: { unreadNotificationsCount: 0 } }),
      ),
    );

    const { container } = render(<UnreadBadge />, { wrapper: createApolloTestWrapper() });

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
