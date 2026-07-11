import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type MinusHeavyIconProps = Omit<FilledIconProps, 'children'>;

export function MinusHeavyIcon({ color = 'currentColor', ...props }: MinusHeavyIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 12C3.75 11.3096 4.30964 10.75 5 10.75H19C19.6904 10.75 20.25 11.3096 20.25 12C20.25 12.6904 19.6904 13.25 19 13.25H5C4.30964 13.25 3.75 12.6904 3.75 12Z"
      />
    </FilledIcon>
  );
}
