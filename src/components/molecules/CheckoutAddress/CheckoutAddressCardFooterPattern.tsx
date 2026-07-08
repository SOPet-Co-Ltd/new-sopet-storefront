import { cn } from '@/lib/utils';

const PATTERN_SEGMENT_COUNT = 80;

type CheckoutAddressCardFooterPatternProps = {
  className?: string;
};

export function CheckoutAddressCardFooterPattern({
  className,
}: CheckoutAddressCardFooterPatternProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute -bottom-[3px] left-0 flex h-[6px] w-full gap-sop-12px overflow-hidden',
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: PATTERN_SEGMENT_COUNT }, (_, index) => (
        <div
          key={index}
          className={cn(
            'h-full w-[36px] shrink-0',
            index % 2 === 0 ? 'bg-sop-primary-500' : 'bg-sop-secondary-500',
            index === PATTERN_SEGMENT_COUNT - 1 ? 'rounded-r-sop-8px' : undefined,
          )}
        />
      ))}
    </div>
  );
}
