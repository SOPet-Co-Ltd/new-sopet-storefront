import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type EditIconProps = Omit<FilledIconProps, "children">

export function EditIcon({ color = "currentColor", ...props }: EditIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.6577 2.2945C17.327 1.62529 18.2349 1.24939 19.1814 1.24951C20.1279 1.24963 21.0356 1.62575 21.7048 2.29513C22.374 2.96451 22.7499 3.87231 22.7498 4.81884C22.7497 5.76532 22.3736 6.67298 21.7043 7.34218L8.35642 20.6921C8.03766 21.0098 7.64578 21.2445 7.21517 21.3754L2.85984 22.6961C2.64373 22.7611 2.41407 22.7664 2.19523 22.7113C1.97639 22.6563 1.77652 22.5431 1.61683 22.3837C1.45714 22.2242 1.34358 22.0245 1.28821 21.8058C1.23284 21.587 1.23772 21.3574 1.30234 21.1411L2.62427 16.7861C2.75698 16.3532 2.99292 15.9614 3.31195 15.6432L16.6577 2.2945Z"
       
      />
    </FilledIcon>
  )
}
