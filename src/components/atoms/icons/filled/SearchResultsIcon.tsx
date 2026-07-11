import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type SearchResultsIconProps = Omit<FilledIconProps, 'children'>;

export function SearchResultsIcon({ color = 'currentColor', ...props }: SearchResultsIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.25 6C2.25 5.58579 2.58579 5.25 3 5.25H21C21.4142 5.25 21.75 5.58579 21.75 6C21.75 6.41421 21.4142 6.75 21 6.75H3C2.58579 6.75 2.25 6.41421 2.25 6Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 12.75C15.7574 12.75 14.75 13.7574 14.75 15C14.75 16.2426 15.7574 17.25 17 17.25C18.2426 17.25 19.25 16.2426 19.25 15C19.25 13.7574 18.2426 12.75 17 12.75Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5697 16.5697C18.8626 16.2768 19.3374 16.2768 19.6303 16.5697L21.5303 18.4697C21.8232 18.7626 21.8232 19.2374 21.5303 19.5303C21.2374 19.8232 20.7626 19.8232 20.4697 19.5303L18.5697 17.6303C18.2768 17.3374 18.2768 16.8626 18.5697 16.5697Z"
      />
    </FilledIcon>
  );
}
