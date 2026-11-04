/**
 * Maps Beam charge failureCode values to Thai shopper-facing copy.
 * Do not treat BEAM_ERROR as a card decline — that is an API/client error, not an issuer decline.
 */

const BEAM_FAILURE_MESSAGES: Record<string, string> = {
  CH_CARD_DECLINED: 'บัตรถูกปฏิเสธ กรุณาใช้บัตรอื่นหรือติดต่อธนาคารผู้ออกบัตร',
  CH_AUTHENTICATION_FAILED: 'การยืนยันตัวตนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  CH_INSUFFICIENT_FUNDS: 'ยอดเงินในบัตรไม่เพียงพอ กรุณาใช้บัตรอื่น',
  CH_CARD_EXPIRED: 'บัตรหมดอายุแล้ว กรุณาใช้บัตรอื่น',
  CH_CARD_INCORRECT_DETAILS: 'ข้อมูลบัตรไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  CH_PROCESSING_FAILED: 'ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
  CH_DO_NOT_HONOR: 'ธนาคารปฏิเสธการทำรายการ กรุณาใช้บัตรอื่นหรือติดต่อธนาคาร',
  CH_LOST_CARD: 'บัตรไม่สามารถใช้ได้ กรุณาติดต่อธนาคารผู้ออกบัตร',
  CH_STOLEN_CARD: 'บัตรไม่สามารถใช้ได้ กรุณาติดต่อธนาคารผู้ออกบัตร',
  CH_INVALID_ACCOUNT: 'บัญชีบัตรไม่ถูกต้อง กรุณาใช้บัตรอื่น',
  CH_ISSUER_UNAVAILABLE: 'ธนาคารผู้ออกบัตรไม่พร้อมให้บริการ กรุณาลองใหม่อีกครั้ง',
};

const DEFAULT_FAILURE_MESSAGE = 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';

/** Generic non-decline message when the failure is not a mapped card-issuer code. */
const GENERIC_PROCESSING_MESSAGE = 'ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง';

/**
 * Returns Thai copy for a Beam `failureCode`.
 * Unknown codes and BEAM_ERROR use a generic processing message (not card-declined wording).
 */
export function getBeamFailureMessage(failureCode: string | null | undefined): string {
  const code = failureCode?.trim();
  if (!code) {
    return DEFAULT_FAILURE_MESSAGE;
  }

  if (code === 'BEAM_ERROR') {
    return GENERIC_PROCESSING_MESSAGE;
  }

  return BEAM_FAILURE_MESSAGES[code] ?? GENERIC_PROCESSING_MESSAGE;
}

export function readPaymentFailureCode(payment: { failureCode?: string | null }): string | null {
  const code = payment.failureCode?.trim();
  return code ? code : null;
}
