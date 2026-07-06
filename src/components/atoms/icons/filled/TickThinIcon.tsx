import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type TickThinIconProps = Omit<FilledIconProps, "children">

export function TickThinIcon({ color = "currentColor", ...props }: TickThinIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <g clipPath="url(#clip0_149_38)">
        <path
          d="M20.3848 3.62024C21.2118 2.79325 22.5528 2.79325 23.3798 3.62024C24.2067 4.44723 24.2067 5.78818 23.3798 6.61517L9.7916 20.2033C8.96462 21.0303 7.62366 21.0303 6.79668 20.2033L0.620241 14.0269C-0.206747 13.1999 -0.206747 11.859 0.620241 11.032C1.44723 10.205 2.78818 10.205 3.61517 11.032L8.29414 15.7109L20.3848 3.62024Z"
         
        />
      </g>
      <defs>
        <clipPath id="clip0_149_38">
          <rect width="24" height="24" rx="3" fill="white" />
        </clipPath>
      </defs>
    </FilledIcon>
  )
}
