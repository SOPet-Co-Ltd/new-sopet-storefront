import type {
  CartQuery,
  CreateAddressInput,
  CreateOrderInput,
  ShippingAddressInput,
} from '@/lib/graphql/generated/graphql';
import {
  isValidThaiPhoneNumber,
  normalizeThaiPhoneNumber,
  sanitizeThaiPhoneInput,
} from '@/lib/helpers/phone';
import { mapCheckoutPaymentMethodForApi } from '@/lib/checkout/checkoutPaymentMethod';
import type { PaymentMethod } from '@/lib/providers/CheckoutProvider';

export type GuestCheckoutFormState = {
  contactPhone: string;
  recipientFullName: string;
  recipientPhone: string;
  address: string;
  district: string;
  subDistrict?: string;
  province: string;
  postalCode: string;
  addressLine2?: string;
  email?: string;
  notes?: string;
};

export type GuestCheckoutField =
  | 'guestPhone'
  | 'recipientPhone'
  | 'recipientName'
  | 'address'
  | 'subDistrict'
  | 'district'
  | 'province'
  | 'postalCode'
  | 'email';

export type GuestCheckoutValidationResult = {
  valid: boolean;
  errors: Partial<Record<GuestCheckoutField, string>>;
};

export type CreateOrderCheckoutContext = {
  isAuthenticated: boolean;
  shippingByStoreId: Record<string, { shippingOptionId: string }>;
  selectedAddressId: string | null;
  promotionCode: string | null;
  storePromotionCodes: string[];
  paymentMethod: PaymentMethod | null;
  sessionId?: string | null;
};

const GUEST_PHONE_REQUIRED_MESSAGE = 'กรุณากรอกเบอร์โทรศัพท์ของคุณ';
const INVALID_PHONE_MESSAGE = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
const RECIPIENT_PHONE_REQUIRED_MESSAGE = 'กรุณากรอกเบอร์โทรศัพท์ (ผู้รับสินค้า)';
const RECIPIENT_NAME_REQUIRED_MESSAGE = 'กรุณากรอกชื่อ / นามสกุล (ผู้รับสินค้า)';
const ADDRESS_REQUIRED_MESSAGE = 'กรุณากรอกที่อยู่ของคุณ';
export const SUB_DISTRICT_REQUIRED_MESSAGE = 'กรุณาเลือกตำบลของคุณ';
const DISTRICT_REQUIRED_MESSAGE = 'กรุณาเลือกเขต/อำเภอของคุณ';
export const DEFAULT_CHECKOUT_ADDRESS_LABEL = 'ที่อยู่จัดส่ง';
const PROVINCE_REQUIRED_MESSAGE = 'กรุณาเลือกจังหวัดของคุณ';
const POSTAL_CODE_REQUIRED_MESSAGE = 'กรุณาเลือกรหัสไปรษณีย์ของคุณ';
const INVALID_EMAIL_MESSAGE = 'รูปแบบอีเมลไม่ถูกต้อง';

type CustomerContactSource = {
  phone?: string | null;
  email?: string | null;
};

export function getCustomerContactPrefill(
  customer: CustomerContactSource | null | undefined,
): Pick<GuestCheckoutFormState, 'contactPhone' | 'email'> {
  const contactPhone = customer?.phone
    ? sanitizeThaiPhoneInput(normalizeThaiPhoneNumber(customer.phone))
    : '';

  return {
    contactPhone,
    email: customer?.email?.trim() ?? '',
  };
}

function toLocalThaiPhone(phone: string): string {
  return normalizeThaiPhoneNumber(phone);
}

function validatePhoneField(value: string, requiredMessage: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return requiredMessage;
  }

  if (!isValidThaiPhoneNumber(trimmed)) {
    return INVALID_PHONE_MESSAGE;
  }

  return undefined;
}

function validateRequiredText(value: string, requiredMessage: string): string | undefined {
  return value.trim() ? undefined : requiredMessage;
}

function validateOptionalEmail(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(trimmed) ? undefined : INVALID_EMAIL_MESSAGE;
}

function validateShippingFields(
  formState: GuestCheckoutFormState,
): Partial<Record<GuestCheckoutField, string>> {
  const errors: Partial<Record<GuestCheckoutField, string>> = {};

  const recipientPhoneError = validatePhoneField(
    formState.recipientPhone,
    RECIPIENT_PHONE_REQUIRED_MESSAGE,
  );
  if (recipientPhoneError) {
    errors.recipientPhone = recipientPhoneError;
  }

  const recipientNameError = validateRequiredText(
    formState.recipientFullName,
    RECIPIENT_NAME_REQUIRED_MESSAGE,
  );
  if (recipientNameError) {
    errors.recipientName = recipientNameError;
  }

  const addressError = validateRequiredText(formState.address, ADDRESS_REQUIRED_MESSAGE);
  if (addressError) {
    errors.address = addressError;
  }

  const subDistrictError = validateRequiredText(
    formState.subDistrict ?? '',
    SUB_DISTRICT_REQUIRED_MESSAGE,
  );
  if (subDistrictError) {
    errors.subDistrict = subDistrictError;
  }

  const districtError = validateRequiredText(formState.district, DISTRICT_REQUIRED_MESSAGE);
  if (districtError) {
    errors.district = districtError;
  }

  const provinceError = validateRequiredText(formState.province, PROVINCE_REQUIRED_MESSAGE);
  if (provinceError) {
    errors.province = provinceError;
  }

  const postalCodeError = validateRequiredText(formState.postalCode, POSTAL_CODE_REQUIRED_MESSAGE);
  if (postalCodeError) {
    errors.postalCode = postalCodeError;
  }

  return errors;
}

