export const OTP_PHONE_STORAGE_KEY = 'sopet_otp_phone';
export const OTP_REFERENCE_STORAGE_KEY = 'sopet_otp_reference';

export type OtpSession = {
  phone: string;
  referenceCode: string | null;
};

export function storeOtpPhone(phone: string, referenceCode?: string | null): void {
  try {
    sessionStorage.setItem(OTP_PHONE_STORAGE_KEY, phone);
    if (referenceCode) {
      sessionStorage.setItem(OTP_REFERENCE_STORAGE_KEY, referenceCode);
    } else {
      sessionStorage.removeItem(OTP_REFERENCE_STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable — OTP page will redirect to login
  }
}

export function readOtpPhone(): string | null {
  try {
    return sessionStorage.getItem(OTP_PHONE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readOtpReferenceCode(): string | null {
  try {
    return sessionStorage.getItem(OTP_REFERENCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readOtpSession(): OtpSession | null {
  const phone = readOtpPhone();
  if (!phone) return null;
  return {
    phone,
    referenceCode: readOtpReferenceCode(),
  };
}

export function clearOtpPhone(): void {
  try {
    sessionStorage.removeItem(OTP_PHONE_STORAGE_KEY);
    sessionStorage.removeItem(OTP_REFERENCE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
