'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarIcon } from '@/components/atoms/icons';
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from '@/components/atoms/icons/inline';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';
import {
  getCalendarDays,
  getThaiMonthLabels,
  getYearRange,
  isDateInRange,
  parseDateInputValue,
  THAI_WEEKDAY_LABELS,
} from '@/lib/datetime/calendarUtils';
import { cn } from '@/lib/utils';

type DatePickerState = 'default' | 'error';

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  isRequired?: boolean;
  description?: string;
  state?: DatePickerState;
  variant?: 'flat' | 'bordered' | 'underlined';
  className?: string;
  id?: string;
  'data-testid'?: string;
};

function getDisplayValue(value: string, placeholder: string): string {
  if (!value.trim()) return placeholder;
  return formatThaiDate(value);
}

function clampViewMonth(year: number, month: number, min?: string, max?: string) {
  const minParts = min ? parseDateInputValue(min) : null;
  const maxParts = max ? parseDateInputValue(max) : null;

  let nextYear = year;
  let nextMonth = month;

  if (
    minParts &&
    (nextYear < minParts.year || (nextYear === minParts.year && nextMonth < minParts.month))
  ) {
    nextYear = minParts.year;
    nextMonth = minParts.month;
  }

  if (
    maxParts &&
    (nextYear > maxParts.year || (nextYear === maxParts.year && nextMonth > maxParts.month))
  ) {
    nextYear = maxParts.year;
    nextMonth = maxParts.month;
  }

  return { year: nextYear, month: nextMonth };
}

