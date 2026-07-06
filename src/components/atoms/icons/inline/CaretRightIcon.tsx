import { InlineIcon, type InlineIconProps } from "../InlineIcon"

export type CaretRightIconProps = Omit<InlineIconProps, "children">

export function CaretRightIcon(props: CaretRightIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M8.25 5.25L15.75 12.75L8.25 20.25" />
    </InlineIcon>
  )
}
