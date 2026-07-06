import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type DownArrowIconProps = Omit<FilledIconProps, "children">

export function DownArrowIcon({ color = "currentColor", ...props }: DownArrowIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.25629 7.37176C1.6389 6.92538 2.31093 6.87368 2.75731 7.25629L12 15.1786L21.2427 7.25629C21.6891 6.87368 22.3611 6.92538 22.7437 7.37176C23.1263 7.81814 23.0746 8.49016 22.6282 8.87277L12.6928 17.3889C12.2941 17.7306 11.7059 17.7306 11.3072 17.3889L1.37176 8.87277C0.925378 8.49016 0.873684 7.81814 1.25629 7.37176Z"
       
      />
    </FilledIcon>
  )
}
