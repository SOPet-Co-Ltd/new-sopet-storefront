import { OutlineIcon, type OutlineIconProps } from '../OutlineIcon';

export type MinusStrokeIconProps = Omit<OutlineIconProps, 'children'>;

export function MinusStrokeIcon(props: MinusStrokeIconProps) {
  return (
    <OutlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M6 12H18" />
    </OutlineIcon>
  );
}
