import type { ReactNode } from "react"

import { IconBase } from "./IconBase"
import type { IconColor, IconResponsiveSize, IconSvgProps } from "./types"

export type InlineIconProps = IconSvgProps & {
  size?: IconResponsiveSize
  color?: IconColor
  strokeWidth?: number | string
  children: ReactNode
}

export function InlineIcon({
  size,
  color = "currentColor",
  strokeWidth = 1.5,
  children,
  ...props
}: InlineIconProps) {
  return (
    <IconBase
      size={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </IconBase>
  )
}
