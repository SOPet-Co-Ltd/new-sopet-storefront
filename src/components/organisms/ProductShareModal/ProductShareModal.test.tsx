import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { buildProductShareUrl, getProductShareText, ProductShareModal } from './ProductShareModal';

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const PRODUCT_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const BASE_URL = 'https://www.sopet.org';
const CANONICAL = `${BASE_URL}/product/${PRODUCT_ID}`;

const product = {
  id: PRODUCT_ID,
  name: 'อาหารแมว Premium',
  description: '<p>อร่อยและมีประโยชน์</p>',
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
    expect(buildProductShareUrl(PRODUCT_ID)).toBe(CANONICAL);
  });

  it('appends selected variant options as query params', () => {
    const url = buildProductShareUrl(PRODUCT_ID, { size: 'L', flavor: 'tuna' });
    expect(url).toBe(`${CANONICAL}?size=L&flavor=tuna`);
  });

  it('ignores empty option values', () => {
    expect(buildProductShareUrl(PRODUCT_ID, { size: '' })).toBe(CANONICAL);
  });

  it('uses the configured base URL, not window.location', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://staging.sopet.org');
    expect(buildProductShareUrl(PRODUCT_ID)).toBe(
      `https://staging.sopet.org/product/${PRODUCT_ID}`,
    );
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

  it('shows the core share channels', () => {
    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    for (const label of ['คัดลอกลิงก์', 'Line', 'Facebook', 'Messenger', 'Instagram']) {
      expect(screen.getByRole('button', { name: `แชร์ผ่าน ${label}` })).toBeInTheDocument();
    }
  });

  it('hides the native "other apps" button when Web Share is unsupported', () => {
    defineNavigatorProp('share', undefined);
    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    expect(screen.queryByRole('button', { name: 'แชร์ผ่าน แอปอื่นๆ' })).not.toBeInTheDocument();
  });

  it('copies the canonical link, toasts, closes, and tracks the share', async () => {
    const onClose = vi.fn();
    // setup() installs its own clipboard stub, so override it afterwards.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    defineNavigatorProp('clipboard', { writeText });

    render(<ProductShareModal isOpen onClose={onClose} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน คัดลอกลิงก์' }));

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
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน คัดลอกลิงก์' }));

    expect(writeText).toHaveBeenCalledWith(`${CANONICAL}?size=L`);
  });

  it('opens LINE with the encoded canonical URL and tracks the share', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน Line' }));

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

  it('uses the Web Share API with a separate url (no duplicated link in text)', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    defineNavigatorProp('share', share);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={onClose} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน แอปอื่นๆ' }));

    expect(share).toHaveBeenCalledTimes(1);
    const payload = share.mock.calls[0][0];
    expect(payload.url).toBe(CANONICAL);
    expect(payload.text).not.toContain(CANONICAL);
    expect(onClose).toHaveBeenCalled();
    expect(sharedEvents()).toContainEqual(expect.objectContaining({ method: 'native' }));
  });

  it('does not toast an error when the user cancels the native share', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'AbortError' }));
    defineNavigatorProp('share', share);
    const user = userEvent.setup();

    render(<ProductShareModal isOpen onClose={vi.fn()} product={product} />);
    await user.click(screen.getByRole('button', { name: 'แชร์ผ่าน แอปอื่นๆ' }));

    expect(toastError).not.toHaveBeenCalled();
  });
});
