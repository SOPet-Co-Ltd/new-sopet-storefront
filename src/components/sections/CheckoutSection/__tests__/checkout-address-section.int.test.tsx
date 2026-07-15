import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { graphql, HttpResponse, delay } from 'msw';
import { CheckoutAddressSection } from '@/components/sections/CheckoutSection/CheckoutAddressSection';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { preloadThaiAddressDataset } from '@/lib/thai-address';
import {
  SUB_DISTRICT_REQUIRED_MESSAGE,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { sampleSavedAddress, sampleSavedAddress2 } from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

const EMPTY_GUEST_FORM: GuestCheckoutFormState = {
  contactPhone: '',
  recipientFullName: '',
  recipientPhone: '',
  address: '',
  district: '',
  subDistrict: '',
  province: '',
  postalCode: '',
  email: '',
};

const ApolloTestWrapper = createApolloTestWrapper();

function renderCheckoutAddressSection({
  guestForm = EMPTY_GUEST_FORM,
  onGuestFormChange = vi.fn(),
  fieldErrors,
  showFieldErrors = false,
  saveAddressChecked = false,
  onSaveAddressPreferenceChange = vi.fn(),
}: {
  guestForm?: GuestCheckoutFormState;
  onGuestFormChange?: (field: keyof GuestCheckoutFormState, value: string) => void;
  fieldErrors?: Partial<Record<string, string>>;
  showFieldErrors?: boolean;
  saveAddressChecked?: boolean;
  onSaveAddressPreferenceChange?: (checked: boolean) => void;
} = {}) {
  return render(
    <ApolloTestWrapper>
      <CheckoutProvider>
        <CheckoutAddressSection
          guestForm={guestForm}
          onGuestFormChange={onGuestFormChange}
          fieldErrors={fieldErrors}
          showFieldErrors={showFieldErrors}
          saveAddressChecked={saveAddressChecked}
          onSaveAddressPreferenceChange={onSaveAddressPreferenceChange}
        />
      </CheckoutProvider>
    </ApolloTestWrapper>,
  );
}

describe('CheckoutAddressSection integration', () => {
  beforeEach(async () => {
    await preloadThaiAddressDataset();
    mockedUseAuth.mockReturnValue({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      pendingDeletion: false,
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
      changeCustomerPhone: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Test 1 — display mode resolution', () => {
    it('renders guest mode with contact and shipping sections', async () => {
      renderCheckoutAddressSection();

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-guest')).toBeInTheDocument();
      });

      expect(screen.getByTestId('checkout-contact-section')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-shipping-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-phone-field')).toBeInTheDocument();
      expect(screen.queryByTestId('address-summary')).not.toBeInTheDocument();
    });

    it('renders auth-inline mode with contact, shipping, and save checkbox', async () => {
      const onGuestFormChange = vi.fn();

      mockedUseAuth.mockReturnValue({
        customer: {
          id: 'cust-1',
          phone: '0812345678',
          email: 'user@example.com',
        } as never,
        isAuthenticated: true,
        isLoading: false,
        pendingDeletion: false,
        sendOtp: vi.fn(),
        verifyOtp: vi.fn(),
        changeCustomerPhone: vi.fn(),
        reactivateAccount: vi.fn(),
        logout: vi.fn(),
      });

      renderCheckoutAddressSection({ onGuestFormChange });

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-auth-inline')).toBeInTheDocument();
      });

      expect(screen.getByTestId('checkout-contact-section')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-shipping-section')).toBeInTheDocument();
      expect(screen.getByTestId('save-address-checkbox')).toBeInTheDocument();

      await waitFor(() => {
        expect(onGuestFormChange).toHaveBeenCalledWith('contactPhone', '0812345678');
        expect(onGuestFormChange).toHaveBeenCalledWith('recipientPhone', '0812345678');
        expect(onGuestFormChange).toHaveBeenCalledWith('email', 'user@example.com');
      });
    });

    it('renders auth-summary mode with summary card', async () => {
      mockedUseAuth.mockReturnValue({
        customer: { id: 'cust-1' } as never,
        isAuthenticated: true,
        isLoading: false,
        pendingDeletion: false,
        sendOtp: vi.fn(),
        verifyOtp: vi.fn(),
        changeCustomerPhone: vi.fn(),
        reactivateAccount: vi.fn(),
        logout: vi.fn(),
      });

      server.use(
        graphql.query('Addresses', () =>
          HttpResponse.json({ data: { addresses: [sampleSavedAddress] } }),
        ),
      );

      renderCheckoutAddressSection();

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-auth-summary')).toBeInTheDocument();
      });

      expect(screen.getByTestId('address-summary')).toBeInTheDocument();
      expect(screen.getByTestId('address-change-button')).toBeInTheDocument();
      expect(screen.queryByTestId('address-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shipping-address-line1')).not.toBeInTheDocument();
    });

    it('renders auth-loading skeleton while addresses query is in flight', async () => {
      mockedUseAuth.mockReturnValue({
        customer: { id: 'cust-1' } as never,
        isAuthenticated: true,
        isLoading: false,
        pendingDeletion: false,
        sendOtp: vi.fn(),
        verifyOtp: vi.fn(),
        changeCustomerPhone: vi.fn(),
        reactivateAccount: vi.fn(),
        logout: vi.fn(),
      });

      server.use(
        graphql.query('Addresses', async () => {
          await delay(200);
          return HttpResponse.json({ data: { addresses: [sampleSavedAddress] } });
        }),
      );

      renderCheckoutAddressSection();

      expect(screen.getByTestId('address-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('address-change-button')).not.toBeInTheDocument();
    });
  });

  describe('contact phone sync', () => {
    function renderStatefulCheckoutAddressSection() {
      function StatefulSection() {
        const [guestForm, setGuestForm] = useState(EMPTY_GUEST_FORM);

        return (
          <CheckoutAddressSection
            guestForm={guestForm}
            onGuestFormChange={(field, value) => {
              setGuestForm((current) => ({ ...current, [field]: value }));
            }}
          />
        );
      }

      return render(
        <ApolloTestWrapper>
          <CheckoutProvider>
            <StatefulSection />
          </CheckoutProvider>
        </ApolloTestWrapper>,
      );
    }

    it('auto-fills recipient phone while typing contact phone', async () => {
      const user = userEvent.setup();
      renderStatefulCheckoutAddressSection();

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-guest')).toBeInTheDocument();
      });

      const contactPhoneField = screen.getByTestId('contact-phone-field');
      const recipientPhoneField = screen.getByTestId('recipient-phone-field');

      await user.type(contactPhoneField, '0812345678');

      expect(recipientPhoneField).toHaveValue('081-234-5678');
    });

    it('stops syncing recipient phone after recipient phone is edited manually', async () => {
      const user = userEvent.setup();
      renderStatefulCheckoutAddressSection();

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-guest')).toBeInTheDocument();
      });

      const contactPhoneField = screen.getByTestId('contact-phone-field');
      const recipientPhoneField = screen.getByTestId('recipient-phone-field');

      await user.type(contactPhoneField, '0812345678');
      await user.clear(recipientPhoneField);
      await user.type(recipientPhoneField, '0899999999');
      await user.clear(contactPhoneField);
      await user.type(contactPhoneField, '0822222222');

      expect(recipientPhoneField).toHaveValue('089-999-9999');
    });
  });

  describe('Test 2 — inline field validation display', () => {
    it('shows inline errors for invalid contact phone and empty subDistrict', async () => {
      renderCheckoutAddressSection({
        guestForm: {
          ...EMPTY_GUEST_FORM,
          contactPhone: '12345',
        },
        fieldErrors: {
          guestPhone: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
          subDistrict: SUB_DISTRICT_REQUIRED_MESSAGE,
        },
        showFieldErrors: true,
      });

      await waitFor(() => {
        expect(screen.getByTestId('checkout-address-mode-guest')).toBeInTheDocument();
      });

      expect(screen.getByText('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')).toBeInTheDocument();

      const subDistrictField = screen.getByTestId('thai-dropdown-subdistrict');
      expect(within(subDistrictField).getByText(SUB_DISTRICT_REQUIRED_MESSAGE)).toBeInTheDocument();
    });
  });

  describe('Test 3 — address modal selection confirm', () => {
    it('updates selected address after modal confirm', async () => {
      const user = userEvent.setup();

      mockedUseAuth.mockReturnValue({
        customer: { id: 'cust-1' } as never,
        isAuthenticated: true,
        isLoading: false,
        pendingDeletion: false,
        sendOtp: vi.fn(),
        verifyOtp: vi.fn(),
        changeCustomerPhone: vi.fn(),
        reactivateAccount: vi.fn(),
        logout: vi.fn(),
      });

      server.use(
        graphql.query('Addresses', () =>
          HttpResponse.json({
            data: { addresses: [sampleSavedAddress, sampleSavedAddress2] },
          }),
        ),
      );

      renderCheckoutAddressSection();

      await waitFor(() => {
        expect(screen.getByTestId('address-summary-name')).toHaveTextContent(
          sampleSavedAddress.fullName,
        );
      });

      await user.click(screen.getByTestId('address-change-button'));

      await waitFor(() => {
        expect(screen.getByTestId('address-modal')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('address-confirm-button');
      expect(confirmButton).not.toBeDisabled();

      await user.click(screen.getByTestId(`address-option-${sampleSavedAddress2.id}`));

      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId('address-modal')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('address-summary-name')).toHaveTextContent(
        sampleSavedAddress2.fullName,
      );
    });
  });
});
