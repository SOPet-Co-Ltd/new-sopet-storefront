import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { useGuestCheckoutRememberHydration } from '@/lib/checkout/useGuestCheckoutRememberHydration';

const { mockLoad } = vi.hoisted(() => ({
  mockLoad: vi.fn(() => null as ReturnType<
    typeof import('@/lib/checkout/guestCheckoutRemember').loadGuestCheckoutRemember
  >),
}));

vi.mock('@/lib/checkout/guestCheckoutRemember', () => ({
  loadGuestCheckoutRemember: mockLoad,
}));

const EMPTY: GuestCheckoutFormState = {
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

describe('useGuestCheckoutRememberHydration', () => {
  beforeEach(() => {
    mockLoad.mockReset();
    mockLoad.mockReturnValue(null);
  });

  it('hydrates guest form from remembered snapshot when anonymous', async () => {
    mockLoad.mockReturnValue({
      v: 1,
      form: {
        ...EMPTY,
        contactPhone: '0812345678',
        recipientFullName: 'Somchai',
        address: '123 Sukhumvit',
        province: 'กรุงเทพมหานคร',
        district: 'ปทุมวัน',
        subDistrict: 'ลุมพินี',
        postalCode: '10330',
      },
    });

    const { result } = renderHook(() => {
      const [guestForm, setGuestForm] = useState(EMPTY);
      useGuestCheckoutRememberHydration(false, false, setGuestForm);
      return guestForm;
    });

    await waitFor(() => {
      expect(result.current.recipientFullName).toBe('Somchai');
      expect(result.current.address).toBe('123 Sukhumvit');
      expect(result.current.contactPhone).toBe('0812345678');
    });
  });

  it('does not hydrate when authenticated', async () => {
    mockLoad.mockReturnValue({
      v: 1,
      form: { ...EMPTY, recipientFullName: 'Somchai' },
    });

    const { result } = renderHook(() => {
      const [guestForm, setGuestForm] = useState(EMPTY);
      useGuestCheckoutRememberHydration(true, false, setGuestForm);
      return guestForm;
    });

    await waitFor(() => {
      expect(mockLoad).not.toHaveBeenCalled();
    });
    expect(result.current.recipientFullName).toBe('');
  });
});
