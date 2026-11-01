import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SavedProductToast, showSavedProductToast } from './SavedProductToast';

vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('SavedProductToast', () => {
  beforeEach(() => {
    vi.mocked(toast.custom).mockClear();
    vi.mocked(toast.dismiss).mockClear();
  });

  it('shows a saved-product banner with a close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SavedProductToast onClose={onClose} />);

    expect(screen.getByText('บันทึกสินค้าแล้ว')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ปิด' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('opens the banner at the top right', () => {
    showSavedProductToast();

    expect(toast.custom).toHaveBeenCalledOnce();
    const [renderToast, options] = vi.mocked(toast.custom).mock.calls[0];
    expect(options).toMatchObject({
      id: 'saved-product',
      position: 'top-right',
      duration: 4000,
    });

    render(renderToast('saved-product'));
    expect(screen.getByText('บันทึกสินค้าแล้ว')).toBeInTheDocument();
  });
});
