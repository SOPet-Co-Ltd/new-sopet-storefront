import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from './errorMessages';
import {
  extractErrorCode,
  formatFallbackErrorMessage,
  getErrorMessage,
  getErrorMessageByCode,
} from './getErrorMessage';
import { ERROR_CODES } from './errorCodes';

function gqlError(code: string, message = code) {
  return new CombinedGraphQLErrors({
    errors: [new GraphQLError(message, { extensions: { code } })],
  });
}

describe('extractErrorCode', () => {
  it('reads CombinedGraphQLErrors extensions.code first', () => {
    expect(extractErrorCode(gqlError('INVALID_OTP', 'INVALID_OTP'))).toBe('INVALID_OTP');
  });

  it('reads .graphQLErrors and .errors arrays', () => {
    expect(
      extractErrorCode({
        graphQLErrors: [{ extensions: { code: 'FORBIDDEN' }, message: 'FORBIDDEN' }],
      }),
    ).toBe('FORBIDDEN');

    expect(
      extractErrorCode({
        errors: [{ extensions: { code: 'INSUFFICIENT_STOCK' }, message: 'INSUFFICIENT_STOCK' }],
      }),
    ).toBe('INSUFFICIENT_STOCK');
  });

  it('treats SCREAMING_SNAKE error.message as a code', () => {
    expect(extractErrorCode(new Error('ORDER_NOT_PAYABLE'))).toBe('ORDER_NOT_PAYABLE');
  });

  it('reads REST-shaped { error: { code } } envelopes', () => {
    expect(
      extractErrorCode({ error: { code: 'VALIDATION_ERROR', message: 'VALIDATION_ERROR' } }),
    ).toBe('VALIDATION_ERROR');
  });

  it('returns null for unknown / non-code messages', () => {
    expect(extractErrorCode(new Error('something went wrong'))).toBeNull();
    expect(extractErrorCode(null)).toBeNull();
  });
});

describe('getErrorMessage', () => {
  it('maps known codes to Thai catalog copy', () => {
    expect(getErrorMessage(gqlError('INVALID_OTP'))).toBe(ERROR_MESSAGES.INVALID_OTP);
    expect(getErrorMessage(gqlError('STORE_SUSPENDED'))).toBe(ERROR_MESSAGES.STORE_SUSPENDED);
  });

  it('appends error codes on fallback paths for support lookup', () => {
    expect(getErrorMessage(new Error('SOME_UNKNOWN_CODE_XYZ'))).toBe(
      formatFallbackErrorMessage(DEFAULT_ERROR_MESSAGE, 'SOME_UNKNOWN_CODE_XYZ'),
    );
    expect(getErrorMessage(gqlError('TOTALLY_UNKNOWN'))).toBe(
      formatFallbackErrorMessage(DEFAULT_ERROR_MESSAGE, 'TOTALLY_UNKNOWN'),
    );
  });

  it('uses UNKNOWN_ERROR when no code is present', () => {
    expect(getErrorMessage(new Error('oops'), 'ลองใหม่อีกครั้ง')).toBe(
      formatFallbackErrorMessage('ลองใหม่อีกครั้ง', ERROR_CODES.UNKNOWN_ERROR),
    );
    expect(getErrorMessage(undefined)).toBe(
      formatFallbackErrorMessage(DEFAULT_ERROR_MESSAGE, ERROR_CODES.UNKNOWN_ERROR),
    );
  });

  it('getErrorMessageByCode maps known codes and falls back otherwise', () => {
    expect(getErrorMessageByCode('REVIEW_WINDOW_EXPIRED')).toBe(
      ERROR_MESSAGES.REVIEW_WINDOW_EXPIRED,
    );
    expect(getErrorMessageByCode('NOPE_NOT_REAL', 'fallback')).toBe(
      formatFallbackErrorMessage('fallback', 'NOPE_NOT_REAL'),
    );
  });
});
