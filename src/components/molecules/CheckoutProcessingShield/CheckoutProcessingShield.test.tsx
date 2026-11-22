import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CheckoutProcessingShield } from './CheckoutProcessingShield';

describe('CheckoutProcessingShield', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.querySelector('header[aria-label="Site header"]')?.remove();
  });

  it('covers the viewport and announces that payment is processing', () => {
    render(<CheckoutProcessingShield />);

    const shield = screen.getByTestId('checkout-processing-shield');
    expect(shield).toHaveAttribute('role', 'status');
    expect(shield).toHaveAttribute('aria-busy', 'true');
    expect(shield.className).toMatch(/fixed/);
    expect(shield.className).toMatch(/inset-0/);
    expect(shield.className).toMatch(/z-\[45\]/);
    expect(shield.className).toMatch(/cursor-wait/);
    expect(screen.getByText('กำลังดำเนินการชำระเงิน')).toBeInTheDocument();
  });

  it('blocks keyboard input and the site header until unmount', () => {
    const header = document.createElement('header');
    header.setAttribute('aria-label', 'Site header');
    const link = document.createElement('a');
    link.href = '/cart';
    link.textContent = 'cart';
    header.appendChild(link);
    document.body.appendChild(header);

    const { unmount } = render(<CheckoutProcessingShield />);

    expect(header.inert).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    expect(document.dispatchEvent(event)).toBe(false);

    unmount();

    expect(header.inert).toBe(false);
  });

  it('keeps an open payment dialog focused and typable', () => {
    render(
      <>
        <div role="dialog">
          <input aria-label="รหัส CVV" autoFocus />
        </div>
        <CheckoutProcessingShield />
      </>,
    );

    const input = screen.getByRole('textbox', { name: 'รหัส CVV' });
    expect(input).toHaveFocus();

    const event = new KeyboardEvent('keydown', { key: '1', bubbles: true, cancelable: true });
    expect(input.dispatchEvent(event)).toBe(true);
  });
});
