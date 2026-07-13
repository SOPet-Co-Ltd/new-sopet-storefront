import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders title and opens the calendar panel', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePicker
        title="วันเกิด"
        value=""
        onChange={handleChange}
        min="1990-01-01"
        max="1990-12-31"
      />,
    );

    expect(screen.getByText('วันเกิด')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'วันเกิด' }));

    expect(screen.getByRole('dialog', { name: 'วันเกิด' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'ปฏิทิน' })).toBeInTheDocument();
  });

  it('selects a date and closes the panel', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePicker
        value="1990-05-01"
        onChange={handleChange}
        min="1990-01-01"
        max="1990-12-31"
        data-testid="birthday-picker"
      />,
    );

    await user.click(screen.getByTestId('birthday-picker-trigger'));
    await user.click(screen.getByRole('gridcell', { name: '15' }));

    expect(handleChange).toHaveBeenCalledWith('1990-05-15');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows validation description in error state', () => {
    render(
      <DatePicker value="" onChange={vi.fn()} state="error" description="กรุณาเลือกวันเกิด" />,
    );

    expect(screen.getByText('กรุณาเลือกวันเกิด')).toHaveClass('text-sop-system-error-400');
  });
});
