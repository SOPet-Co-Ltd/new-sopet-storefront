import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type SettingsIconProps = Omit<FilledIconProps, "children">

export function SettingsIcon({ color = "currentColor", ...props }: SettingsIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7544 9.50977C10.5144 9.50977 9.50439 10.5198 9.50439 11.7598C9.50439 12.9998 10.5144 14.0098 11.7544 14.0098C12.9944 14.0098 14.0044 12.9998 14.0044 11.7598C14.0044 10.5198 12.9944 9.50977 11.7544 9.50977ZM8.00439 11.7598C8.00439 9.68977 9.68439 8.00977 11.7544 8.00977C13.8244 8.00977 15.5044 9.68977 15.5044 11.7598C15.5044 13.8298 13.8244 15.5098 11.7544 15.5098C9.68439 15.5098 8.00439 13.8298 8.00439 11.7598Z"
       
      />
    </FilledIcon>
  )
}
