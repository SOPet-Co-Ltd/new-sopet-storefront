import { graphql, HttpResponse } from 'msw';

/**
 * Default MSW handlers for Vitest. Phase-specific handlers are added per test
 * via `server.use()` or extended in feature-scoped handler modules.
 */
export const handlers = [
  graphql.query('Me', () => {
    return HttpResponse.json({
      data: {
        me: {
          customer: null,
        },
      },
    });
  }),
];
