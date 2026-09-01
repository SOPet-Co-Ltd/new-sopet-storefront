import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PolicyMarkdownLayout } from './PolicyMarkdownLayout';

describe('PolicyMarkdownLayout', () => {
  it('renders headings, bold, links, and lists', () => {
    render(
      <PolicyMarkdownLayout
        title="ทดสอบ"
        source={`
อัปเดตครั้งล่าสุดเมื่อ: 9 สิงหาคม 2026

ติดต่อ **ทีมความปลอดภัย** ที่ security@example.com หรือดู [นโยบาย](/policy/privacy-policy)

## หัวข้อหลัก

- รายการหนึ่ง
- รายการสอง
`}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'ทดสอบ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'หัวข้อหลัก' })).toBeInTheDocument();
    expect(screen.getByText('ทีมความปลอดภัย').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: 'นโยบาย' })).toHaveAttribute(
      'href',
      '/policy/privacy-policy',
    );
    expect(screen.getByRole('link', { name: 'security@example.com' })).toHaveAttribute(
      'href',
      'mailto:security@example.com',
    );
    expect(screen.getByText('รายการหนึ่ง')).toBeInTheDocument();
    expect(screen.queryByText('**ทีมความปลอดภัย**')).not.toBeInTheDocument();
  });
});
