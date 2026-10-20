import { IconBase } from '../IconBase';
import type { FilledIconProps } from '../FilledIcon';

export type HeartIconProps = Omit<FilledIconProps, 'children'>;

export function HeartIcon({
  color = 'currentColor',
  strokeWidth = 2,
  size,
  ...props
}: HeartIconProps) {
  return (
    <IconBase
      size={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 9.13704C2 14 6.01943 16.5913 8.96173 18.9108C10 19.7293 11 20.4999 12 20.4999C13 20.4999 14 19.7293 15.0383 18.9108C17.9806 16.5913 22 14 22 9.13704C22 4.2741 16.4998 0.825403 12 5.50057C7.50016 0.825403 2 4.2741 2 9.13704Z" />
    </IconBase>
  );
}
