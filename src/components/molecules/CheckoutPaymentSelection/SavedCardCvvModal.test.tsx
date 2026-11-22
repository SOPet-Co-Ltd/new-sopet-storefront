import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SavedCardCvvModal } from './SavedCardCvvModal';

describe('SavedCardCvvModal', () => {
  it('keeps confirm disabled until CVV length is valid and clears on cancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <SavedCardCvvModal
        open
        brand="visa"
        lastFour="4417"
        amountLabel="฿907.00"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText('ยืนยันรหัส CVV')).toBeInTheDocument();
    expect(screen.getByText(/Visa •••• 4417/i)).toBeInTheDocument();
    expect(screen.getByText(/฿907.00/)).toBeInTheDocument();

    const confirm = screen.getByTestId('saved-card-cvv-modal-confirm');
    expect(confirm).toBeDisabled();

    await user.type(screen.getByTestId('saved-card-cvv-modal-input'), '12');
    expect(confirm).toBeDisabled();

    await user.type(screen.getByTestId('saved-card-cvv-modal-input'), '3');
    expect(confirm).toBeEnabled();

    await user.click(screen.getByTestId('saved-card-cvv-modal-cancel'));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms with the entered CVV', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <SavedCardCvvModal
        open
        brand="visa"
        lastFour="4417"
        amountLabel="฿907.00"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.type(screen.getByTestId('saved-card-cvv-modal-input'), '456');
    await user.click(screen.getByTestId('saved-card-cvv-modal-confirm'));

    expect(onConfirm).toHaveBeenCalledWith('456');
  });
});