export function validateAuthInlineShippingForm(
  formState: GuestCheckoutFormState,
): GuestCheckoutValidationResult {
  const errors = validateShippingFields(formState);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateGuestCheckoutForm(
  formState: GuestCheckoutFormState,
): GuestCheckoutValidationResult {
  const errors = validateShippingFields(formState);

  const guestPhoneError = validatePhoneField(formState.contactPhone, GUEST_PHONE_REQUIRED_MESSAGE);
  if (guestPhoneError) {
    errors.guestPhone = guestPhoneError;
  }

  const emailError = validateOptionalEmail(formState.email);
  if (emailError) {
    errors.email = emailError;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function mapGuestFormToCreateAddressInput(
  formState: GuestCheckoutFormState,
  options: { isDefault: boolean },
): CreateAddressInput {
  return {
    label: DEFAULT_CHECKOUT_ADDRESS_LABEL,
    recipientName: formState.recipientFullName.trim(),
    recipientPhone: toLocalThaiPhone(formState.recipientPhone),
    addressLine1: formState.address.trim(),
    addressLine2: formState.addressLine2?.trim() || undefined,
    tumbon: formState.subDistrict?.trim() || undefined,
    amphoe: formState.district.trim(),
    province: formState.province.trim(),
    postalCode: formState.postalCode.trim(),
    isDefault: options.isDefault,
  };
}

function mapShippingAddress(formState: GuestCheckoutFormState): ShippingAddressInput {
  return {
    recipientName: formState.recipientFullName.trim(),
    recipientPhone: toLocalThaiPhone(formState.recipientPhone),
    addressLine1: formState.address.trim(),
    addressLine2: formState.addressLine2?.trim() || undefined,
    tumbon: formState.subDistrict?.trim() || '',
    amphoe: formState.district.trim(),
    province: formState.province.trim(),
    postalCode: formState.postalCode.trim(),
  };
}

function mapCartItems(items: CartQuery['cart']['items']): CreateOrderInput['items'] {
  return items.map((item) => {
    const productId = item.productVariant?.product?.id;
    const price = item.productVariant?.price;

    if (!productId || price == null) {
      throw new Error('Cart item is missing product or price data required for createOrder');
    }

    return {
      productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
    };
  });
}

function mapStoreShipping(
  shippingByStoreId: CreateOrderCheckoutContext['shippingByStoreId'],
): CreateOrderInput['storeShipping'] {
  const selections = Object.entries(shippingByStoreId).map(([storeId, selection]) => ({
    storeId,
    shippingOptionId: selection.shippingOptionId,
  }));

  return selections.length > 0 ? selections : undefined;
}

export function toCreateOrderInput(
  formState: GuestCheckoutFormState | null,
  cart: { items: CartQuery['cart']['items'] },
  checkoutContext: CreateOrderCheckoutContext,
): CreateOrderInput {
  if (!checkoutContext.paymentMethod) {
    throw new Error('paymentMethod is required to create an order');
  }

  const input: CreateOrderInput = {
    items: mapCartItems(cart.items),
    paymentMethod: mapCheckoutPaymentMethodForApi(checkoutContext.paymentMethod),
    storeShipping: mapStoreShipping(checkoutContext.shippingByStoreId),
    cartItemIds: cart.items.map((item) => item.id),
  };

  if (checkoutContext.sessionId) {
    input.sessionId = checkoutContext.sessionId;
  }

  if (checkoutContext.promotionCode?.trim()) {
    input.platformPromotionCode = checkoutContext.promotionCode.trim();
  }

  if (checkoutContext.storePromotionCodes.length > 0) {
    input.storePromotionCodes = checkoutContext.storePromotionCodes;
  }

  if (checkoutContext.isAuthenticated) {
    if (checkoutContext.selectedAddressId) {
      input.savedAddressId = checkoutContext.selectedAddressId;
    }

    return input;
  }

  if (!formState) {
    throw new Error('Guest checkout requires form state');
  }

  const trimmedEmail = formState.email?.trim();

  return {
    ...input,
    guestPhone: normalizeThaiPhoneNumber(formState.contactPhone),
    guestName: formState.recipientFullName.trim(),
    guestEmail: trimmedEmail || undefined,
    notes: formState.notes?.trim() || undefined,
    shippingAddress: mapShippingAddress(formState),
  };
}
