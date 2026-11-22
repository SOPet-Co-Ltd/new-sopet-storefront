import { StarIcon } from '@/components/atoms/icons/filled/StarIcon';
import type { IconResponsiveSize } from '@/components/atoms/icons/types';

type RenderStarsProps = {
  averageRating: number;
  size?: number;
};

function toIconSize(size: number): IconResponsiveSize {
  return { mobile: size, desktop: size };
}

export function RenderStars({ averageRating, size = 24 }: RenderStarsProps) {
  const iconSize = toIconSize(size);
  const stars = [];
  const fullStars = Math.floor(averageRating);
  const partialFill = Math.round((averageRating - fullStars) * 100);

  for (let index = 0; index < 5; index += 1) {
    if (index < fullStars) {
      stars.push(
        <div key={index} className="relative flex shrink-0 items-center justify-center">
          <StarIcon color="#ffb514" size={iconSize} />
        </div>,
      );
    } else if (index === fullStars && partialFill > 0) {
      stars.push(
        <div key={index} className="relative flex shrink-0 items-center justify-center">
          <StarIcon color="#949495" size={iconSize} />
          <div
            className="absolute inset-y-0 left-0 flex items-center overflow-hidden"
            style={{ width: `${partialFill}%` }}
          >
            <StarIcon color="#ffb514" size={iconSize} />
          </div>
        </div>,
      );
    } else {
      stars.push(
        <div key={index} className="relative flex shrink-0 items-center justify-center">
          <StarIcon color="#949495" size={iconSize} />
        </div>,
      );
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>;
}
