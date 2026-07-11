import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type LocationIconProps = Omit<FilledIconProps, 'children'>;

export function LocationIcon({ color = 'currentColor', ...props }: LocationIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.75C10.0772 2.75 8.23311 3.51384 6.87348 4.87348C5.51384 6.23311 4.75 8.07718 4.75 10C4.75 12.2436 6.0087 14.6262 7.5988 16.7154C9.15703 18.7627 10.9447 20.4139 11.8637 21.2093C11.9042 21.2356 11.9515 21.2498 12 21.2498C12.0485 21.2498 12.0958 21.2356 12.1363 21.2093C13.0553 20.4139 14.843 18.7627 16.4012 16.7154C17.9913 14.6262 19.25 12.2436 19.25 10C19.25 8.07718 18.4862 6.23311 17.1265 4.87348C15.7669 3.51384 13.9228 2.75 12 2.75Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.75C10.7574 7.75 9.75 8.75736 9.75 10C9.75 11.2426 10.7574 12.25 12 12.25C13.2426 12.25 14.25 11.2426 14.25 10C14.25 8.75736 13.2426 7.75 12 7.75Z"
      />
    </FilledIcon>
  );
}
