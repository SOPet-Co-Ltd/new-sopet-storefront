import { IconBase } from "../IconBase"
import type { IconColor, IconResponsiveSize, IconSvgProps } from "../types"

export type SearchIconProps = IconSvgProps & {
  size?: IconResponsiveSize
  color?: IconColor
}

export function SearchIcon({ color = "currentColor", ...props }: SearchIconProps) {
  return (
    <IconBase viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 3.75C6.99594 3.75 3.75 6.99594 3.75 11C3.75 15.0041 6.99594 18.25 11 18.25C15.0041 18.25 18.25 15.0041 18.25 11C18.25 6.99594 15.0041 3.75 11 3.75Z"
        stroke={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.1697 16.1697C16.4626 15.8768 16.9374 15.8768 17.2303 16.1697L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L16.1697 17.2303C15.8768 16.9374 15.8768 16.4626 16.1697 16.1697Z"
        fill={color}
      />
    </IconBase>
  )
}
