'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { getNavItems, isAccountNavActive } from './accountNavConfig';
import { AccountNavLink } from './AccountSidebarNav';

type AccountMobileNavProps = {
  pathname: string;
};

type ScrollState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

function ScrollFade({ side, visible }: { side: 'left' | 'right'; visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 w-8 transition-opacity duration-200',
        side === 'left'
          ? 'left-0 bg-linear-to-r from-sop-base-white to-transparent'
          : 'right-0 bg-linear-to-l from-sop-base-white to-transparent',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

export function AccountMobileNav({ pathname }: AccountMobileNavProps) {
  const items = getNavItems('showInMobileNav');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setScrollState({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    updateScrollState();

    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, items.length]);

  useEffect(() => {
    const element = scrollRef.current;
    const activeLink = element?.querySelector<HTMLElement>('[aria-current="page"]');
    if (typeof activeLink?.scrollIntoView === 'function') {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [pathname]);

  return (
    <nav
      aria-label="เมนูบัญชีผู้ใช้ (มือถือ)"
      className="border-b border-sop-neutral-grayalpha-200 bg-sop-base-white lg:hidden"
    >
      <div className="relative py-2">
        <ScrollFade side="left" visible={scrollState.canScrollLeft} />
        <ScrollFade side="right" visible={scrollState.canScrollRight} />

        <div
          ref={scrollRef}
          className="flex w-full max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 scroll-smooth touch-pan-x [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <AccountNavLink
              key={item.href}
              active={isAccountNavActive(pathname, item.href)}
              href={item.href}
              label={item.label}
              layout="mobile"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
