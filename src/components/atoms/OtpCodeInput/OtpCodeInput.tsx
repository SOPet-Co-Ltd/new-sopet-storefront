'use client';

import { useCallback, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

type OtpCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  /** Links inputs to an external error message element (e.g. validation text). */
  ariaDescribedBy?: string;
  'data-testid'?: string;
};

function sanitizeOtpValue(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

function getDigitAt(value: string, index: number): string {
  return value[index] ?? '';
}

export function OtpCodeInput({
  value,
  onChange,
  error = false,
  disabled = false,
  ariaDescribedBy,
  'data-testid': testId,
}: OtpCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const groupId = useId();
  const sanitizedValue = sanitizeOtpValue(value);
  const describedBy = ariaDescribedBy || (error ? `${groupId}-error` : undefined);

  const focusInput = useCallback((index: number) => {
    const target = inputRefs.current[index];
    if (!target) return;
    target.focus();
    target.select();
  }, []);

  const applyValue = useCallback(
    (nextValue: string) => {
      onChange(sanitizeOtpValue(nextValue));
    },
    [onChange],
  );

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;

    if (digits.length > 1) {
      const nextValue = (
        sanitizedValue.slice(0, index) + digits + sanitizedValue.slice(index + digits.length)
      ).slice(0, OTP_LENGTH);
      applyValue(nextValue);
      focusInput(Math.min(index + digits.length, OTP_LENGTH) - 1);
      return;
    }

    const digit = digits.slice(-1);
    const nextValue = (
      sanitizedValue.slice(0, index) + digit + sanitizedValue.slice(index + 1)
    ).slice(0, OTP_LENGTH);
    applyValue(nextValue);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();

      const currentDigit = getDigitAt(sanitizedValue, index);
      if (currentDigit) {
        applyValue(sanitizedValue.slice(0, index) + sanitizedValue.slice(index + 1));
        focusInput(index);
        return;
      }

      if (index > 0) {
        const prevIndex = index - 1;
        applyValue(sanitizedValue.slice(0, prevIndex) + sanitizedValue.slice(prevIndex + 1));
        focusInput(prevIndex);
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = sanitizeOtpValue(event.clipboardData.getData('text'));
    if (!pasted) return;

    applyValue(pasted);
    focusInput(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  return (
    <div data-testid={testId} className="w-full">
      <div
        id={groupId}
        className="flex justify-between gap-sop-8px"
        role="group"
        aria-label="รหัส OTP 6 หลัก"
        aria-required="true"
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
      >
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={index < OTP_LENGTH - 1 ? 'next' : 'done'}
            disabled={disabled}
            aria-label={`รหัส OTP หลักที่ ${index + 1} จาก ${OTP_LENGTH}`}
            aria-invalid={error || undefined}
            data-testid={testId ? `${testId}-digit-${index + 1}` : undefined}
            value={getDigitAt(sanitizedValue, index)}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              'h-12 min-h-12 w-full min-w-12 max-w-[52px] touch-manipulation rounded-sop-12px border bg-sop-base-white text-center sop-headline-sm-medium text-sop-neutral-gray-200',
              'transition-all duration-150',
              'focus:border-sop-primary-500 focus:outline-none focus:ring-1 focus:ring-sop-primary-500',
              error
                ? 'border-sop-system-error-400 ring-1 ring-sop-system-error-400'
                : 'border-sop-neutral-grayalpha-300',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          />
        ))}
      </div>
      {error && !ariaDescribedBy ? (
        <span id={`${groupId}-error`} className="sr-only">
          รหัส OTP ไม่ถูกต้อง
        </span>
      ) : null}
    </div>
  );
}
