import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type SofaIconProps = Omit<FilledIconProps, "children">

export function SofaIcon({ color = "currentColor", ...props }: SofaIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25H18C18.7293 3.25 19.4288 3.53973 19.9445 4.05546C20.4603 4.57118 20.75 5.27065 20.75 6V9C20.75 9.41421 20.4142 9.75 20 9.75C19.5858 9.75 19.25 9.41421 19.25 9V6C19.25 5.66848 19.1183 5.35054 18.8839 5.11612C18.6495 4.8817 18.3315 4.75 18 4.75H6C5.66848 4.75 5.35054 4.8817 5.11612 5.11612C4.8817 5.35054 4.75 5.66848 4.75 6V9C4.75 9.41421 4.41421 9.75 4 9.75C3.58579 9.75 3.25 9.41421 3.25 9V6C3.25 5.27065 3.53973 4.57118 4.05546 4.05546Z"
       
      />
    </FilledIcon>
  )
}
