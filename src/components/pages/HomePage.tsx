'use client';

import { BannerSection } from '@/components/sections/BannerSection';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { HomeFaqSection, type HomeFaqItem } from '@/components/sections/HomeFaqSection';
import { HomeRecentOrdersSection } from '@/components/sections/HomeRecentOrdersSection';
import { HomeRecommendedProductSection } from '@/components/sections/HomeRecommendedProductSection';
import { ChatWithAdminFloatingButton } from '@/components/molecules/ChatWithAdminFloatingButton/ChatWithAdminFloatingButton';
import { HomeSponsorsSection } from '@/components/sections/HomeSponsorsSection';
import type { Category } from '@/lib/hooks/useCategories';
import type { RecommendedProductsQuery } from '@/lib/graphql/generated/graphql';
import { HOME_H1_COPY } from '@/lib/seo/constants';

export type HomePageProps = {
  initialCategories?: Category[];
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
};

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    id: 'authentic-products',
    question: 'สินค้าในเว็บเป็น ของแท้ ใช้ไหม ?',
    answer:
      'สินค้าและยาของเรามาจากรพ.ที่จดทะเบียนถูกต้อง 100% บริษัทของเรายังได้รับการสนับสนุนโดยคณะนวัตกรรมบูรณาการ (SCII) จุฬาลงกรณ์มหาวิทยาลัย',
  },
  {
    id: 'shipping-methods',
    question: 'Sopet ใช้ขนส่งแบบไหน และจัดส่งภายในกี่วัน ?',
    answer:
      'ยี่ห้อขนส่งของเราอาจจะขึ้นอยู่กับรพ.ที่จัดส่ง โดยปกติจะมี Flash และไปรษณีย์ไทย โดยเป็นการส่งด่วนใน 1-2 วัน',
  },
  {
    id: 'contact-us',
    question: 'หากพบปัญหา สามารถสอบถาม และติดต่อผ่านช่องทางไหนได้บ้าง ?',
    answer: 'สามารถกดที่ปุ่ม "ติดต่อทีมงาน" มุมขวาล่าง หรือโทร 096-876-5031 ได้เลย',
  },
  {
    id: 'about-us',
    question: 'Sopet คืออะไร',
    answer:
      'เราเป็นเว็บไซต์แพลตฟอร์มที่ค้นหายาและสินค้าราคาถูกที่สุดจากรพ.และร้านขายยาสัตว์ทั่วไทย พร้อมดีลโค้ดลด ส่วนลดพิเศษ',
  },
];

export default function HomePage({
  initialCategories,
  initialRecommendedProducts,
}: HomePageProps = {}) {
  return (
    <main className="flex flex-col row-start-2 items-center sm:items-start text-primary w-full">
      <header className="w-full">
        <div className="px-4 pt-4 lg:px-20 lg:pt-6">
          <h1 className="sop-headline-sm-medium text-sop-neutral-gray-200 md:sop-headline-md-medium">
            {HOME_H1_COPY}
          </h1>
        </div>
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
