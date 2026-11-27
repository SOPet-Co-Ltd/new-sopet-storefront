import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showAddedToCartToast, showSavedProductToast } from './SavedProductToast';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('SavedProductToast', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it('opens the saved-product toast at the top right', () => {
    showSavedProductToast();

    expect(toast.success).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('บันทึกสินค้าแล้ว', {
      id: 'saved-product',
      duration: 4000,
    });
  });

  it('opens the added-to-cart toast at the top right', () => {
    showAddedToCartToast();

    expect(toast.success).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('เพิ่มสินค้าลงตะกร้าแล้ว', {
      id: 'added-to-cart',
      duration: 4000,
    });
  });
});
