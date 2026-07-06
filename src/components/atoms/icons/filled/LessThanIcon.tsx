import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type LessThanIconProps = Omit<FilledIconProps, "children">

export function LessThanIcon({ color = "currentColor", ...props }: LessThanIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        d="M17.6159 23.7204C17.1546 24.1378 16.4602 24.0814 16.0648 23.5944L7.26482 12.7558C6.91173 12.3209 6.91173 11.6791 7.26482 11.2442L16.0648 0.405553C16.4602 -0.081405 17.1546 -0.137798 17.6159 0.279594C18.0771 0.696987 18.1305 1.43011 17.7352 1.91707L9.54878 12L17.7352 22.0829C18.1305 22.5699 18.0771 23.303 17.6159 23.7204Z"
       
      />
    </FilledIcon>
  )
}
