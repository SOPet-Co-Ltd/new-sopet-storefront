import type { ReactNode } from 'react';

import { IconBase } from './IconBase';
import type { IconColor, IconResponsiveSize, IconSvgProps } from './types';

const OUTLINE_STROKE_WIDTH = 1.5;

export type OutlineIconProps = IconSvgProps & {
  size?: IconResponsiveSize;
  color?: IconColor;
  children: ReactNode;
};

export function OutlineIcon({
  size,
  color = 'currentColor',
  children,
  ...props
}: OutlineIconProps) {
  return (
    <IconBase
      size={size}
      fill="none"
      stroke={color}
      strokeWidth={OUTLINE_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </IconBase>
  );
}
