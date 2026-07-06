import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type OpenIconProps = Omit<FilledIconProps, "children">

export function OpenIcon({ color = "currentColor", ...props }: OpenIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.75073C10.0196 5.75073 8.08376 6.33877 6.43794 7.4403C4.79701 8.53855 3.51806 10.0979 2.76211 11.9218C2.74531 11.9726 2.74531 12.0276 2.76211 12.0785C3.51806 13.9023 4.79701 15.4617 6.43794 16.5599C8.08376 17.6615 10.0196 18.2495 12 18.2495C13.9804 18.2495 15.9163 17.6615 17.5621 16.5599C19.203 15.4617 20.482 13.9023 21.2379 12.0785C21.2547 12.0276 21.2547 11.9726 21.2379 11.9217C20.482 10.0979 19.203 8.53855 17.5621 7.4403C15.9163 6.33877 13.9804 5.75073 12 5.75073Z"
       
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 9.75012C10.7574 9.75012 9.75002 10.7575 9.75002 12.0001C9.75002 13.2428 10.7574 14.2501 12 14.2501C13.2427 14.2501 14.25 13.2428 14.25 12.0001C14.25 10.7575 13.2427 9.75012 12 9.75012Z"
       
      />
    </FilledIcon>
  )
}
