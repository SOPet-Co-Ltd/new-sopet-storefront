import { InlineIcon, type InlineIconProps } from "../InlineIcon"

export type CaretDownIconProps = Omit<InlineIconProps, "children">

export function CaretDownIcon(props: CaretDownIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M19.5 9L12 16.5L4.5 9" />
    </InlineIcon>
  )
}
