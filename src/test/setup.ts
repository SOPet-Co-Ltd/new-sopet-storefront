import '@testing-library/jest-dom/vitest';
import { resetApolloClientSingletons } from '@apollo/client-integration-nextjs';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import React from 'react';
import { resetSessionIdForTests } from '@/lib/session';
import { server } from './mocks/server';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    priority: _priority,
    ...props
  }: {
    src: string | { src: string };
    alt: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => {
    const imgSrc =
      typeof src === 'object' && src !== null && 'src' in src ? (src as { src: string }).src : src;
    return React.createElement('img', { src: imgSrc, alt, ...props });
  },
}));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  resetApolloClientSingletons();
  cleanup();
  server.resetHandlers();
  resetSessionIdForTests();
});

afterAll(() => {
  server.close();
});
