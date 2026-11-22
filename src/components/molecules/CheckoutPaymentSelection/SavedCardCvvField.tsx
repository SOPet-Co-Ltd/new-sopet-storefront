'use client';

import { Input } from '@/components/atoms/Input';

type SavedCardCvvFieldProps = {
  value: string;
  onChange: (next: string) => void;
  brand?: string | null;
  disabled?: boolean;
  error?: string | null;
};

export function getSavedCardCvvLength(brand?: string | null): number {
  return brand?.trim().toLowerCase() === 'amex' ? 4 : 3;
}

export function formatSavedCardCvv(value: string, brand?: string | null): string {
  return value.replace(/\D/g, '').slice(0, getSavedCardCvvLength(brand));
}

/** CVV is never stored; collect it for the selected saved card on every payment. */
export function SavedCardCvvField({
  value,
  onChange,
  brand,
  disabled = false,
  error,
}: SavedCardCvvFieldProps) {
  const length = getSavedCardCvvLength(brand);

  return (
    <div data-testid="saved-card-cvv-field">
      <Input
        isRequire
        title="รหัส CVV"
        size="md"
        variant="bordered"
        placeholder={length === 4 ? '****' : '***'}
        inputMode="numeric"
        autoComplete="cc-csc"
        data-testid="saved-card-cvv-input"
        disabled={disabled}
        state={error ? 'error' : 'default'}
        description={error ?? undefined}
        value={value}
        maxLength={length}
        onChange={(event) => onChange(formatSavedCardCvv(event.target.value, brand))}
      />
    </div>
  );
}
