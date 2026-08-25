import { describe, expect, it } from 'vitest';
import { harvestAuthTokens, redactAuthTokens } from './bff-upstream';

describe('harvestAuthTokens', () => {
  it('harvests nested tokens payload', () => {
    expect(
      harvestAuthTokens({
        verifyCustomerOtp: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
          customer: { id: '1' },
        },
      }),
    ).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('harvests refreshToken mutation shape', () => {
    expect(
      harvestAuthTokens({
        refreshToken: { accessToken: 'a2', refreshToken: 'r2' },
      }),
    ).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
  });
});

describe('redactAuthTokens', () => {
  it('nulls JWT string fields', () => {
    expect(
      redactAuthTokens({
        verifyCustomerOtp: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
          customer: { id: '1' },
        },
      }),
    ).toEqual({
      verifyCustomerOtp: {
        tokens: { accessToken: null, refreshToken: null },
        customer: { id: '1' },
      },
    });
  });
});
