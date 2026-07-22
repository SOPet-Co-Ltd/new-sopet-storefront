export const FLY_TO_CART_TARGET_ATTR = 'data-fly-to-cart-target';

const FLYER_SIZE_PX = 48;
const ANIMATION_MS = 900;
const PATH_SAMPLES = 16;

export type FlyToCartOptions = {
  source: Element;
  imageUrl?: string | null;
  onComplete?: () => void;
};

type Point = { x: number; y: number };

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTargetElement(): Element | null {
  return document.querySelector(`[${FLY_TO_CART_TARGET_ATTR}]`);
}

function bumpCart(target: Element): void {
  target.classList.remove('animate-cart-bump');
  // Force reflow so re-triggering the same class restarts the animation.
  void (target as HTMLElement).offsetWidth;
  target.classList.add('animate-cart-bump');

  const handleEnd = () => {
    target.classList.remove('animate-cart-bump');
    target.removeEventListener('animationend', handleEnd);
  };
  target.addEventListener('animationend', handleEnd);
}

function createFlyer(imageUrl?: string | null): HTMLElement {
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.draggable = false;
    img.setAttribute('aria-hidden', 'true');
    img.className = 'fly-to-cart-flyer';
    return img;
  }

  const fallback = document.createElement('div');
  fallback.setAttribute('aria-hidden', 'true');
  fallback.className = 'fly-to-cart-flyer fly-to-cart-flyer--fallback';
  return fallback;
}

function quadraticPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/** Keep the thumbnail readable longer, then shrink into the cart. */
function scaleAt(t: number): number {
  return 1 - 0.78 * t * t;
}

/** Hold full opacity until late, then soft fade into the icon. */
function opacityAt(t: number): number {
  if (t < 0.72) return 1;
  return 1 - (t - 0.72) / 0.28;
}

function buildFlightKeyframes(start: Point, end: Point): Keyframe[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const arcLift = Math.min(88, Math.max(36, distance * 0.16));

  const control: Point = {
    x: start.x + dx * 0.35,
    y: Math.min(start.y, end.y) - arcLift,
  };

  const frames: Keyframe[] = [];
  for (let i = 0; i <= PATH_SAMPLES; i += 1) {
    const t = i / PATH_SAMPLES;
    const point = quadraticPoint(start, control, end, t);
    frames.push({
      transform: `translate3d(${point.x}px, ${point.y}px, 0) scale(${scaleAt(t)})`,
      opacity: opacityAt(t),
      offset: t,
    });
  }
  return frames;
}

/**
 * Animates a product thumbnail from a source element to the navbar cart icon.
 * No-ops gracefully when the cart target is missing or motion is reduced.
 */
export function flyToCart({ source, imageUrl, onComplete }: FlyToCartOptions): void {
  if (typeof window === 'undefined') {
    onComplete?.();
    return;
  }

  const target = getTargetElement();
  if (!target) {
    onComplete?.();
    return;
  }

  if (prefersReducedMotion()) {
    bumpCart(target);
    onComplete?.();
    return;
  }

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const start: Point = {
    x: sourceRect.left + sourceRect.width / 2 - FLYER_SIZE_PX / 2,
    y: sourceRect.top + sourceRect.height / 2 - FLYER_SIZE_PX / 2,
  };
  const end: Point = {
    x: targetRect.left + targetRect.width / 2 - FLYER_SIZE_PX / 2,
    y: targetRect.top + targetRect.height / 2 - FLYER_SIZE_PX / 2,
  };

  const flyer = createFlyer(imageUrl);
  flyer.style.width = `${FLYER_SIZE_PX}px`;
  flyer.style.height = `${FLYER_SIZE_PX}px`;
  flyer.style.transform = `translate3d(${start.x}px, ${start.y}px, 0) scale(1)`;
  document.body.appendChild(flyer);

  const animation = flyer.animate(buildFlightKeyframes(start, end), {
    duration: ANIMATION_MS,
    // ease-out-quart: quick departure, soft settle into the cart
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    fill: 'forwards',
  });

  const finish = () => {
    flyer.remove();
    bumpCart(target);
    onComplete?.();
  };

  animation.addEventListener('finish', finish, { once: true });
  animation.addEventListener(
    'cancel',
    () => {
      flyer.remove();
      onComplete?.();
    },
    { once: true },
  );
}

export function getProductFlyImageUrl(product: {
  thumbnailUrl?: string | null;
  images?: Array<{ url?: string | null }> | null;
}): string | null {
  return product.thumbnailUrl || product.images?.[0]?.url || null;
}
