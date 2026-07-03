import type { CSSProperties, ReactNode } from "react"

import { DEFAULT_ICON_SIZE, getIconSizeStyle } from "./iconStyles"
import type { IconResponsiveSize, IconSvgProps } from "./types"

type IconBaseProps = IconSvgProps & {
  size?: IconResponsiveSize
  style?: CSSProperties
  children: ReactNode
} & Omit<
  React.SVGProps<SVGSVGElement>,
  "style" | "children" | "width" | "height"
>

export function IconBase({
  size = DEFAULT_ICON_SIZE,
  className,
  style,
  viewBox = "0 0 24 24",
  children,
  "aria-label": ariaLabel,
  ...svgProps
}: IconBaseProps) {
  return (
    <svg
      className={["vetai-icon-responsive", "inline-block", "shrink-0", className]
        .filter(Boolean)
        .join(" ")}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...getIconSizeStyle(size), ...style }}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      {...svgProps}
    >
      {children}
    </svg>
  )
}
