import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { toast } from 'sonner';

import { AppToaster } from './AppToaster';

describe('AppToaster', () => {
  afterEach(() => {
    toast.dismiss();
  });

  it.each([
    ['success', 'บันทึกสินค้าแล้ว', '/images/toast/check.svg'],
    ['warning', 'ปรับจำนวนสินค้าตามสต็อกที่มีแล้ว', '/images/toast/warning.svg'],
    ['error', 'เกิดข้อผิดพลาด', '/images/toast/error.svg'],
    ['info', 'ฟีเจอร์แชทพูดคุยจะเปิดใช้งานเร็วๆ นี้', '/images/toast/info.svg'],
  ] as const)(
    'renders a %s toast with the design-system icon and close button',
    async (type, title, iconSrc) => {
      render(<AppToaster />);

      toast[type](title, { description: 'description', duration: 10000 });

      const heading = await screen.findByText(title);
      const card = heading.closest('[data-sonner-toast]');

      expect(card).toHaveAttribute('data-type', type);
      expect(card).toHaveAttribute('data-styled', 'false');
      expect(screen.getByText('description')).toBeInTheDocument();
      expect(card?.querySelector('[data-icon] img')).toHaveAttribute('src', iconSrc);
      expect(screen.getByRole('button', { name: 'ปิด' })).toBeInTheDocument();
      expect(card?.querySelector('[data-close-button] img')).toHaveAttribute(
        'src',
        '/images/toast/close.svg',
      );
    },
  );

  it('offsets the previous toast in a visible stack', async () => {
    render(<AppToaster />);

    toast.success('บันทึกสินค้าแล้ว', { duration: 10000 });
    toast.error('เกิดข้อผิดพลาด', { duration: 10000 });

    await waitFor(() => {
      const cards = document.querySelectorAll('[data-sonner-toast][data-mounted="true"]');
      expect(cards).toHaveLength(2);
      for (const card of cards) {
        expect(card).toHaveAttribute('data-visible', 'true');
        expect(card).not.toHaveAttribute('data-expanded', 'true');
      }
    });

    const front = document.querySelector('[data-sonner-toast][data-front="true"]');
    const behind = document.querySelector('[data-sonner-toast][data-front="false"]');

    expect(front).toHaveTextContent('เกิดข้อผิดพลาด');
    expect(behind).toHaveTextContent('บันทึกสินค้าแล้ว');
    expect(behind).toHaveAttribute('data-index', '1');
    expect(behind?.style.getPropertyValue('--index')).toBe('1');
  });
});
