import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { buildProductShareUrl, getProductShareText, ProductShareModal } from './ProductShareModal';
import { writeCookieConsent } from '@/lib/consent/cookie-consent';

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const PRODUCT_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const PRODUCT_SLUG = 'premium-cat-food';
const STORE_SLUG = 'sopet-pet-shop';
const PRODUCT_PATH = `${PRODUCT_SLUG}-${STORE_SLUG}`;
const BASE_URL = 'https://www.sopet.org';
const CANONICAL = `${BASE_URL}/product/${PRODUCT_PATH}`;

const product = {
  id: PRODUCT_ID,
  slug: PRODUCT_SLUG,
  name: 'อาหารแมว Premium',
  description: '<p>อร่อยและมีประโยชน์</p>',
  store: { slug: STORE_SLUG },
} as unknown as ProductDetail;

function defineNavigatorProp(prop: 'share' | 'clipboard', value: unknown) {
  Object.defineProperty(navigator, prop, {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', BASE_URL);
  vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST01');
  toastSuccess.mockClear();
  toastError.mockClear();
  window.dataLayer = [];
  writeCookieConsent('accepted');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete window.dataLayer;
  // Reset feature-detected APIs between tests.
  defineNavigatorProp('share', undefined);
  defineNavigatorProp('clipboard', undefined);
});

function sharedEvents() {
  return (window.dataLayer ?? []).filter((entry) => entry.event === 'share');
}

describe('buildProductShareUrl', () => {
  it('returns the canonical product URL when no options are selected', () => {
    expect(buildProductShareUrl(product)).toBe(CANONICAL);
  });

  it('appends selected variant options as query params', () => {
    const url = buildProductShareUrl(product, { size: 'L', flavor: 'tuna' });
    expect(url).toBe(`${CANONICAL}?size=L&flavor=tuna`);
  });

  it('ignores empty option values', () => {
    expect(buildProductShareUrl(product, { size: '' })).toBe(CANONICAL);
  });

  it('uses the configured base URL, not window.location', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://staging.sopet.org');
    expect(buildProductShareUrl(product)).toBe(`https://staging.sopet.org/product/${PRODUCT_PATH}`);
  });
});

describe('getProductShareText', () => {
  it('strips HTML from the description and excludes the URL', () => {
    const text = getProductShareText(product);
    expect(text).toContain('อาหารแมว Premium');
    expect(text).toContain('อร่อยและมีประโยชน์');
    expect(text).not.toContain('http');
    expect(text).not.toContain('<p>');
  });
});

describe('ProductShareModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ProductShareModal isOpen={false} onClose={vi.fn()} product={product} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the share channels and the copy-link field', () => {
    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'แชร์สินค้าให้เพื่อนของคุณ' })).toBeInTheDocument();
    for (const label of ['LINE', 'Facebook', 'Messenger', 'Instagram']) {
      expect(screen.getByRole('button', { name: `แชร์ผ่าน ${label}` })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์' })).toBeInTheDocument();
    expect(screen.getByText(`www.sopet.org/product/${PRODUCT_PATH}`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'แชร์ผ่าน แอปอื่นๆ' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ปิด' })).toBeInTheDocument();
  });

  it('closes from the corner button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={onClose} product={product} />);
    await user.click(screen.getByRole('button', { name: 'ปิด' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('copies the canonical link, toasts, closes, and tracks the share', async () => {
    const onClose = vi.fn();
    // setup() installs its own clipboard stub, so override it afterwards.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    defineNavigatorProp('clipboard', { writeText });

    render(<ProductShareModal isOpen onClose={onClose} product={product} />);
    await user.click(screen.getByRole('button', { name: 'คัดลอกลิงก์' }));

    expect(writeText).toHaveBeenCalledWith(CANONICAL);
    expect(toastSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(sharedEvents()).toContainEqual(
      expect.objectContaining({ event: 'share', method: 'copy_link', item_id: PRODUCT_ID }),
    );
  });

  it('includes the selected variant option in the copied link', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    defineNavigatorProp('clipboard', { writeText });

    render(
      <ProductShareModal
        isOpen
        onClose={vi.fn()}
        product={product}
        selectedOptions={{ size: 'L' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'คัดลอกลิงก์' }));

    expect(writeText).toHaveBeenCalledWith(`${CANONICAL}?size=L`);
  });

  it('opens LINE with the encoded canonical URL and tracks the share', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน LINE' }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(CANONICAL)}`,
      '_blank',
      expect.stringContaining('noopener'),
    );
    expect(sharedEvents()).toContainEqual(
      expect.objectContaining({ method: 'line', item_id: PRODUCT_ID }),
    );
  });

  it('opens Facebook sharer with the encoded canonical URL', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน Facebook' }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(CANONICAL)}`,
      '_blank',
      expect.stringContaining('noopener'),
    );
  });

  it('uses the Web Share API for Instagram with a separate url', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    defineNavigatorProp('share', share);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={onClose} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน Instagram' }));

    expect(share).toHaveBeenCalledTimes(1);
    const payload = share.mock.calls[0][0];
    expect(payload.url).toBe(CANONICAL);
    expect(payload.text).not.toContain(CANONICAL);
    expect(onClose).toHaveBeenCalled();
    expect(sharedEvents()).toContainEqual(expect.objectContaining({ method: 'instagram' }));
  });

  it('does not toast an error when the user cancels the Instagram share', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'AbortError' }));
    defineNavigatorProp('share', share);
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน Instagram' }));

    expect(toastError).not.toHaveBeenCalled();
  });
});
