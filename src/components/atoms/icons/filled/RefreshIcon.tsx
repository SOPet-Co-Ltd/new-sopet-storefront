import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type RefreshIconProps = Omit<FilledIconProps, 'children'>;

export function RefreshIcon({ color = 'currentColor', ...props }: RefreshIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9972 2.25001L12 2.25C14.5859 2.25001 17.0658 3.27723 18.8943 5.10571C20.7228 6.93419 21.75 9.41414 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75C20.5858 12.75 20.25 12.4142 20.25 12C20.25 9.81197 19.3808 7.71355 17.8336 6.16637C16.2868 4.61953 14.1889 3.75038 12.0014 3.75001C9.68149 3.7591 7.45475 4.66368 5.78576 6.2749L3.53033 8.53034C3.23744 8.82323 2.76256 8.82323 2.46967 8.53034C2.17678 8.23744 2.17678 7.76257 2.46967 7.46968L4.73864 5.2007C6.68676 3.3174 9.28759 2.2602 11.9972 2.25001Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 2.25001C3.41421 2.25001 3.75 2.58579 3.75 3.00001V7.25001H8C8.41421 7.25001 8.75 7.58579 8.75 8.00001C8.75 8.41422 8.41421 8.75001 8 8.75001H3C2.58579 8.75001 2.25 8.41422 2.25 8.00001V3.00001C2.25 2.58579 2.58579 2.25001 3 2.25001Z"
      />
    </FilledIcon>
  );
}
