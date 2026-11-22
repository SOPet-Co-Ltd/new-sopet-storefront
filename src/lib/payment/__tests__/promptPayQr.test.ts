import { describe, expect, it } from 'vitest';
import {
  resolvePromptPayQrSrc,
  resolvePromptPayReferenceId,
  toQrImageDataUrl,
} from '@/lib/payment/promptPayQr';

describe('promptPayQr', () => {
  it('wraps base64 PNG as a data URL', () => {
    expect(toQrImageDataUrl('iVBORw0KGgoAAAANSUhEUg==')).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
    );
  });

  it('detects JPEG and SVG mime types and strips whitespace', () => {
    expect(toQrImageDataUrl('/9j/4AAQ\nSkZJRg==')).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
    expect(toQrImageDataUrl('PHN2ZyB4bWxucz0=')).toBe('data:image/svg+xml;base64,PHN2ZyB4bWxucz0=');
  });

  it('keeps an existing data URL untouched', () => {
    expect(toQrImageDataUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('uses the Beam playground charge id printed on the sandbox checkout page', () => {
    const raw =
      'https://sandbox-gateway-357427797651.asia-southeast1.run.app/charges/c_fAHi1HNzZ9KxSLtY9XSF/force';
    expect(resolvePromptPayReferenceId(raw, 'ea5d7968-3b11-4e33-be30-da6cb3e8046f')).toBe(
      'c_fAHi1HNzZ9KxSLtY9XSF',
    );
  });

  it('reads the PromptPay reference label from an EMV QR payload', () => {
    const emv = '00020101021262160512REF1234567896304ABCD';
    expect(resolvePromptPayReferenceId(emv, 'payment-1')).toBe('REF123456789');
  });

  it('falls back to the bill number when the EMV payload has no reference label', () => {
    const emv = '00020101021262140510BILL1234566304ABCD';
    expect(resolvePromptPayReferenceId(emv, 'payment-1')).toBe('BILL123456');
  });

  it('keeps the SOPET payment id when the QR payload has no payer reference', () => {
    expect(resolvePromptPayReferenceId('https://example.com/qr.png', 'payment-1')).toBe(
      'payment-1',
    );
    expect(resolvePromptPayReferenceId('0002010102126304ABCD', 'payment-1')).toBe('payment-1');
    expect(resolvePromptPayReferenceId(null, 'payment-1')).toBe('payment-1');
    expect(resolvePromptPayReferenceId('   ', 'payment-1')).toBe('payment-1');
  });

  it('prefers qrCodeImage over qrCodeUrl and falls back for legacy payments', () => {
    expect(
      resolvePromptPayQrSrc({
        qrCodeImage: 'iVBORw0KGgo=',
        qrCodeUrl: 'https://example.com/qr.png',
      }),
    ).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(
      resolvePromptPayQrSrc({ qrCodeImage: null, qrCodeUrl: 'https://example.com/qr.png' }),
    ).toBe('https://example.com/qr.png');
    expect(resolvePromptPayQrSrc({ qrCodeImage: '  ', qrCodeUrl: null })).toBeNull();
  });
});
