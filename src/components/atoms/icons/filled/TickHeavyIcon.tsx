import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type TickHeavyIconProps = Omit<FilledIconProps, "children">

export function TickHeavyIcon({ color = "currentColor", ...props }: TickHeavyIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.8839 5.11612C21.372 5.60427 21.372 6.39573 20.8839 6.88388L9.88388 17.8839C9.39573 18.372 8.60427 18.372 8.11612 17.8839L3.11612 12.8839C2.62796 12.3957 2.62796 11.6043 3.11612 11.1161C3.60427 10.628 4.39573 10.628 4.88388 11.1161L9 15.2322L19.1161 5.11612C19.6043 4.62796 20.3957 4.62796 20.8839 5.11612Z"
       
      />
    </FilledIcon>
  )
}
