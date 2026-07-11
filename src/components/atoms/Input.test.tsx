import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders label and required marker with legacy field height', () => {
    render(<Input title="Phone" isRequired size="md" placeholder="Enter phone" />);

    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Enter phone');
    expect(input).toHaveClass('h-10');
    expect(input).toHaveClass('text-sop-base-black');
  });

  it('applies error state classes and error description color', () => {
    render(<Input state="error" description="Invalid value" placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveClass('border-sop-system-error-400');

    const description = screen.getByText('Invalid value');
    expect(description).toHaveClass('text-sop-system-error-400');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    render(<Input type="password" placeholder="Password" />);

    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('supports legacy descriptionText prop', () => {
    render(<Input withDescription descriptionText="Helper text" placeholder="Field" />);

    expect(screen.getByText('Helper text')).toHaveClass('text-sop-neutral-gray-400');
  });
});
