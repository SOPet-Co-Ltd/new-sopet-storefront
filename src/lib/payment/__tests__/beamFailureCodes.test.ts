import { describe, expect, it } from 'vitest';
import { getBeamFailureMessage, readPaymentFailureCode } from '../beamFailureCodes';

describe('beamFailureCodes', () => {
  it('maps known Beam charge codes to Thai shopper messages', () => {
    expect(getBeamFailureMessage('CH_CARD_DECLINED')).toContain('บัตรถูกปฏิเสธ');
    expect(getBeamFailureMessage('CH_AUTHENTICATION_FAILED')).toContain('ยืนยันตัวตน');
    expect(getBeamFailureMessage('CH_INSUFFICIENT_FUNDS')).toContain('ไม่เพียงพอ');
    expect(getBeamFailureMessage('CH_CARD_EXPIRED')).toContain('หมดอายุ');
    expect(getBeamFailureMessage('CH_CARD_INCORRECT_DETAILS')).toContain('ไม่ถูกต้อง');
    expect(getBeamFailureMessage('CH_PROCESSING_FAILED')).toContain('ไม่สามารถดำเนินการ');
  });

  it('does not map BEAM_ERROR as a card decline', () => {
    const message = getBeamFailureMessage('BEAM_ERROR');
    expect(message).not.toContain('บัตรถูกปฏิเสธ');
    expect(message).toContain('ไม่สามารถดำเนินการชำระเงินได้');
  });

  it('falls back to a generic processing message for unknown codes', () => {
    expect(getBeamFailureMessage('CH_UNKNOWN_XYZ')).toContain('ไม่สามารถดำเนินการชำระเงินได้');
    expect(getBeamFailureMessage(null)).toContain('การชำระเงินไม่สำเร็จ');
    expect(getBeamFailureMessage(undefined)).toContain('การชำระเงินไม่สำเร็จ');
    expect(getBeamFailureMessage('   ')).toContain('การชำระเงินไม่สำเร็จ');
  });

  it('reads trimmed failureCode from payment-like objects', () => {
    expect(readPaymentFailureCode({ failureCode: ' CH_CARD_DECLINED ' })).toBe('CH_CARD_DECLINED');
    expect(readPaymentFailureCode({ failureCode: null })).toBeNull();
    expect(readPaymentFailureCode({ failureCode: '  ' })).toBeNull();
  });
});
