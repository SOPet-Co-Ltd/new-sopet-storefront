import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type DotIconProps = Omit<FilledIconProps, "children">

export function DotIcon({ color = "currentColor", ...props }: DotIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
       
      />
    </FilledIcon>
  )
}
