import { IconBase } from '../IconBase';
import type { IconColor, IconResponsiveSize, IconSvgProps } from '../types';

export type ProfileIconProps = IconSvgProps & {
  size?: IconResponsiveSize;
  color?: IconColor;
};

/** Circular Sopet profile avatar — head + shoulders cutouts on a filled circle. */
export function ProfileIcon({ color = 'currentColor', ...props }: ProfileIconProps) {
  return (
    <IconBase viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM12 5.25C10.4812 5.25 9.25 6.48122 9.25 8C9.25 9.51878 10.4812 10.75 12 10.75C13.5188 10.75 14.75 9.51878 14.75 8C14.75 6.48122 13.5188 5.25 12 5.25ZM6 18.5C6 16.8431 8.68629 15.5 12 15.5C15.3137 15.5 18 16.8431 18 18.5C18 20.1569 15.3137 21.5 12 21.5C8.68629 21.5 6 20.1569 6 18.5Z"
      />
    </IconBase>
  );
}
