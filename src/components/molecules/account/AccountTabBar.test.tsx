import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountTabBar } from './AccountTabBar';

const tabs = [
  { id: 'pending', label: 'รอดำเนินการ' },
  { id: 'written', label: 'เขียนแล้ว' },
];

describe('AccountTabBar', () => {
  it('renders tablist and tabs with aria-selected', () => {
    render(<AccountTabBar ariaLabel="แท็บรีวิว" tabs={tabs} value="pending" />);

    expect(screen.getByRole('tablist', { name: 'แท็บรีวิว' })).toBeInTheDocument();

    const pendingTab = screen.getByRole('tab', { name: 'รอดำเนินการ' });
    const writtenTab = screen.getByRole('tab', { name: 'เขียนแล้ว' });

    expect(pendingTab).toHaveAttribute('aria-selected', 'true');
    expect(writtenTab).toHaveAttribute('aria-selected', 'false');
  });

  it('supports controlled mode via value and onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <AccountTabBar
        ariaLabel="แท็บรีวิว"
        onValueChange={onValueChange}
        tabs={tabs}
        value="pending"
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'เขียนแล้ว' }));
    expect(onValueChange).toHaveBeenCalledWith('written');
  });

  it('supports uncontrolled mode with defaultValue', async () => {
    const user = userEvent.setup();

    render(<AccountTabBar ariaLabel="แท็บรีวิว" defaultValue="pending" tabs={tabs} />);

    expect(screen.getByRole('tab', { name: 'รอดำเนินการ' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(screen.getByRole('tab', { name: 'เขียนแล้ว' }));

    expect(screen.getByRole('tab', { name: 'รอดำเนินการ' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('tab', { name: 'เขียนแล้ว' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders tabpanel when children provided', () => {
    render(
      <AccountTabBar ariaLabel="แท็บรีวิว" tabs={tabs} value="pending">
        <p>Panel content</p>
      </AccountTabBar>,
    );

    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });
});
