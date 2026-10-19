import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RenderStars } from './RenderStars';

describe('RenderStars', () => {
  it('renders 5 star wrappers aligned with items-center', () => {
    const { container } = render(<RenderStars averageRating={4} size={20} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('flex', 'items-center', 'gap-1');

    const starWrappers = root.children;
    expect(starWrappers).toHaveLength(5);
    for (let i = 0; i < 5; i += 1) {
      expect(starWrappers[i]).toHaveClass(
        'relative',
        'flex',
        'shrink-0',
        'items-center',
        'justify-center',
      );
    }
  });

  it('renders partial fill correctly on fractional rating and aligns it within flex container', () => {
    const { container } = render(<RenderStars averageRating={3.33} size={18} />);
    const root = container.firstElementChild as HTMLElement;
    const starWrappers = root.children;

    expect(starWrappers).toHaveLength(5);

    // 4th star (index 3) is the partial star
    const partialStarWrapper = starWrappers[3];
    expect(partialStarWrapper).toHaveClass(
      'relative',
      'flex',
      'shrink-0',
      'items-center',
      'justify-center',
    );

    const overlay = partialStarWrapper.querySelector('.overflow-hidden') as HTMLElement;
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('absolute', 'inset-y-0', 'left-0', 'flex', 'items-center');
    expect(overlay.style.width).toBe('33%');

    // Partial star has 2 svg icons (background gray and foreground yellow)
    const svgs = partialStarWrapper.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
  });
});
