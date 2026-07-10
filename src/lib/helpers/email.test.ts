import { describe, expect, it } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects empty or malformed values', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('  ')).toBe(false);
  });
});
