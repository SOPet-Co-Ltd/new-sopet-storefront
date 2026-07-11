'use client';

import { cn } from '@/lib/utils';
import { useMemo, useState, useCallback, useId } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons/inline';

type InputState = 'default' | 'hover' | 'hovered' | 'filled' | 'selected' | 'disabled' | 'error';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'md' | 'sm';
  state?: InputState;
  variant?: 'flat' | 'bordered' | 'underlined';
  textSize?: 'sm' | 'xs';

  title?: string;
  hasTitle?: boolean;
  isRequire?: boolean;
  isRequired?: boolean;

  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  hasStartIcon?: boolean;
  hasEndIcon?: boolean;

  description?: string;
  descriptionText?: string;
  withDescription?: boolean;
}

export function Input({
  size = 'md',
  state = 'default',
  variant = 'flat',
  textSize = 'sm',
  title,
  hasTitle,
  isRequire = false,
  isRequired = false,
  startIcon,
  endIcon,
  hasStartIcon,
  hasEndIcon,
  description,
  descriptionText,
  withDescription = false,
  className,
  id,
  type = 'text',
  disabled,
  placeholder,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();
  const finalId = id || inputId;

  const resolvedState = state === 'hover' ? 'hovered' : state;
  const isError = resolvedState === 'error';
  const isDisabled = disabled || resolvedState === 'disabled';
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const required = isRequired || isRequire;

  const resolvedTitle = title;
  const showTitle = hasTitle !== false && (resolvedTitle !== undefined || hasTitle === true);

  const showStartIcon = !!startIcon && (hasStartIcon !== false || hasStartIcon === undefined);
  const showEndIcon =
    !!endIcon && !isPassword && (hasEndIcon !== false || hasEndIcon === undefined);

  const resolvedDescription = description ?? descriptionText;
  const showDescription = withDescription || resolvedDescription !== undefined;

  const paddingClasses = useMemo(() => {
    const left = showStartIcon ? 'pl-10' : 'pl-3';
    const right = showEndIcon || isPassword ? 'pr-10' : 'pr-3';
    return { left, right };
  }, [showStartIcon, showEndIcon, isPassword]);

  const sizeClasses = {
    sm: 'text-xs h-8',
    md: 'text-sm h-10',
  } as const;

  const textSizeClasses = {
    sm: 'sop-body-sm-regular',
    xs: 'sop-body-xs-regular',
  } as const;

  const variantClasses = {
    flat: 'bg-sop-neutral-gray-500 border border-solid border-sop-neutral-gray-500',
    bordered: 'bg-transparent border border-solid border-sop-neutral-gray-400',
    underlined: 'bg-transparent border-b border-solid border-sop-neutral-gray-400 rounded-none',
  } as const;

  const stateClasses = {
    default: '',
    hovered: 'border-sop-neutral-grayalpha-300',
    filled: 'border-sop-neutral-grayalpha-300',
    selected: 'border-sop-primary-500 ring-1 ring-sop-primary-500',
    disabled:
      'bg-sop-neutral-grayalpha-200 cursor-not-allowed text-sop-neutral-gray-400 border-sop-neutral-grayalpha-300',
    error: 'border-sop-system-error-400 ring-1 ring-sop-system-error-400',
  } as const;

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const inputClassName = cn(
    'w-full p-2 rounded-[8px]',
    textSizeClasses[textSize],
    'text-sop-base-black',
    'focus:border-sop-primary-500 focus:outline-none focus:ring-1 focus:ring-sop-primary-500',
    'placeholder:text-sop-neutral-gray-400',
    'transition-all duration-150',
    sizeClasses[size],
    variantClasses[variant],
    stateClasses[resolvedState],
    isError && !isDisabled && 'border-sop-system-error-400 ring-1 ring-sop-system-error-400',
    isDisabled &&
      'bg-sop-neutral-grayalpha-200 cursor-not-allowed text-sop-neutral-gray-400 border-sop-neutral-grayalpha-300',
    paddingClasses.left,
    paddingClasses.right,
    className,
  );

  return (
    <div className="w-full">
      {showTitle && resolvedTitle && (
        <label
          htmlFor={finalId}
          className="sop-body-xs-medium text-sop-neutral-gray-300 flex items-center gap-1 mb-2"
        >
          {resolvedTitle}
          {required && <span className="text-sop-system-error-400">*</span>}
        </label>
      )}

      <div className="relative w-full">
        {showStartIcon && (
          <span className="absolute top-0 left-3 h-full flex items-center text-sop-neutral-gray-400 pointer-events-none">
            {startIcon}
          </span>
        )}

        <input
          {...props}
          id={finalId}
          type={actualType}
          className={inputClassName}
          disabled={isDisabled}
          placeholder={placeholder}
        />

        {showEndIcon && (
          <span className="absolute top-0 right-3 h-full flex items-center text-sop-neutral-gray-400 pointer-events-none">
            {endIcon}
          </span>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sop-neutral-gray-400 hover:text-sop-neutral-gray-300 focus:outline-none transition-all duration-150"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        )}
      </div>

      {showDescription && resolvedDescription && (
        <p
          id={`${finalId}-description`}
          className={cn(
            'text-xs mt-1',
            isError ? 'text-sop-system-error-400' : 'text-sop-neutral-gray-400',
          )}
        >
          {resolvedDescription}
        </p>
      )}
    </div>
  );
}
