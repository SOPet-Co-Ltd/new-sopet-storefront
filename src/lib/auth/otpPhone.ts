export const OTP_PHONE_STORAGE_KEY = 'sopet_otp_phone';

export function storeOtpPhone(phone: string): void {
  try {
    sessionStorage.setItem(OTP_PHONE_STORAGE_KEY, phone);
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

export function clearOtpPhone(): void {
  try {
    sessionStorage.removeItem(OTP_PHONE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
