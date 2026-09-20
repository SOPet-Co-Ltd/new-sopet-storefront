import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPageRedirect } from './LoginPageRedirect';

const replace = vi.fn();
const openLoginModal = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/lib/providers/LoginModalProvider', () => ({
  useLoginModal: () => ({
    isOpen: false,
    notice: null,
    openLoginModal,
    closeLoginModal: vi.fn(),
  }),
}));

describe('LoginPageRedirect', () => {
  beforeEach(() => {
    replace.mockClear();
    openLoginModal.mockClear();
  });

  it('opens login modal and redirects home', () => {
    render(<LoginPageRedirect notice="sessionRequired" />);

    expect(openLoginModal).toHaveBeenCalledWith({ notice: 'sessionRequired' });
    expect(replace).toHaveBeenCalledWith('/');
    expect(screen.getByTestId('login-page-redirect')).toBeInTheDocument();
  });
});
