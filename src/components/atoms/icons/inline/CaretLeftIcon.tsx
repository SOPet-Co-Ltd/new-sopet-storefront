import { InlineIcon, type InlineIconProps } from "../InlineIcon"

export type CaretLeftIconProps = Omit<InlineIconProps, "children">

export function CaretLeftIcon(props: CaretLeftIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M15.75 20.25L8.25 12.75L15.75 5.25" />
    </InlineIcon>
  )
}
