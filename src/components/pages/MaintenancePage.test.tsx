import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MaintenancePage from './MaintenancePage';

describe('MaintenancePage', () => {
  it('shows reason copy and until label', () => {
    render(
      <MaintenancePage
        title="หน้าร้านปิดปรับปรุงชั่วคราว"
        message="ขณะนี้หน้าร้านกำลังปิดปรับปรุง กรุณากลับมาใหม่อีกครั้งในภายหลัง"
        untilLabel="เปิดอีกครั้งประมาณ 1 มกราคม 2099 12:00"
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'หน้าร้านปิดปรับปรุงชั่วคราว' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/กำลังปิดปรับปรุง/)).toBeInTheDocument();
    expect(screen.getByText(/เปิดอีกครั้งประมาณ/)).toBeInTheDocument();
  });

  it('hides until label when absent', () => {
    render(
      <MaintenancePage
        title="กำลังอัพเดทระบบ"
        message="ขณะนี้ระบบกำลังได้รับการอัพเดท กรุณากลับมาใหม่อีกครั้งในภายหลัง"
      />,
    );
    expect(screen.queryByText(/เปิดอีกครั้งประมาณ/)).not.toBeInTheDocument();
  });
});
