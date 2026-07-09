import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ADS_DISMISS_STORAGE_KEY,
  getCooldownMs,
  parseDismissState,
  PromotionalAdsModal,
} from '@/components/organisms/PromotionalAdsModal/PromotionalAdsModal';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { samplePlatformAds } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

const createWrapper = createApolloTestWrapper;

describe('PromotionalAdsModal helpers', () => {
  it('parseDismissState returns null for invalid JSON', () => {
    expect(parseDismissState('not-json')).toBeNull();
    expect(parseDismissState('{"dismissedAt":"x","expiresAt":1}')).toBeNull();
  });

  it('parseDismissState returns parsed state for valid payload', () => {
    expect(
      parseDismissState(JSON.stringify({ dismissedAt: 1, expiresAt: 2 })),
    ).toEqual({ dismissedAt: 1, expiresAt: 2 });
  });

  it('getCooldownMs uses env override when valid', () => {
    vi.stubEnv('NEXT_PUBLIC_PROMO_ADS_MODAL_COOLDOWN_MS', '60000');
    expect(getCooldownMs()).toBe(60000);
    vi.unstubAllEnvs();
  });

  it('getCooldownMs falls back to 24 hours for invalid env', () => {
    vi.stubEnv('NEXT_PUBLIC_PROMO_ADS_MODAL_COOLDOWN_MS', 'invalid');
    expect(getCooldownMs()).toBe(24 * 60 * 60 * 1000);
    vi.unstubAllEnvs();
  });
});

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
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
  };
}

describe('PromotionalAdsModal', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    server.use(
      graphql.query('PlatformAds', () => {
        return HttpResponse.json({
          data: { platformAds: samplePlatformAds },
        });
      }),
    );
  });

  it('shows the promotional ad modal when no dismiss cooldown is active', async () => {
    render(<PromotionalAdsModal />, { wrapper: createWrapper() });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pet Payday Promotion' })).toHaveAttribute(
      'src',
      samplePlatformAds[0].imageUrl,
    );
  });

  it('does not show the modal while an active dismiss cooldown exists', async () => {
    localStorage.setItem(
      ADS_DISMISS_STORAGE_KEY,
      JSON.stringify({
        dismissedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
      }),
    );

    render(<PromotionalAdsModal />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not show the modal when platformAds is empty', async () => {
    server.use(
      graphql.query('PlatformAds', () => {
        return HttpResponse.json({
          data: { platformAds: [] },
        });
      }),
    );

    render(<PromotionalAdsModal />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('persists dismiss cooldown and closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    vi.stubEnv('NEXT_PUBLIC_PROMO_ADS_MODAL_COOLDOWN_MS', '60000');

    render(<PromotionalAdsModal />, { wrapper: createWrapper() });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const stored = parseDismissState(localStorage.getItem(ADS_DISMISS_STORAGE_KEY));
    expect(stored).not.toBeNull();
    expect(stored!.expiresAt - stored!.dismissedAt).toBe(60_000);

    vi.unstubAllEnvs();
  });

  it('dismisses the modal when Escape is pressed', async () => {
    const user = userEvent.setup();

    render(<PromotionalAdsModal />, { wrapper: createWrapper() });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(localStorage.getItem(ADS_DISMISS_STORAGE_KEY)).not.toBeNull();
  });
});
