import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type NavigationIconProps = Omit<FilledIconProps, 'children'>;

export function NavigationIcon({ color = 'currentColor', ...props }: NavigationIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V5C12.75 5.41421 12.4142 5.75 12 5.75C11.5858 5.75 11.25 5.41421 11.25 5V2C11.25 1.58579 11.5858 1.25 12 1.25Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.75C8.54822 5.75 5.75 8.54822 5.75 12C5.75 15.4518 8.54822 18.25 12 18.25C15.4518 18.25 18.25 15.4518 18.25 12C18.25 8.54822 15.4518 5.75 12 5.75Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75Z"
      />
    </FilledIcon>
  );
}
