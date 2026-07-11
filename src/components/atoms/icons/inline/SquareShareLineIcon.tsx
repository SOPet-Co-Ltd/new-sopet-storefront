import { InlineIcon, type InlineIconProps } from '../InlineIcon';

export type SquareShareLineIconProps = Omit<InlineIconProps, 'children'>;

export function SquareShareLineIcon({ strokeWidth = 2, ...props }: SquareShareLineIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" strokeWidth={strokeWidth} {...props}>
      <path d="M22 13.9979C21.9711 17.4119 21.7815 19.294 20.5404 20.5352C19.0755 22 16.7179 22 12.0026 22C7.28733 22 4.9297 22 3.46485 20.5352C2 19.0703 2 16.7127 2 11.9974C2 7.28212 2 4.92448 3.46485 3.45963C4.70599 2.21848 6.58807 2.02895 10.0021 2" />
      <path d="M22 7H14C12.0798 7 10.9653 7.99557 10.6182 8.36456C10.5409 8.44674 10.5022 8.48784 10.495 8.49504C10.4878 8.50224 10.4467 8.54089 10.3646 8.61821C9.99557 8.96531 9 10.0798 9 12V15M17 12L22 7L17 2" />
    </InlineIcon>
  );
}
