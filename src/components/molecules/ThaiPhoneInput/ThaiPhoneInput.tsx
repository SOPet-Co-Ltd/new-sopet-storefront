'use client';

import { Input, type InputProps } from '@/components/atoms/Input';
import { formatThaiPhoneInputMask, sanitizeThaiPhoneInput } from '@/lib/helpers/phone';

type ThaiPhoneInputProps = Omit<InputProps, 'type' | 'value' | 'onChange' | 'startIcon'> & {
  value?: string | null;
  onValueChange?: (value: string) => void;
};

export function ThaiPhoneInput({
  value,
  onValueChange,
  placeholder = '000-000-0000',
  inputMode = 'numeric',
  autoComplete = 'tel-national',
  className,
  ...props
}: ThaiPhoneInputProps) {
  return (
    <Input
      {...props}
      type="tel"
      value={formatThaiPhoneInputMask(value)}
      onChange={(event) => {
        onValueChange?.(sanitizeThaiPhoneInput(event.target.value));
      }}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      className={className}
    />
  );
}
