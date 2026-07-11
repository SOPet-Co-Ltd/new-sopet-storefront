import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type CreditIconProps = Omit<FilledIconProps, 'children'>;

export function CreditIcon({ color = 'currentColor', ...props }: CreditIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5.75C3.30964 5.75 2.75 6.30964 2.75 7V17C2.75 17.6904 3.30964 18.25 4 18.25H20C20.6904 18.25 21.25 17.6904 21.25 17V7C21.25 6.30964 20.6904 5.75 20 5.75H4ZM1.25 7C1.25 5.48122 2.48122 4.25 4 4.25H20C21.5188 4.25 22.75 5.48122 22.75 7V17C22.75 18.5188 21.5188 19.75 20 19.75H4C2.48122 19.75 1.25 18.5188 1.25 17V7Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.25 10C1.25 9.58579 1.58579 9.25 2 9.25H22C22.4142 9.25 22.75 9.58579 22.75 10C22.75 10.4142 22.4142 10.75 22 10.75H2C1.58579 10.75 1.25 10.4142 1.25 10Z"
      />
    </FilledIcon>
  );
}
