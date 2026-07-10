import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileContactEditLayout } from './ProfileContactEditLayout';

describe('ProfileContactEditLayout', () => {
  it('renders back link, description, current value, and step indicator', () => {
    render(
      <ProfileContactEditLayout
        icon={<span data-testid="contact-icon" />}
        description="คำอธิบายการติดต่อ"
        currentValue={{ label: 'อีเมลปัจจุบัน', value: 'user@example.com' }}
        steps={{ current: 2, steps: ['กรอกเบอร์โทร', 'ยืนยัน OTP'] }}
      >
        <p>ฟอร์ม</p>
      </ProfileContactEditLayout>,
    );

    expect(screen.getByRole('link', { name: 'กลับไปข้อมูลส่วนตัว' })).toHaveAttribute(
      'href',
      '/user/profile',
    );
    expect(screen.getByText('คำอธิบายการติดต่อ')).toBeInTheDocument();
    expect(screen.getByText('อีเมลปัจจุบัน')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('กรอกเบอร์โทร')).toBeInTheDocument();
    expect(screen.getByText('ยืนยัน OTP')).toBeInTheDocument();
    expect(screen.getByText('ฟอร์ม')).toBeInTheDocument();
  });
});
