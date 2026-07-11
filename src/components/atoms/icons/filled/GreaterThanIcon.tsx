import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type GreaterThanIconProps = Omit<FilledIconProps, 'children'>;

export function GreaterThanIcon({ color = 'currentColor', ...props }: GreaterThanIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path d="M7.38415 0.279594C7.84541 -0.137799 8.53984 -0.0814053 8.9352 0.405553L17.7352 11.2442C18.0883 11.6791 18.0883 12.3209 17.7352 12.7558L8.9352 23.5944C8.53984 24.0814 7.84541 24.1378 7.38415 23.7204C6.92289 23.303 6.86947 22.5699 7.26484 22.0829L15.4512 12L7.26484 1.91707C6.86947 1.43011 6.92289 0.696986 7.38415 0.279594Z" />
    </FilledIcon>
  );
}
