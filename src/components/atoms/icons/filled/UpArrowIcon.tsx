import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type UpArrowIconProps = Omit<FilledIconProps, 'children'>;

export function UpArrowIcon({ color = 'currentColor', ...props }: UpArrowIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.25629 17.2734C1.6389 17.7198 2.31093 17.7715 2.75731 17.3889L12 9.46657L21.2427 17.3889C21.6891 17.7715 22.3611 17.7198 22.7437 17.2734C23.1263 16.827 23.0746 16.155 22.6282 15.7724L12.6928 7.25628C12.2941 6.91458 11.7059 6.91458 11.3072 7.25628L1.37176 15.7724C0.925378 16.155 0.873684 16.827 1.25629 17.2734Z"
      />
    </FilledIcon>
  );
}
