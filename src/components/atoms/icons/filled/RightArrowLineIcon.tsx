import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type RightArrowLineIconProps = Omit<FilledIconProps, 'children'>;

export function RightArrowLineIcon({ color = 'currentColor', ...props }: RightArrowLineIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0155 2.32544C14.4172 1.89152 15.0685 1.89152 15.4702 2.32544L23.6987 11.2143C24.1004 11.6482 24.1004 12.3518 23.6987 12.7857L15.4702 21.6746C15.0685 22.1085 14.4172 22.1085 14.0155 21.6746C13.6139 21.2406 13.6139 20.5371 14.0155 20.1032L20.4882 13.1111H1.02857C0.460507 13.1111 0 12.6136 0 12C0 11.3863 0.460507 10.8889 1.02857 10.8889H20.4882L14.0155 3.89679C13.6139 3.46287 13.6139 2.75935 14.0155 2.32544Z"
      />
    </FilledIcon>
  );
}
