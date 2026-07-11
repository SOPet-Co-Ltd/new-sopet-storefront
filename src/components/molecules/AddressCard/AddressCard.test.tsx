import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddressCard } from './AddressCard';
import { sampleSavedAddress, sampleSavedAddress2 } from '@/test/mocks/fixtures/checkout';

describe('AddressCard', () => {
  it('renders label, default badge, formatted contact, and address line for default address', () => {
    render(<AddressCard address={sampleSavedAddress} onSetDefault={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByTestId('address-card-label')).toHaveTextContent('บ้าน');
    expect(screen.getByTestId('address-default-badge')).toHaveTextContent('ที่อยู่หลัก');
    expect(screen.getByText('สมชาย ใจดี (081-234-5678)')).toBeInTheDocument();
    expect(
      screen.getByText('123 ถนนสุขุมวิท คลองตัน วัฒนา กรุงเทพมหานคร 10110'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('address-card-set-default-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('address-card-delete-button')).toBeInTheDocument();
  });

  it('renders set-default button for non-default address without badge', () => {
    render(<AddressCard address={sampleSavedAddress2} onSetDefault={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByTestId('address-card-label')).toHaveTextContent('ออฟฟิศ');
    expect(screen.queryByTestId('address-default-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('address-card-set-default-button')).toBeInTheDocument();
  });

  it('uses fallback label when address label is empty', () => {
    render(
      <AddressCard
        address={{ ...sampleSavedAddress2, label: null }}
        onSetDefault={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByTestId('address-card-label')).toHaveTextContent('ที่อยู่');
  });

  it('links edit to the address edit route', () => {
    render(<AddressCard address={sampleSavedAddress} onSetDefault={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByTestId('address-card-edit-link')).toHaveAttribute(
      'href',
      '/user/addresses/addr-1/edit',
    );
  });

  it('disables both action buttons while loading', () => {
    render(
      <AddressCard
        address={sampleSavedAddress2}
        isActionLoading
        onSetDefault={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByTestId('address-card-set-default-button')).toBeDisabled();
    expect(screen.getByTestId('address-card-delete-button')).toBeDisabled();
  });

  it('invokes delete and set-default callbacks', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard address={sampleSavedAddress2} onSetDefault={onSetDefault} onDelete={onDelete} />,
    );

    await user.click(screen.getByTestId('address-card-delete-button'));
    await user.click(screen.getByTestId('address-card-set-default-button'));

    expect(onDelete).toHaveBeenCalledWith('addr-2');
    expect(onSetDefault).toHaveBeenCalledWith('addr-2');
  });
});
