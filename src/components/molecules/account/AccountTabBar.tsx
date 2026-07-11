'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AccountTabItem = {
  id: string;
  label: string;
};

type AccountTabBarProps = {
  tabs: AccountTabItem[];
  ariaLabel: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (tabId: string) => void;
  children?: ReactNode;
  className?: string;
};

export function AccountTabBar({
  tabs,
  ariaLabel,
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: AccountTabBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? tabs[0]?.id ?? '');
  const activeTab = value ?? uncontrolledValue;

  const handleSelect = (tabId: string) => {
    if (value === undefined) {
      setUncontrolledValue(tabId);
    }
    onValueChange?.(tabId);
  };

  return (
    <div className={className}>
      <div
        aria-label={ariaLabel}
        className="inline-flex rounded-sop-8px bg-sop-neutral-gray-500 p-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          const tabId = `account-tab-${tab.id}`;
          const panelId = `account-tabpanel-${tab.id}`;

          return (
            <button
              key={tab.id}
              aria-controls={panelId}
              aria-selected={selected}
              className={cn(
                'rounded-sop-8px px-4 py-2 sop-body-sm-regular transition-colors',
                selected
                  ? 'bg-sop-base-white text-sop-neutral-gray-200 shadow-sm'
                  : 'text-sop-neutral-gray-300',
              )}
              id={tabId}
              onClick={() => handleSelect(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {children ? (
        <div
          aria-labelledby={`account-tab-${activeTab}`}
          className="mt-4"
          id={`account-tabpanel-${activeTab}`}
          role="tabpanel"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
