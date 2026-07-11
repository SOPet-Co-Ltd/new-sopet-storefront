import { describe, expect, it } from 'vitest';
import {
  formatCustomerDateOfBirth,
  toDateInputValue,
  validateCustomerDateOfBirth,
} from './dateOfBirth';

describe('dateOfBirth helpers', () => {
  it('normalizes API date values for date inputs', () => {
    expect(toDateInputValue('1990-05-15')).toBe('1990-05-15');
    expect(toDateInputValue('1990-05-15T00:00:00.000Z')).toBe('1990-05-15');
  });

  it('formats customer date of birth in Thai locale', () => {
    expect(formatCustomerDateOfBirth('1990-05-15')).toMatch(/15/);
  });

  it('rejects empty and future dates', () => {
    expect(validateCustomerDateOfBirth('')).toBe('กรุณาเลือกวันเกิด');

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const future = tomorrow.toISOString().slice(0, 10);
    expect(validateCustomerDateOfBirth(future)).toBe('วันเกิดต้องไม่เป็นวันในอนาคต');
  });
});
