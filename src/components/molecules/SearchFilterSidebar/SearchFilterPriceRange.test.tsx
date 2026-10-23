import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  parsePriceInput,
  PRICE_RANGE_INVALID_MESSAGE,
  SEARCH_FILTER_PRICE_MIN,
  SearchFilterPriceRange,
} from './SearchFilterPriceRange';

describe('parsePriceInput', () => {
  it('clamps a leading minus to 0 instead of stripping to a positive digit', () => {
    expect(parsePriceInput('-1')).toBe(SEARCH_FILTER_PRICE_MIN);
    expect(parsePriceInput('-')).toBe(SEARCH_FILTER_PRICE_MIN);
    expect(parsePriceInput(' -50 ')).toBe(SEARCH_FILTER_PRICE_MIN);
  });

  it('parses non-negative digit strings', () => {
    expect(parsePriceInput('100')).toBe(100);
    expect(parsePriceInput('1,000')).toBe(1000);
    expect(parsePriceInput('')).toBeNull();
  });
});

describe('SearchFilterPriceRange', () => {
  it('shows an invalid alert when min is greater than max', () => {
    render(
      <SearchFilterPriceRange
        minValue={2000}
        maxValue={1000}
        onMinChange={() => undefined}
        onMaxChange={() => undefined}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(PRICE_RANGE_INVALID_MESSAGE);
    expect(screen.getByPlaceholderText('ราคาต่ำสุด')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByPlaceholderText('ราคาสูงสุด')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hides the invalid alert when the range is ordered', () => {
    render(
      <SearchFilterPriceRange
        minValue={1000}
        maxValue={2000}
        onMinChange={() => undefined}
        onMaxChange={() => undefined}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
