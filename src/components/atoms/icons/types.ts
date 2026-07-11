import type { SVGProps } from 'react';

export type IconSizeValue = number | string;

export type IconResponsiveSize = {
  mobile: IconSizeValue;
  desktop?: IconSizeValue;
};

export type IconColor = string;

export type IconSvgProps = Pick<
  SVGProps<SVGSVGElement>,
  'className' | 'viewBox' | 'aria-label' | 'aria-hidden' | 'role' | 'id'
>;
