import { useQuery } from '@apollo/client/react';
import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { MeDocument } from '@/lib/graphql/generated/graphql';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from './mocks/server';

const SAMPLE_CUSTOMER = {
  id: 'cust-sample',
  phone: '0812345678',
  email: 'sample@example.com',
  fullName: 'Sample Customer',
};

function MeProbe() {
  const { data, loading } = useQuery(MeDocument);

  if (loading) {
    return <div role="status">Loading</div>;
  }

  const phone = data?.me?.customer?.phone ?? 'anonymous';

  return <div data-testid="me-phone">{phone}</div>;
}

describe('Vitest + RTL + MSW scaffold', () => {
  it('renders GraphQL data intercepted by MSW', async () => {
    server.use(
      graphql.query('Me', () => {
        return HttpResponse.json({
          data: {
            me: {
              customer: SAMPLE_CUSTOMER,
            },
          },
        });
      }),
    );

    const ApolloTestWrapper = createApolloTestWrapper();

    render(
      <ApolloTestWrapper>
        <MeProbe />
      </ApolloTestWrapper>,
    );

    expect(await screen.findByTestId('me-phone')).toHaveTextContent('0812345678');
  });
});
