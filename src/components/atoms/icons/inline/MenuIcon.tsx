import { InlineIcon, type InlineIconProps } from '../InlineIcon';

export type MenuIconProps = Omit<InlineIconProps, 'children'>;

export function MenuIcon(props: MenuIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M20 7L4 7" />
      <path d="M20 12L4 12" />
      <path d="M20 17L4 17" />
    </InlineIcon>
  );
}
