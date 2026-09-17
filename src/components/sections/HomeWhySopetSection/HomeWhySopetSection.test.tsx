import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeWhySopetSection } from '@/components/sections/HomeWhySopetSection/HomeWhySopetSection';

describe('HomeWhySopetSection', () => {
  it('renders the section heading and four value cards', () => {
    render(<HomeWhySopetSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'ทำไมต้องซื้อสินค้ากับ Sopet ?' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'สัตวแพทย์แนะนำ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'ปรึกษาทุกปัญหา' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'ของแท้ 100%' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'ส่วนลดพิเศษ' })).toBeInTheDocument();
  });
});
