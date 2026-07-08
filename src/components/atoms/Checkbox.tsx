'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
};

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  const isActive = checked || indeterminate;

  return (
    <span className={cn('relative inline-flex h-5 w-5 shrink-0', className)}>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-sop-4px border transition-colors',
          isActive
            ? 'border-sop-primary-500 bg-sop-primary-500 text-sop-base-white'
            : 'border-sop-neutral-grayalpha-300 bg-sop-base-white text-transparent',
          'peer-disabled:opacity-40',
        )}
      >
        {indeterminate && !checked ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <path d="M6 12h12" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </span>
  );
}
