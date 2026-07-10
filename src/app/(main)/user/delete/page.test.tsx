import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteAccountPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/user/delete',
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [vi.fn(), { loading: false }],
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}));

describe('DeleteAccountPage', () => {
  it('renders warning card with error variant tokens', () => {
    render(<DeleteAccountPage />);

    expect(screen.getByTestId('account-card-error')).toBeInTheDocument();
    expect(screen.getByText('คำเตือน')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ส่งคำขอลบบัญชี' })).toBeInTheDocument();
  });

  it('disables delete request button until confirmation is checked', async () => {
    const user = userEvent.setup();

    render(<DeleteAccountPage />);

    const deleteButton = screen.getByRole('button', { name: 'ส่งคำขอลบบัญชี' });
    expect(deleteButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: /ฉันเข้าใจและต้องการลบบัญชีของฉัน/ }));

    expect(deleteButton).toBeEnabled();
  });
});
