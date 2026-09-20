import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeWhoSopet } from './HomeWhoSopet';

describe('HomeWhoSopet', () => {
  it('renders heading, tag, sponsor info, and read more link', () => {
    render(<HomeWhoSopet />);

    expect(screen.getByText('Sopet คือใคร ?')).toBeInTheDocument();
    expect(
      screen.getByText(/แพลตฟอร์มศูนย์รวมยาและเวชภัณฑ์สัตว์ออนไลน์ที่ช่วยให้คุณค้นหา/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/สนับสนุนโดยคณะนวัตกรรม/i).length).toBeGreaterThan(0);
    // expect(screen.getByRole('link', { name: /อ่านเพิ่มเติม/i })).toHaveAttribute('href', '/about');
  });

  it('renders all 4 stats with values and labels', () => {
    render(<HomeWhoSopet />);

    expect(screen.getAllByText('5K').length).toBeGreaterThan(0);
    expect(screen.getAllByText('เจ้าของผู้ไว้วางใจ').length).toBeGreaterThan(0);

    expect(screen.getAllByText('20K').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ออเดอร์ที่จัดส่งแล้ว').length).toBeGreaterThan(0);

    expect(screen.getAllByText('20').length).toBeGreaterThan(0);
    expect(screen.getAllByText('โรงพยาบาลพาร์ทเนอร์').length).toBeGreaterThan(0);

    expect(screen.getAllByText('4.9').length).toBeGreaterThan(0);
    expect(screen.getAllByText('คะแนนรีวิวเฉลี่ย').length).toBeGreaterThan(0);
  });

  it('renders owner and approve logo images', () => {
    render(<HomeWhoSopet />);

    expect(screen.getByAltText('ผู้ก่อตั้ง Sopet')).toBeInTheDocument();
    expect(screen.getByAltText('Honest Dog Approved')).toBeInTheDocument();
  });
});
