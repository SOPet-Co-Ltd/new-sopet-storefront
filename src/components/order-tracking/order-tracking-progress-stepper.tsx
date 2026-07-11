import { CheckIcon } from '@/components/atoms/icons';
import {
  ORDER_TRACKING_STEPS,
  getOrderTrackingActiveStep,
} from '@/lib/order-tracking/order-tracking-progress';
import { cn } from '@/lib/utils';

type OrderTrackingProgressStepperProps = {
  status: string;
};

export function OrderTrackingProgressStepper({ status }: OrderTrackingProgressStepperProps) {
  const activeStep = getOrderTrackingActiveStep(status);

  return (
    <ol
      className="grid grid-cols-4 gap-1"
      aria-label="ความคืบหน้าคำสั่งซื้อ"
      data-testid="order-tracking-progress"
    >
      {ORDER_TRACKING_STEPS.map((step, index) => {
        const isComplete = activeStep >= index;
        const isCurrent = activeStep === index;

        return (
          <li key={step.key} className="flex flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    'h-0.5 flex-1 rounded-full',
                    activeStep >= index ? 'bg-sop-primary-500' : 'bg-sop-neutral-grayalpha-200',
                  )}
                />
              ) : (
                <span className="flex-1" aria-hidden />
              )}
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isComplete
                    ? 'border-sop-primary-500 bg-sop-primary-500 text-sop-base-white'
                    : 'border-sop-neutral-grayalpha-200 bg-sop-base-white text-sop-neutral-gray-400',
                  isCurrent && 'ring-4 ring-sop-primary-100',
                )}
              >
                {isComplete ? (
                  <CheckIcon size={{ mobile: 14 }} color="#FFFFFF" />
                ) : (
                  <span className="sop-body-2xs-medium">{index + 1}</span>
                )}
              </span>
              {index < ORDER_TRACKING_STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'h-0.5 flex-1 rounded-full',
                    activeStep > index ? 'bg-sop-primary-500' : 'bg-sop-neutral-grayalpha-200',
                  )}
                />
              ) : (
                <span className="flex-1" aria-hidden />
              )}
            </div>
            <span
              className={cn(
                'sop-body-2xs-medium leading-tight',
                isComplete || isCurrent ? 'text-sop-primary-600' : 'text-sop-neutral-gray-400',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
