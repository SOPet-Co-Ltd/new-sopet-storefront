import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CartEmptyState } from './CartEmptyState';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('CartEmptyState', () => {
  it('renders empty-state copy and shop CTA', () => {
    render(<CartEmptyState />);

    expect(screen.getByTestId('cart-empty-state')).toBeInTheDocument();
    expect(screen.getByText('ตะกร้ายังว่างอยู่')).toBeInTheDocument();
    expect(screen.getByText(/มาเลือกของให้น้องๆ กันเถอะเพิ่มยา อาหาร/)).toBeInTheDocument();
    expect(screen.getByText(/หรือของใช้ที่ต้องการลงตะกร้าได้เลย/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'เลือกซื้อสินค้า' });
    expect(link).toHaveAttribute('href', '/products');
  });
});
