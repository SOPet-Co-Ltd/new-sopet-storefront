import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartItemRow } from '@/components/organisms/CartItemRow/CartItemRow';
import { sampleCartItem } from '@/test/mocks/fixtures/cart';

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    return <img alt={props.alt} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderRow(
  overrides: {
    quantity?: number;
    disabled?: boolean;
  } = {},
) {
  const onUpdateQuantity = vi.fn().mockResolvedValue(undefined);
  const onRemove = vi.fn().mockResolvedValue(undefined);
  const item = {
    ...sampleCartItem,
    quantity: overrides.quantity ?? sampleCartItem.quantity,
  };

  render(
    <CartItemRow
      item={item}
      disabled={overrides.disabled}
      selected
      onToggleSelect={vi.fn()}
      onUpdateQuantity={onUpdateQuantity}
      onChangeVariant={vi.fn().mockResolvedValue(undefined)}
      onRemove={onRemove}
    />,
  );

  return { onUpdateQuantity, onRemove, item };
}

describe('CartItemRow quantity controls', () => {
  it('allows decrement at quantity 1 and requests quantity 0', async () => {
    const user = userEvent.setup();
    const { onUpdateQuantity } = renderRow({ quantity: 1 });

    const decrement = screen.getByRole('button', { name: 'ลดจำนวน' });
    expect(decrement).toBeEnabled();

    await user.click(decrement);

    expect(onUpdateQuantity).toHaveBeenCalledWith(sampleCartItem.id, 0);
  });

  it('decrements normally when quantity is greater than 1', async () => {
    const user = userEvent.setup();
    const { onUpdateQuantity } = renderRow({ quantity: 3 });

    await user.click(screen.getByRole('button', { name: 'ลดจำนวน' }));

    expect(onUpdateQuantity).toHaveBeenCalledWith(sampleCartItem.id, 2);
  });

  it('disables decrement when the row is disabled', () => {
    renderRow({ quantity: 1, disabled: true });

    expect(screen.getByRole('button', { name: 'ลดจำนวน' })).toBeDisabled();
  });

  it('accumulates rapid increment clicks to the final qty (SF-CART-020)', async () => {
    const user = userEvent.setup();
    const { onUpdateQuantity } = renderRow({ quantity: 1 });

    const increment = screen.getByRole('button', { name: 'เพิ่มจำนวน' });
    await user.click(increment);
    await user.click(increment);
    await user.click(increment);

    expect(onUpdateQuantity).toHaveBeenCalledTimes(3);
    expect(onUpdateQuantity).toHaveBeenNthCalledWith(1, sampleCartItem.id, 2);
    expect(onUpdateQuantity).toHaveBeenNthCalledWith(2, sampleCartItem.id, 3);
    expect(onUpdateQuantity).toHaveBeenNthCalledWith(3, sampleCartItem.id, 4);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('formats unit price with two decimal places', () => {
    renderRow();

    expect(screen.getByText('฿890.00')).toBeInTheDocument();
  });
});
