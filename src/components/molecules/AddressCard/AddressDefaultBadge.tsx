import { cn } from '@/lib/utils';

type AddressDefaultBadgeProps = {
  className?: string;
};

export function AddressDefaultBadge({ className }: AddressDefaultBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sop-16 bg-sop-primary-100 py-0.5 pl-2 pr-2.5 sop-body-xs-medium text-sop-primary-600',
        className,
      )}
      role="status"
      aria-label="ที่อยู่หลัก"
      data-testid="address-default-badge"
    >
      <span className="h-2 w-2 rounded-full bg-sop-primary-500" aria-hidden />
      ที่อยู่หลัก
    </span>
  );
}