export function DatePicker({
  value,
  onChange,
  title,
  placeholder = 'เลือกวันที่',
  min,
  max,
  disabled = false,
  isRequired = false,
  description,
  state = 'default',
  variant = 'bordered',
  className,
  id,
  'data-testid': dataTestId,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const parsedValue = parseDateInputValue(value);
  const todayParts = parseDateInputValue(max ?? new Date().toISOString().slice(0, 10));
  const initialView = parsedValue ??
    todayParts ?? { year: new Date().getUTCFullYear(), month: 1, day: 1 };

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const monthLabels = useMemo(() => getThaiMonthLabels(viewYear), [viewYear]);
  const yearOptions = useMemo(() => getYearRange(min, max), [min, max]);
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePanel, open]);

  const setView = (year: number, month: number) => {
    const clamped = clampViewMonth(year, month, min, max);
    setViewYear(clamped.year);
    setViewMonth(clamped.month);
  };

  const handlePreviousMonth = () => {
    if (viewMonth === 1) {
      setView(viewYear - 1, 12);
      return;
    }
    setView(viewYear, viewMonth - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setView(viewYear + 1, 1);
      return;
    }
    setView(viewYear, viewMonth + 1);
  };

  const isError = state === 'error';
  const hasValue = Boolean(value.trim());
  const calendarId = `${fieldId}-calendar`;

  const handleToggle = () => {
    if (disabled) return;
    if (!open && parsedValue) {
      const clamped = clampViewMonth(parsedValue.year, parsedValue.month, min, max);
      setViewYear(clamped.year);
      setViewMonth(clamped.month);
    }
    setOpen((current) => !current);
  };

  const variantClasses = {
    flat: 'bg-sop-neutral-gray-500 border border-solid border-sop-neutral-gray-500',
    bordered: 'bg-transparent border border-solid border-sop-neutral-gray-400',
    underlined: 'bg-transparent border-b border-solid border-sop-neutral-gray-400 rounded-none',
  } as const;

  return (
    <div ref={rootRef} className={cn('relative w-full', className)} data-testid={dataTestId}>
      {title ? (
        <label
          htmlFor={fieldId}
          className="mb-2 flex items-center gap-1 sop-body-xs-medium text-sop-neutral-gray-300"
        >
          {title}
          {isRequired ? <span className="text-sop-system-error-400">*</span> : null}
        </label>
      ) : null}

      <button
        id={fieldId}
        type="button"
        role="combobox"
        disabled={disabled}
        data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        aria-invalid={isError || undefined}
        aria-describedby={description ? descriptionId : undefined}
        onClick={handleToggle}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-[8px] px-3 text-left sop-body-sm-regular transition-all duration-150',
          'focus:border-sop-primary-500 focus:outline-none focus:ring-1 focus:ring-sop-primary-500',
          variantClasses[variant],
          isError && 'border-sop-system-error-400 ring-1 ring-sop-system-error-400',
          disabled &&
            'cursor-not-allowed bg-sop-neutral-grayalpha-200 text-sop-neutral-gray-400 border-sop-neutral-grayalpha-300',
          !disabled && !hasValue && 'text-sop-neutral-gray-400',
          !disabled && hasValue && 'text-sop-base-black',
        )}
      >
        <span className="min-w-0 truncate">{getDisplayValue(value, placeholder)}</span>
        <CalendarIcon
          size={{ mobile: 16, desktop: 16 }}
          color="currentColor"
          className="shrink-0 text-sop-neutral-gray-400"
        />
      </button>

      {description ? (
        <p
          id={descriptionId}
          className={cn(
            'mt-1 text-xs',
            isError ? 'text-sop-system-error-400' : 'text-sop-neutral-gray-400',
          )}
        >
          {description}
        </p>
      ) : null}

      {open ? (
        <div
          id={calendarId}
          role="dialog"
          aria-label={title ?? 'เลือกวันที่'}
          className="absolute left-0 z-30 mt-2 w-[min(100%,17.5rem)] rounded-sop-12px border border-sop-neutral-grayalpha-300 bg-sop-base-white p-3 shadow-lg sm:p-4"
        >
          <div className="mb-3 flex items-center gap-1 sm:mb-4 sm:gap-2">
            <button
              type="button"
              aria-label="เดือนก่อนหน้า"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sop-neutral-gray-300 hover:bg-sop-neutral-gray-500 sm:h-8 sm:w-8"
              onClick={handlePreviousMonth}
            >
              <CaretLeftIcon size={{ mobile: 14, desktop: 16 }} />
            </button>

            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1 sm:gap-2">
              <label className="sr-only" htmlFor={`${fieldId}-month`}>
                เดือน
              </label>
              <div className="relative min-w-0">
                <select
                  id={`${fieldId}-month`}
                  value={viewMonth}
                  className="h-8 w-full appearance-none truncate rounded-sop-8px border border-sop-neutral-grayalpha-300 bg-sop-base-white py-0 pl-2 pr-6 text-[11px] leading-tight text-sop-neutral-gray-200 sm:h-9 sm:pl-2.5 sm:pr-7 sm:sop-body-xs-regular"
                  onChange={(event) => setView(viewYear, Number(event.target.value))}
                >
                  {monthLabels.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
                <CaretDownIcon
                  aria-hidden
                  size={{ mobile: 12, desktop: 12 }}
                  className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-sop-neutral-gray-400 sm:right-2"
                />
              </div>

              <label className="sr-only" htmlFor={`${fieldId}-year`}>
                ปี
              </label>
              <div className="relative min-w-0">
                <select
                  id={`${fieldId}-year`}
                  value={viewYear}
                  className="h-8 w-full appearance-none rounded-sop-8px border border-sop-neutral-grayalpha-300 bg-sop-base-white py-0 pl-2 pr-6 text-[11px] leading-tight text-sop-neutral-gray-200 sm:h-9 sm:pl-2.5 sm:pr-7 sm:sop-body-xs-regular"
                  onChange={(event) => setView(Number(event.target.value), viewMonth)}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  ))}
                </select>
                <CaretDownIcon
                  aria-hidden
                  size={{ mobile: 12, desktop: 12 }}
                  className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-sop-neutral-gray-400 sm:right-2"
                />
              </div>
            </div>

            <button
              type="button"
              aria-label="เดือนถัดไป"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sop-neutral-gray-300 hover:bg-sop-neutral-gray-500 sm:h-8 sm:w-8"
              onClick={handleNextMonth}
            >
              <CaretRightIcon size={{ mobile: 14, desktop: 16 }} />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-1" aria-hidden="true">
            {THAI_WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="py-1 text-center sop-body-xs-medium text-sop-neutral-gray-400"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1" role="grid" aria-label="ปฏิทิน">
            {calendarDays.map((cell, index) => {
              if (!cell.date || cell.day === null) {
                return <span key={`empty-${index}`} className="h-8 sm:h-9" aria-hidden="true" />;
              }

              const isSelected = cell.date === value;
              const isDisabled = !isDateInRange(cell.date, min, max);

              return (
                <button
                  key={cell.date}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  disabled={isDisabled}
                  className={cn(
                    'flex h-8 items-center justify-center rounded-full text-[11px] leading-none transition-colors sm:h-9 sm:sop-body-xs-regular',
                    isSelected
                      ? 'bg-sop-primary-500 text-sop-neutral-grayfixed-600'
                      : 'text-sop-neutral-gray-200 hover:bg-sop-primary-50',
                    isDisabled &&
                      'cursor-not-allowed text-sop-neutral-gray-400 hover:bg-transparent',
                  )}
                  onClick={() => {
                    onChange(cell.date ?? '');
                    closePanel();
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {hasValue ? (
            <div className="mt-3 flex justify-end border-t border-sop-neutral-grayalpha-200 pt-2.5 sm:mt-4 sm:pt-3">
              <button
                type="button"
                className="sop-body-xs-medium text-sop-secondary-500 hover:text-sop-secondary-600"
                onClick={() => {
                  onChange('');
                  closePanel();
                }}
              >
                ล้างวันที่
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
