import { InlineIcon, type InlineIconProps } from '../InlineIcon';

export type XIconProps = Omit<InlineIconProps, 'children'>;

export function XIcon({ strokeWidth = 2.4, ...props }: XIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" strokeWidth={strokeWidth} {...props}>
      <path d="M18.75 5.25L5.25 18.75" />
      <path d="M18.75 18.75L5.25 5.25" />
    </InlineIcon>
  );
}
