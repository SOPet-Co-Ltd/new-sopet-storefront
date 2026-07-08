'use client';

import { Input } from '@/components/atoms/Input';
import { ThaiPhoneInput } from '@/components/molecules/ThaiPhoneInput';
import type { GuestCheckoutField } from '@/lib/checkout/guestCheckoutValidation';
import { EmailPromoInfoTag } from './EmailPromoInfoTag';

type CheckoutContactSectionProps = {
  contactPhone: string;
  email: string;
  onContactPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  errors?: Partial<Pick<Record<GuestCheckoutField, string>, 'guestPhone' | 'email'>>;
  showErrors?: boolean;
};

export function CheckoutContactSection({
  contactPhone,
  email,
  onContactPhoneChange,
  onEmailChange,
  errors,
  showErrors = false,
}: CheckoutContactSectionProps) {
  const guestPhoneError = showErrors ? errors?.guestPhone : undefined;
  const emailError = showErrors ? errors?.email : undefined;

  return (
    <section
      role="group"
      aria-labelledby="checkout-contact-heading"
      data-testid="checkout-contact-section"
    >
      <h3
        id="checkout-contact-heading"
        className="mb-sop-12px sop-body-xs-medium text-sop-neutral-gray-200 lg:sop-body-sm-medium"
      >
        การติดต่อ
      </h3>

      <div className="grid grid-cols-1 gap-sop-12px md:grid-cols-2">
        <ThaiPhoneInput
          title="เบอร์โทรศัพท์"
          hasTitle
          isRequired
          value={contactPhone}
          onValueChange={onContactPhoneChange}
          state={guestPhoneError ? 'error' : 'default'}
          description={guestPhoneError}
          data-testid="contact-phone-field"
        />

        <div className="min-w-0">
          <Input
            title="อีเมล"
            hasTitle
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            state={emailError ? 'error' : 'default'}
            description={emailError}
            data-testid="guest-email-field"
          />
          <EmailPromoInfoTag />
        </div>
      </div>
    </section>
  );
}
