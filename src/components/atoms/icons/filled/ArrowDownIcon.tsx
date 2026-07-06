import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type ArrowDownIconProps = Omit<FilledIconProps, "children">

export function ArrowDownIcon({ color = "currentColor", ...props }: ArrowDownIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.25C12.4142 4.25 12.75 4.58579 12.75 5V17.1893L18.4697 11.4697C18.7626 11.1768 19.2374 11.1768 19.5303 11.4697C19.8232 11.7626 19.8232 12.2374 19.5303 12.5303L12.5303 19.5303C12.2374 19.8232 11.7626 19.8232 11.4697 19.5303L4.46967 12.5303C4.17678 12.2374 4.17678 11.7626 4.46967 11.4697C4.76256 11.1768 5.23744 11.1768 5.53033 11.4697L11.25 17.1893V5C11.25 4.58579 11.5858 4.25 12 4.25Z"
       
      />
    </FilledIcon>
  )
}
