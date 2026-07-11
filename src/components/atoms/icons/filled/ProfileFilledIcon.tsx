import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type ProfileFilledIconProps = Omit<FilledIconProps, 'children'>;

export function ProfileFilledIcon({ color = 'currentColor', ...props }: ProfileFilledIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <g clipPath="url(#clip0_38_18)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM15.6 8.4C15.6 10.3882 13.9882 12 12 12C10.0118 12 8.4 10.3882 8.4 8.4C8.4 6.41177 10.0118 4.8 12 4.8C13.9882 4.8 15.6 6.41177 15.6 8.4ZM12 22.2C14.1408 22.2 16.1276 21.5404 17.7683 20.4134C18.4929 19.9157 18.8026 18.9675 18.3813 18.1959C17.5079 16.5963 15.7083 15.6 11.9999 15.6C8.29163 15.6 6.49196 16.5963 5.61857 18.1958C5.19726 18.9674 5.50692 19.9156 6.23155 20.4134C7.87222 21.5404 9.85907 22.2 12 22.2Z"
        />
      </g>
      <defs>
        <clipPath id="clip0_38_18">
          <rect width="24" height="24" rx="3" fill="white" />
        </clipPath>
      </defs>
    </FilledIcon>
  );
}
