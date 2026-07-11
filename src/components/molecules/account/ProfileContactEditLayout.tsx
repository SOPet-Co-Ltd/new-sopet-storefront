'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { AccountBackLink } from '@/components/molecules/account/AccountBackLink';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { cn } from '@/lib/utils';

export type ProfileContactEditStep = {
  current: number;
  steps: readonly string[];
};

export type ProfileContactCurrentValue = {
  label: string;
  value: string;
};

type ProfileContactEditLayoutProps = {
  icon: ReactNode;
  description?: string;
  currentValue?: ProfileContactCurrentValue;
  steps?: ProfileContactEditStep;
  children: ReactNode;
};

function ProfileStepIndicator({ current, steps }: ProfileContactEditStep) {
  return (
    <ol
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
      aria-label="ขั้นตอนการดำเนินการ"
    >
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === current;
        const isComplete = stepNumber < current;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full sop-body-xs-medium',
                isActive && 'bg-sop-primary-500 text-sop-neutral-grayfixed-600',
                isComplete && 'bg-sop-primary-200 text-sop-primary-600',
                !isActive &&
                  !isComplete &&
                  'bg-sop-neutral-grayalpha-200 text-sop-neutral-gray-400',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                'sop-body-xs-medium',
                isActive ? 'text-sop-neutral-gray-200' : 'text-sop-neutral-gray-400',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ProfileContactEditLayout({
  icon,
  description,
  currentValue,
  steps,
  children,
}: ProfileContactEditLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <AccountBackLink href="/user/profile" label="กลับไปข้อมูลส่วนตัว" />

      <AccountCard padding="md" className="w-full">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sop-primary-50 text-sop-primary-500 [&_svg]:h-5 [&_svg]:w-5">
            {icon}
          </span>
          {description ? (
            <p className="pt-2 sop-body-sm-regular text-sop-neutral-gray-400">{description}</p>
          ) : null}
        </div>

        {steps ? <ProfileStepIndicator current={steps.current} steps={steps.steps} /> : null}

        {currentValue ? (
          <div className="mb-5 rounded-sop-8px bg-sop-primary-50 px-4 py-3">
            <p className="sop-body-xs-regular text-sop-neutral-gray-400">{currentValue.label}</p>
            <p className="mt-0.5 sop-body-sm-medium text-sop-neutral-gray-200">
              {currentValue.value}
            </p>
          </div>
        ) : null}

        {children}
      </AccountCard>
    </div>
  );
}

type ProfileFormActionsProps = {
  submitLabel: string;
  loading?: boolean;
  disabled?: boolean;
  cancelHref?: string;
  cancelLabel?: string;
  secondaryAction?: ReactNode;
};

export function ProfileFormActions({
  submitLabel,
  loading = false,
  disabled = false,
  cancelHref = '/user/profile',
  cancelLabel = 'ยกเลิก',
  secondaryAction,
}: ProfileFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      {secondaryAction}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="w-full sm:w-auto">
          <Button type="button" variant="outline" className="w-full sm:min-w-[100px]">
            {cancelLabel}
          </Button>
        </Link>
        <Button
          type="submit"
          fill
          loading={loading}
          disabled={disabled}
          className="w-full sm:max-w-xs"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
