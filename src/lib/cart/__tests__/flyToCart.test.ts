import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLY_TO_CART_TARGET_ATTR, flyToCart, getProductFlyImageUrl } from '@/lib/cart/flyToCart';

describe('getProductFlyImageUrl', () => {
  it('prefers thumbnailUrl over gallery images', () => {
    expect(
      getProductFlyImageUrl({
        thumbnailUrl: 'https://cdn.example/thumb.jpg',
        images: [{ url: 'https://cdn.example/gallery.jpg' }],
      }),
    ).toBe('https://cdn.example/thumb.jpg');
  });

  it('falls back to the first gallery image', () => {
    expect(
      getProductFlyImageUrl({
        thumbnailUrl: null,
        images: [{ url: 'https://cdn.example/gallery.jpg' }],
      }),
    ).toBe('https://cdn.example/gallery.jpg');
  });

  it('returns null when no image is available', () => {
    expect(getProductFlyImageUrl({ thumbnailUrl: null, images: [] })).toBeNull();
  });
});

describe('flyToCart', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('no-ops when the cart target is missing', () => {
    const source = document.createElement('button');
    document.body.appendChild(source);
    const onComplete = vi.fn();

    flyToCart({ source, onComplete });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.fly-to-cart-flyer')).toBeNull();
  });

  it('bumps the cart without a flyer when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    const source = document.createElement('button');
    const target = document.createElement('a');
    target.setAttribute(FLY_TO_CART_TARGET_ATTR, '');
    document.body.append(source, target);

    const onComplete = vi.fn();
    flyToCart({ source, imageUrl: 'https://cdn.example/p.jpg', onComplete });

    expect(document.querySelector('.fly-to-cart-flyer')).toBeNull();
    expect(target.classList.contains('animate-cart-bump')).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('creates a flying image and cleans up after the animation finishes', () => {
    const source = document.createElement('button');
    source.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 400,
        width: 200,
        height: 48,
        right: 300,
        bottom: 448,
        x: 100,
        y: 400,
        toJSON: () => ({}),
      }) as DOMRect;

    const target = document.createElement('a');
    target.setAttribute(FLY_TO_CART_TARGET_ATTR, '');
    target.getBoundingClientRect = () =>
      ({
        left: 1200,
        top: 60,
        width: 18,
        height: 18,
        right: 1218,
        bottom: 78,
        x: 1200,
        y: 60,
        toJSON: () => ({}),
      }) as DOMRect;

    document.body.append(source, target);

    const finishListeners: Array<() => void> = [];
    const animateSpy = vi.fn().mockReturnValue({
      addEventListener: (type: string, listener: () => void) => {
        if (type === 'finish') finishListeners.push(listener);
      },
    });
    HTMLElement.prototype.animate = animateSpy;

    const onComplete = vi.fn();
    flyToCart({
      source,
      imageUrl: 'https://cdn.example/product.jpg',
      onComplete,
    });

    const flyer = document.querySelector('.fly-to-cart-flyer') as HTMLImageElement | null;
    expect(flyer).not.toBeNull();
    expect(flyer?.tagName).toBe('IMG');
    expect(flyer?.getAttribute('src')).toBe('https://cdn.example/product.jpg');
    expect(animateSpy).toHaveBeenCalledTimes(1);

    finishListeners.forEach((listener) => listener());

    expect(document.querySelector('.fly-to-cart-flyer')).toBeNull();
    expect(target.classList.contains('animate-cart-bump')).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
