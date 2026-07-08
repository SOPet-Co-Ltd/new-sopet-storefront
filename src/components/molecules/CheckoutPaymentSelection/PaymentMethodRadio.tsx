import { cn } from '@/lib/utils';

type PaymentMethodRadioProps = {
  checked: boolean;
};

export function PaymentMethodRadio({ checked }: PaymentMethodRadioProps) {
  return (
    <span
      className={cn(
        'flex h-sop-20px w-sop-20px shrink-0 items-center justify-center rounded-full border bg-sop-base-white',
        checked ? 'border-sop-primary-500' : 'border-sop-neutral-grayalpha-200',
      )}
      aria-hidden
    >
      {checked ? <span className="h-[10px] w-[10px] rounded-full bg-sop-primary-500" /> : null}
    </span>
  );
}
