import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders dialog with aria-modal and configurable width', () => {
    render(
      <Modal width={400} aria-labelledby="modal-title">
        <h3 id="modal-title">Title</h3>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal onClose={onClose}>
        <button type="button">Inside</button>
      </Modal>,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('traps focus within modal on Tab', async () => {
    const user = userEvent.setup();

    render(
      <Modal onClose={() => undefined}>
        <button type="button">First</button>
        <button type="button">Second</button>
      </Modal>,
    );

    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });

    await waitFor(() => {
      expect(document.activeElement).toBe(first);
    });

    await user.tab();
    expect(document.activeElement).toBe(second);

    await user.tab();
    expect(document.activeElement).toBe(first);
  });

  it('applies contentClassName to the children wrapper', () => {
    render(
      <Modal contentClassName="px-0 overflow-visible">
        <div data-testid="modal-content">Content</div>
      </Modal>,
    );

    const content = screen.getByTestId('modal-content');
    expect(content.parentElement).toHaveClass('px-0', 'overflow-visible');
  });
});
