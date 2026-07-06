import { FilledIcon, type FilledIconProps } from "../FilledIcon"

export type MoonIconProps = Omit<FilledIconProps, "children">

export function MoonIcon({ color = "currentColor", ...props }: MoonIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.355 3.91566C9.31038 4.12823 8.3116 4.54232 7.41655 5.14038C6.05984 6.0469 5.00242 7.33537 4.378 8.84286C3.75358 10.3504 3.5902 12.0092 3.90853 13.6095C4.22685 15.2098 5.01259 16.6798 6.16637 17.8336C7.32016 18.9874 8.79017 19.7732 10.3905 20.0915C11.9909 20.4098 13.6497 20.2464 15.1571 19.622C16.6646 18.9976 17.9531 17.9402 18.8596 16.5835C19.4577 15.6884 19.8718 14.6896 20.0843 13.645C19.0056 14.2742 17.7703 14.614 16.5 14.614C14.6133 14.614 12.8038 13.8645 11.4697 12.5303C10.1355 11.1962 9.38604 9.38674 9.38604 7.5C9.38604 6.2297 9.7258 4.99442 10.355 3.91566Z"
       
      />
    </FilledIcon>
  )
}
