import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type RightArrowIconProps = Omit<FilledIconProps, "children">

export function RightArrowIcon({ color = "currentColor", ...props }: RightArrowIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.41907 0.279594C6.92226 -0.137799 7.67982 -0.0814053 8.11113 0.405553L17.7111 11.2442C18.0963 11.6791 18.0963 12.3209 17.7111 12.7558L8.11113 23.5944C7.67982 24.0814 6.92226 24.1378 6.41907 23.7204C5.91588 23.303 5.85761 22.5699 6.28891 22.0829L15.2195 12L6.28891 1.91707C5.85761 1.43011 5.91588 0.696986 6.41907 0.279594Z"
       
      />
    </FilledIcon>
  )
}
