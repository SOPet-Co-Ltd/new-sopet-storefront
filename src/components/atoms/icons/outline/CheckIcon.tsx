import { OutlineIcon, type OutlineIconProps } from "../OutlineIcon"

export type CheckIconProps = Omit<OutlineIconProps, "children">

export function CheckIcon(props: CheckIconProps) {
  return (
    <OutlineIcon viewBox="0 0 24 24" {...props}>
      <path d="M10.1066 16.7733C9.83994 16.7733 9.58661 16.6666 9.39994 16.48L5.62661 12.7066C5.23994 12.32 5.23994 11.68 5.62661 11.2933C6.01328 10.9066 6.65328 10.9066 7.03994 11.2933L10.1066 14.36L16.9599 7.50664C17.3466 7.11998 17.9866 7.11998 18.3733 7.50664C18.7599 7.89331 18.7599 8.53331 18.3733 8.91998L10.8133 16.48C10.6266 16.6666 10.3733 16.7733 10.1066 16.7733Z" />
    </OutlineIcon>
  )
}
