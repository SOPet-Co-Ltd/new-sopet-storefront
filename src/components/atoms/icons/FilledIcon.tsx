import type { ReactNode } from "react"

import { IconBase } from "./IconBase"
import type { IconColor, IconResponsiveSize, IconSvgProps } from "./types"

export type FilledIconProps = IconSvgProps & {
  size?: IconResponsiveSize
  color?: IconColor
  strokeColor?: IconColor
  strokeWidth?: number | string
  children: ReactNode
}

export function FilledIcon({
  size,
  color = "currentColor",
  strokeColor,
  strokeWidth = 0,
  children,
  ...props
}: FilledIconProps) {
  return (
    <IconBase
      size={size}
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      {...props}
    >
      {children}
    </IconBase>
  )
}
