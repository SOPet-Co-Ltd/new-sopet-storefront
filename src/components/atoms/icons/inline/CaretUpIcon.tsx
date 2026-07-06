import { InlineIcon, type InlineIconProps } from "../InlineIcon"

export type CaretUpIconProps = Omit<InlineIconProps, "children">

export function CaretUpIcon(props: CaretUpIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M4.5 16.5L12 9L19.5 16.5" />
    </InlineIcon>
  )
}
