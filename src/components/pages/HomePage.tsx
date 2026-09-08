'use client';

import { BannerSection } from '@/components/sections/BannerSection';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { HomeFaqSection, HOME_FAQ_ITEMS } from '@/components/sections/HomeFaqSection';
import { HomeRecentOrdersSection } from '@/components/sections/HomeRecentOrdersSection';
import { HomeRecommendedProductSection } from '@/components/sections/HomeRecommendedProductSection';
import { ChatWithAdminFloatingButton } from '@/components/molecules/ChatWithAdminFloatingButton/ChatWithAdminFloatingButton';
import { HomeSponsorsSection } from '@/components/sections/HomeSponsorsSection';
import type { Category } from '@/lib/hooks/useCategories';
import type { RecommendedProductsQuery } from '@/lib/graphql/generated/graphql';

export type HomePageProps = {
  initialCategories?: Category[];
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
};

export default function HomePage({
  initialCategories,
  initialRecommendedProducts,
}: HomePageProps = {}) {
  return (
    <main className="flex flex-col row-start-2 items-center sm:items-start text-primary w-full">
      <header className="w-full">
        <BannerSection />
      </header>

      <section className="relative w-full">
        <ChatWithAdminFloatingButton />
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

        <section className="w-full lg:px-20 lg:py-10 p-0 flex flex-col gap-10 bg-sop-base-white overflow-hidden">
          <HomeSponsorsSection />
          <HomeFaqSection items={HOME_FAQ_ITEMS} />
        </section>
      </section>
    </main>
  );
}
