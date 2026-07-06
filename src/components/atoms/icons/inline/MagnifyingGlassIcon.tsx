import { InlineIcon, type InlineIconProps } from "../InlineIcon"

export type MagnifyingGlassIconProps = Omit<InlineIconProps, "children">

export function MagnifyingGlassIcon(props: MagnifyingGlassIconProps) {
  return (
    <InlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" />
      <path d="M15.8034 15.8034L21 21" />
    </InlineIcon>
  )
}
