'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  'aria-label'?: string;
  className?: string;
};

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  size = 'md',
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
  const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const iconClasses = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <span className={cn('relative inline-flex shrink-0', sizeClasses, className)}>
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
          'flex items-center justify-center rounded-sop-4px border transition-colors',
          sizeClasses,
          isActive
            ? 'border-sop-primary-500 bg-sop-primary-500 text-sop-base-white'
            : 'border-sop-neutral-grayalpha-300 bg-sop-base-white text-transparent',
          'peer-disabled:opacity-40',
        )}
      >
        {indeterminate && !checked ? (
          <svg viewBox="0 0 24 24" className={iconClasses} fill="none">
            <path d="M6 12h12" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className={iconClasses} fill="none">
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
