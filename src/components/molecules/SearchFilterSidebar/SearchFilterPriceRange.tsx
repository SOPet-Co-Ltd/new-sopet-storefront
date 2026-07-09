'use client';

import { useCallback, useId } from 'react';
import { TagIcon } from '@/components/atoms/icons/filled/TagIcon';
import { cn } from '@/lib/utils';

export const SEARCH_FILTER_PRICE_MIN = 0;
export const SEARCH_FILTER_PRICE_MAX = 10_000;

type SearchFilterPriceRangeProps = {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

function clampPrice(value: number): number {
  return Math.min(SEARCH_FILTER_PRICE_MAX, Math.max(SEARCH_FILTER_PRICE_MIN, value));
}

function formatPriceLabel(value: number): string {
  return value.toLocaleString('th-TH');
}

function formatBaht(value: number): string {
  return `฿${formatPriceLabel(value)}`;
}

function parsePriceInput(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  return clampPrice(Number(digits));
}

export function SearchFilterPriceRange({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: SearchFilterPriceRangeProps) {
  const minInputId = useId();
  const maxInputId = useId();

  const minPercent =
    ((minValue - SEARCH_FILTER_PRICE_MIN) / (SEARCH_FILTER_PRICE_MAX - SEARCH_FILTER_PRICE_MIN)) *
    100;
  const maxPercent =
    ((maxValue - SEARCH_FILTER_PRICE_MIN) / (SEARCH_FILTER_PRICE_MAX - SEARCH_FILTER_PRICE_MIN)) *
    100;

  const handleMinInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parsePriceInput(event.target.value);
      if (parsed === null) {
        onMinChange(SEARCH_FILTER_PRICE_MIN);
        return;
      }
      onMinChange(Math.min(parsed, maxValue));
    },
    [maxValue, onMinChange],
  );

  const handleMaxInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parsePriceInput(event.target.value);
      if (parsed === null) {
        onMaxChange(SEARCH_FILTER_PRICE_MAX);
        return;
      }
      onMaxChange(Math.max(parsed, minValue));
    },
    [minValue, onMaxChange],
  );

  const handleMinSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = clampPrice(Number(event.target.value));
      onMinChange(Math.min(next, maxValue));
    },
    [maxValue, onMinChange],
  );

  const handleMaxSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = clampPrice(Number(event.target.value));
      onMaxChange(Math.max(next, minValue));
    },
    [minValue, onMaxChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center gap-4 px-4">
        <div className="w-[128px] shrink-0">
          <p className="sop-body-xs-light mb-0 h-[23px] text-[#7e7e7e]">
            ราคาต่ำสุด {formatPriceLabel(minValue)} บาท
          </p>
          <label htmlFor={minInputId} className="sr-only">
            ราคาต่ำสุด
          </label>
          <div className="flex h-8 items-center gap-2 rounded-sop-8 border border-sop-neutral-gray-400 px-3 py-2">
            <TagIcon size={{ mobile: 16, desktop: 16 }} color="#949495" />
            <input
              id={minInputId}
              type="text"
              inputMode="numeric"
              value={minValue === SEARCH_FILTER_PRICE_MIN ? '' : formatPriceLabel(minValue)}
              placeholder="ราคาต่ำสุด"
              onChange={handleMinInputChange}
              className="min-w-0 flex-1 bg-transparent sop-body-xs-medium text-sop-neutral-gray-200 placeholder:text-sop-neutral-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <span aria-hidden className="absolute left-1/2 top-[calc(50%+4px)] -translate-x-1/2 text-sop-neutral-gray-400">
          -
        </span>

        <div className="min-w-0 flex-1">
          <p className="sop-body-xs-light mb-0 h-[23px] text-[#7e7e7e]">
            ราคาสูงสุด {formatPriceLabel(maxValue)} บาท
          </p>
          <label htmlFor={maxInputId} className="sr-only">
            ราคาสูงสุด
          </label>
          <div className="flex h-8 items-center gap-2 rounded-sop-8 border border-sop-neutral-gray-400 px-3 py-2">
            <TagIcon size={{ mobile: 16, desktop: 16 }} color="#949495" />
            <input
              id={maxInputId}
              type="text"
              inputMode="numeric"
              value={maxValue === SEARCH_FILTER_PRICE_MAX ? '' : formatPriceLabel(maxValue)}
              placeholder="ราคาสูงสุด"
              onChange={handleMaxInputChange}
              className="min-w-0 flex-1 bg-transparent sop-body-xs-medium text-sop-neutral-gray-200 placeholder:text-sop-neutral-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between sop-body-xs-regular text-[#7e7e7e]">
          <span>{formatBaht(SEARCH_FILTER_PRICE_MIN)}</span>
          <span>{formatBaht(SEARCH_FILTER_PRICE_MAX)}</span>
        </div>

        <div className="relative h-[22px]">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-sop-neutral-grayalpha-200" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sop-secondary-500"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          <input
            type="range"
            min={SEARCH_FILTER_PRICE_MIN}
            max={SEARCH_FILTER_PRICE_MAX}
            value={minValue}
            onChange={handleMinSliderChange}
            aria-label="ราคาต่ำสุด"
            className={cn(
              'slider-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent',
              '[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto',
            )}
          />
          <input
            type="range"
            min={SEARCH_FILTER_PRICE_MIN}
            max={SEARCH_FILTER_PRICE_MAX}
            value={maxValue}
            onChange={handleMaxSliderChange}
            aria-label="ราคาสูงสุด"
            className={cn(
              'slider-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent',
              '[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto',
            )}
          />
        </div>
      </div>
    </div>
  );
}
