import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type LeftArrowIconProps = Omit<FilledIconProps, 'children'>;

export function LeftArrowIcon({ color = 'currentColor', ...props }: LeftArrowIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5809 23.7204C17.0777 24.1378 16.3202 24.0814 15.8889 23.5944L6.28889 12.7558C5.9037 12.3209 5.9037 11.6791 6.28889 11.2442L15.8889 0.405553C16.3202 -0.0814051 17.0777 -0.137799 17.5809 0.279593C18.0841 0.696986 18.1424 1.43011 17.7111 1.91707L8.78049 12L17.7111 22.0829C18.1424 22.5699 18.0841 23.303 17.5809 23.7204Z"
      />
    </FilledIcon>
  );
}
