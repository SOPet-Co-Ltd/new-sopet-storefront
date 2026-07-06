import { IconBase } from "../IconBase"
import type { IconColor, IconResponsiveSize, IconSvgProps } from "../types"

export type ProfileIconProps = IconSvgProps & {
  size?: IconResponsiveSize
  color?: IconColor
}

export function ProfileIcon({ color = "currentColor", ...props }: ProfileIconProps) {
  return (
    <IconBase viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.75C9.65279 3.75 7.75 5.65279 7.75 8C7.75 10.3472 9.65279 12.25 12 12.25C14.3472 12.25 16.25 10.3472 16.25 8C16.25 5.65279 14.3472 3.75 12 3.75Z"
        stroke={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.81282 14.8128C7.45376 13.1719 9.67936 12.25 12 12.25C14.3206 12.25 16.5462 13.1719 18.1872 14.8128C19.8281 16.4538 20.75 18.6794 20.75 21C20.75 21.4142 20.4142 21.75 20 21.75C19.5858 21.75 19.25 21.4142 19.25 21C19.25 19.0772 18.4862 17.2331 17.1265 15.8735C15.7669 14.5138 13.9228 13.75 12 13.75C10.0772 13.75 8.23311 14.5138 6.87348 15.8735C5.51384 17.2331 4.75 19.0772 4.75 21C4.75 21.4142 4.41421 21.75 4 21.75C3.58579 21.75 3.25 21.4142 3.25 21C3.25 18.6794 4.17187 16.4538 5.81282 14.8128Z"
        fill={color}
      />
    </IconBase>
  )
}
