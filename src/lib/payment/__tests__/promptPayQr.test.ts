import { describe, expect, it } from 'vitest';
import { resolvePromptPayQrSrc, toQrImageDataUrl } from '@/lib/payment/promptPayQr';

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
