import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import ProductDetailsSeller from './ProductDetailsSeller';

vi.mock('sonner', () => ({
  toast: {
    message: vi.fn(),
  },
}));

describe('ProductDetailsSeller', () => {
  const mockStore = {
    id: 'store-1',
    name: 'Sopet Shop',
    slug: 'sopet-shop',
    logoUrl: 'https://example.com/logo.png',
    bannerUrl: null,
    description: 'Best pet shop',
  };

  it('renders null when store is null or undefined', () => {
    const { container } = render(<ProductDetailsSeller store={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders store name and recommended badge', () => {
    render(<ProductDetailsSeller store={mockStore} />);

    expect(screen.getByText('Sopet Shop')).toBeInTheDocument();
    expect(screen.getByText('ร้านค้าแนะนำ')).toBeInTheDocument();
  });

  it('renders store logo image when logoUrl is provided', () => {
    render(<ProductDetailsSeller store={mockStore} />);

    const img = screen.getByAltText('Sopet Shop');
    expect(img).toBeInTheDocument();
  });

  it('renders fallback SOPetLogo when logoUrl is null', () => {
    render(<ProductDetailsSeller store={{ ...mockStore, logoUrl: null }} />);

    expect(screen.queryByAltText('Sopet Shop')).not.toBeInTheDocument();
    expect(screen.getByText('Sopet Shop')).toBeInTheDocument();
  });

  it('renders chat button and shows toast message when clicked', async () => {
    const user = userEvent.setup();
    render(<ProductDetailsSeller store={mockStore} />);

    const chatButton = screen.getByTestId('seller-chat-button');
    expect(chatButton).toHaveTextContent('แชทพูดคุย');

    await user.click(chatButton);
    expect(toast.message).toHaveBeenCalledWith('ฟีเจอร์แชทพูดคุยจะเปิดใช้งานเร็วๆ นี้');
  });

  it('renders store link button navigating to store slug', () => {
    render(<ProductDetailsSeller store={mockStore} />);

    const storeLink = screen.getByTestId('seller-store-link');
    expect(storeLink).toHaveTextContent('ไปยังร้านค้า');
    expect(storeLink).toHaveAttribute('href', '/sellers/sopet-shop');
  });
});
