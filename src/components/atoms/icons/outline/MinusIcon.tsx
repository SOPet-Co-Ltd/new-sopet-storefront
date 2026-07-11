import { OutlineIcon, type OutlineIconProps } from '../OutlineIcon';

export type MinusIconProps = Omit<OutlineIconProps, 'children'>;

export function MinusIcon(props: MinusIconProps) {
  return (
    <OutlineIcon viewBox="0 0 28 28" {...props}>
      <path
        d="M2.33325 14C2.33325 8.50026 2.33325 5.7504 4.0418 4.04186C5.75034 2.33331 8.5002 2.33331 13.9999 2.33331C19.4996 2.33331 22.2495 2.33331 23.958 4.04186C25.6666 5.7504 25.6666 8.50026 25.6666 14C25.6666 19.4997 25.6666 22.2496 23.958 23.9581C22.2495 25.6666 19.4996 25.6666 13.9999 25.6666C8.5002 25.6666 5.75034 25.6666 4.0418 23.9581C2.33325 22.2496 2.33325 19.4997 2.33325 14Z"

        strokeWidth="1.5"
      />
      <path
        d="M17.5 14H10.5"

        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </OutlineIcon>
  );
}
