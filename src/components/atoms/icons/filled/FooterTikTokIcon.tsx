import { FilledIcon, type FilledIconProps } from '../FilledIcon';

export type FooterTikTokIconProps = Omit<FilledIconProps, 'children'>;

export function FooterTikTokIcon({ color = 'currentColor', ...props }: FooterTikTokIconProps) {
  return (
    <FilledIcon viewBox="0 0 24 24" color={color} {...props}>
      <path d="M17.8673 3.76C16.9956 2.71937 16.5152 1.3832 16.5153 0H12.574V16.5333C12.5442 17.4283 12.1831 18.2761 11.5667 18.898C10.9504 19.5199 10.127 19.8672 9.27041 19.8667C7.45918 19.8667 5.95408 18.32 5.95408 16.4C5.95408 14.1067 8.07143 12.3867 10.2526 13.0933V8.88C5.85204 8.26667 2 11.84 2 16.4C2 20.84 5.52041 24 9.25765 24C13.2628 24 16.5153 20.6 16.5153 16.4V8.01333C18.1135 9.21313 20.0324 9.85686 22 9.85333V5.73333C22 5.73333 19.602 5.85333 17.8673 3.76Z" />
    </FilledIcon>
  );
}
