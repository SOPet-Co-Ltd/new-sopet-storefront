/** Only Beam-vaulted cards can be charged after the Omise→Beam migration. */
export function isBeamSavedPaymentMethod(method: { psp?: string | null }): boolean {
  return method.psp === 'beam';
}
