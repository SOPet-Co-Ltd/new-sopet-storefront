'use client';

import dynamic from 'next/dynamic';
import { BannerSection } from '@/components/sections/BannerSection';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { HOME_FAQ_ITEMS } from '@/components/sections/HomeFaqSection';
import type { Category } from '@/lib/hooks/useCategories';
import type {
  PlatformBannersQuery,
  RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';

// Below-fold sections: dynamic import to reduce initial JS bundle and TBT.
// These components are not visible in the first viewport, so deferring them
// lets the browser finish parsing/executing critical-path JS sooner.
const HomeRecentOrdersSection = dynamic(
  () =>
    import('@/components/sections/HomeRecentOrdersSection').then(
      (mod) => mod.HomeRecentOrdersSection,
    ),
  { ssr: true },
);

const HomeRecommendedProductSection = dynamic(
  () =>
    import('@/components/sections/HomeRecommendedProductSection').then(
      (mod) => mod.HomeRecommendedProductSection,
    ),
  { ssr: true },
);

const HomeSponsorsSection = dynamic(
  () => import('@/components/sections/HomeSponsorsSection').then((mod) => mod.HomeSponsorsSection),
  { ssr: true },
);

const HomeFaqSection = dynamic(
  () => import('@/components/sections/HomeFaqSection').then((mod) => mod.HomeFaqSection),
  { ssr: true },
);

export type HomePageProps = {
  initialCategories?: Category[];
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
  initialBanners?: PlatformBannersQuery['platformBanners'];
};

export default function HomePage({
  initialCategories,
  initialRecommendedProducts,
  initialBanners,
}: HomePageProps = {}) {
  return (
    <main className="flex flex-col row-start-2 items-center sm:items-start text-primary w-full">
      <header className="w-full">
        <BannerSection initialBanners={initialBanners} />
      </header>

      <section className="relative w-full">
        <section className="flex flex-col gap-5 md:gap-10 w-full p-4 lg:py-10 lg:px-20">
          <div className="w-full">
            <HomeRecentOrdersSection />
          </div>

          <div className="w-full">
            <HomeCategories initialCategories={initialCategories} />
          </div>

          <div className="w-full">
            <HomeRecommendedProductSection
              initialRecommendedProducts={initialRecommendedProducts}
            />
          </div>
        </section>

        <section className="flex w-full flex-col gap-10 overflow-hidden bg-sop-base-white p-0 lg:py-10">
          <div className="w-full lg:px-20">
            <HomeSponsorsSection />
          </div>
          <HomeFaqSection items={HOME_FAQ_ITEMS} />
        </section>
      </section>
    </main>
  );
}
