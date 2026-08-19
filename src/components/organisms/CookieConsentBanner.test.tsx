import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieConsentBanner } from './CookieConsentBanner';
import {
  openCookiePreferences,
  readConsentPreferences,
  resetCookieConsentMemory,
  writeConsentPreferences,
  writeCookieConsent,
} from '@/lib/consent/cookie-consent';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

function stubLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  });
}

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    resetCookieConsentMemory();
    stubLocalStorage();
  });

  afterEach(() => {
    resetCookieConsentMemory();
  });

  it('renders nothing during SSR so refresh does not flash the banner', () => {
    expect(renderToString(<CookieConsentBanner />)).toBe('');
  });

  it('shows the banner after mount when consent is unset', async () => {
    render(<CookieConsentBanner />);
    expect(await screen.findByRole('dialog', { name: 'ความยินยอมคุกกี้' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยอมรับทั้งหมด' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ตั้งค่า' })).toBeInTheDocument();
  });

  it('stays hidden after mount when consent was already decided', async () => {
    writeCookieConsent('accepted');
    const { container } = render(<CookieConsentBanner />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'ความยินยอมคุกกี้' })).not.toBeInTheDocument();
    });
    expect(container.querySelector('[aria-label="ตั้งค่าคุกกี้"]')).not.toBeInTheDocument();
  });

  it('hides after the shopper accepts all', async () => {
    const user = userEvent.setup();
    render(<CookieConsentBanner />);
    const dialog = await screen.findByRole('dialog', { name: 'ความยินยอมคุกกี้' });
    await user.click(screen.getByRole('button', { name: 'ยอมรับทั้งหมด' }));
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });
  });

  it('opens preferences from Customize and saves analytics-only', async () => {
    const user = userEvent.setup();
    render(<CookieConsentBanner />);
    await user.click(await screen.findByRole('button', { name: 'ตั้งค่า' }));

    expect(await screen.findByRole('dialog', { name: 'ตั้งค่าคุกกี้' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'คุกกี้ที่จำเป็น (เปิดเสมอ)' })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'คุกกี้วิเคราะห์' }));
    await user.click(screen.getByRole('button', { name: 'บันทึกการตั้งค่า' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'ตั้งค่าคุกกี้' })).not.toBeInTheDocument();
    });
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });
  });

  it('opens preferences when openCookiePreferences is dispatched', async () => {
    writeConsentPreferences({ analytics: true, marketing: false });
    render(<CookieConsentBanner />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'ความยินยอมคุกกี้' })).not.toBeInTheDocument();
    });

    openCookiePreferences();
    expect(await screen.findByRole('dialog', { name: 'ตั้งค่าคุกกี้' })).toBeInTheDocument();
  });
});
