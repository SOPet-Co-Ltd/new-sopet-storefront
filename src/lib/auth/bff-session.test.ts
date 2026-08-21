import { describe, expect, it } from 'vitest';
import { injectSessionIdIntoGraphqlBody } from './bff-session';

describe('injectSessionIdIntoGraphqlBody', () => {
  const sessionId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

  it('overwrites top-level sessionId variables', () => {
    const body = JSON.stringify({
      query: 'query Cart($sessionId: String) { cart(sessionId: $sessionId) { id } }',
      variables: { sessionId: 'client-spoofed' },
    });

    expect(JSON.parse(injectSessionIdIntoGraphqlBody(body, sessionId))).toEqual({
      query: expect.any(String),
      variables: { sessionId },
    });
  });

  it('overwrites input.sessionId variables', () => {
    const body = JSON.stringify({
      query:
        'mutation Verify($input: VerifyCustomerOtpInput!) { verifyCustomerOtp(input: $input) { pendingDeletion } }',
      variables: { input: { phone: '0812345678', code: '123456', sessionId: 'spoof' } },
    });

    expect(JSON.parse(injectSessionIdIntoGraphqlBody(body, sessionId)).variables.input).toEqual({
      phone: '0812345678',
      code: '123456',
      sessionId,
    });
  });

  it('leaves bodies without sessionId untouched', () => {
    const body = JSON.stringify({ query: '{ me { id } }', variables: {} });
    expect(injectSessionIdIntoGraphqlBody(body, sessionId)).toBe(body);
  });
});
