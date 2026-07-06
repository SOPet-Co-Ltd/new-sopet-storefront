'use client';

import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import { PlatformSponsorsDocument } from '@/lib/graphql/generated/graphql';

function SponsorsSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 items-center justify-center gap-4 md:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="aspect-2/1 w-full max-w-[150px] bg-sop-neutral-gray-600 animate-pulse rounded-sop-8px"
        />
      ))}
    </div>
  );
}

type HomeSponsorsSectionProps = {
  heading?: string;
};

export function HomeSponsorsSection({ heading = 'แบรนด์ที่เข้าร่วม' }: HomeSponsorsSectionProps) {
  const { data, loading, error } = useQuery(PlatformSponsorsDocument);

  const sponsors = (data?.platformSponsors ?? [])
    .filter((sponsor) => sponsor.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) {
    return (
      <div className="py-5 px-4 flex flex-col gap-sop-20px" aria-busy="true">
        <div className="text-center">
          <h2 className="sop-body-lg-medium text-sop-neutral-gray-200 md:sop-headline-md-medium">
            {heading}
          </h2>
        </div>
        <SponsorsSkeleton />
      </div>
    );
  }

  if (error || sponsors.length === 0) {
    return null;
  }

  return (
    <div className="py-5 px-4 flex flex-col gap-sop-20px">
      <div className="text-center">
        <h2 className="sop-body-lg-medium text-sop-neutral-gray-200 md:sop-headline-md-medium">
          {heading}
        </h2>
      </div>
      <div className="grid w-full grid-cols-2 items-center justify-center gap-4 md:grid-cols-6">
        {sponsors.map((sponsor) => {
          const altText = sponsor.name || 'สปอนเซอร์';

          const card = (
            <div className="aspect-2/1 w-full max-w-[150px]">
              <Image
                src={sponsor.imageUrl}
                alt={altText}
                width={200}
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          );

          if (sponsor.linkUrl) {
            return (
              <a
                key={sponsor.id}
                href={sponsor.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex justify-center"
              >
                {card}
              </a>
            );
          }

          return (
            <div key={sponsor.id} className="flex justify-center">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
