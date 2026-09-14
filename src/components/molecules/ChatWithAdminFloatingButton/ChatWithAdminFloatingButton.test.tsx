import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatWithAdminFloatingButton } from './ChatWithAdminFloatingButton';

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('ChatWithAdminFloatingButton', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('renders floating button on non-login pages', () => {
    mockUsePathname.mockReturnValue('/');
    render(<ChatWithAdminFloatingButton />);

    expect(screen.getByRole('region', { name: 'ติดต่อแอดมินผ่าน LINE' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'แสดงรายละเอียด LINE สำหรับติดต่อแอดมิน' }),
    ).toBeInTheDocument();
  });

  it('renders on regular pages like /cart or /categories/dog-food', () => {
    mockUsePathname.mockReturnValue('/cart');
    const { unmount } = render(<ChatWithAdminFloatingButton />);
    expect(screen.getByRole('region', { name: 'ติดต่อแอดมินผ่าน LINE' })).toBeInTheDocument();
    unmount();

    mockUsePathname.mockReturnValue('/categories/dog-food');
    render(<ChatWithAdminFloatingButton />);
    expect(screen.getByRole('region', { name: 'ติดต่อแอดมินผ่าน LINE' })).toBeInTheDocument();
  });

  it('does not render on /login page', () => {
    mockUsePathname.mockReturnValue('/login');
    const { container } = render(<ChatWithAdminFloatingButton />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('region', { name: 'ติดต่อแอดมินผ่าน LINE' })).not.toBeInTheDocument();
  });

  it('does not render on /login/otp page', () => {
    mockUsePathname.mockReturnValue('/login/otp');
    const { container } = render(<ChatWithAdminFloatingButton />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('region', { name: 'ติดต่อแอดมินผ่าน LINE' })).not.toBeInTheDocument();
  });

  it('toggles QR code view when clicked and closes with back button or escape key', () => {
    mockUsePathname.mockReturnValue('/');
    render(<ChatWithAdminFloatingButton />);

    const openButton = screen.getByRole('button', {
      name: 'แสดงรายละเอียด LINE สำหรับติดต่อแอดมิน',
    });
    fireEvent.click(openButton);

    const backButton = screen.getByRole('button', { name: 'ปิดรายละเอียด LINE' });
    expect(backButton).toBeInTheDocument();
    expect(screen.getByText('LINE ID')).toBeInTheDocument();
    expect(screen.getByText('@sopet')).toBeInTheDocument();

    // Close via back button
    fireEvent.click(backButton);
    expect(screen.queryByRole('button', { name: 'ปิดรายละเอียด LINE' })).not.toBeInTheDocument();

    // Reopen and close via Escape
    fireEvent.click(openButton);
    expect(screen.getByRole('button', { name: 'ปิดรายละเอียด LINE' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'ปิดรายละเอียด LINE' })).not.toBeInTheDocument();
  });
});
