import type { CSSProperties } from 'react';

import type { IconResponsiveSize, IconSizeValue } from './types';

export const DEFAULT_ICON_SIZE: IconResponsiveSize = {
  mobile: 24,
  desktop: 24,
};

export function toCssSize(value: IconSizeValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getIconSizeStyle(size: IconResponsiveSize): CSSProperties {
  const desktop = size.desktop ?? size.mobile;

  return {
    '--vetai-icon-size-mobile': toCssSize(size.mobile),
    '--vetai-icon-size-desktop': toCssSize(desktop),
  } as CSSProperties;
}
