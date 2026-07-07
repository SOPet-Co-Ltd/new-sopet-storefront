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
  const partialFill = (averageRating - fullStars) * 100;

  for (let index = 0; index < 5; index += 1) {
    if (index < fullStars) {
      stars.push(<StarIcon key={index} color="#ffb514" size={iconSize} />);
    } else if (index === fullStars && partialFill > 0) {
      stars.push(
        <div key={index} className="relative inline-block">
          <StarIcon color="#949495" size={iconSize} />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialFill}%` }}
          >
            <StarIcon color="#ffb514" size={iconSize} />
          </div>
        </div>,
      );
    } else {
      stars.push(<StarIcon key={index} color="#949495" size={iconSize} />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
}
