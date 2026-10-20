import { OutlineIcon, type OutlineIconProps } from '../OutlineIcon';

export type PlusStrokeIconProps = Omit<OutlineIconProps, 'children'>;

export function PlusStrokeIcon(props: PlusStrokeIconProps) {
  return (
    <OutlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M6 12H18" />
      <path d="M12 18V6" />
    </OutlineIcon>
  );
}
