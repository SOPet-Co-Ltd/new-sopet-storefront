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

export type HomePageProps = {
  initialCategories?: Category[];
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
};

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    id: '',
    question: 'ของแท้ไหม',
    answer:
      'ยาและสินค้าของเรามาจากรพ.ที่จดทะเบียนถูกต้อง 100% บริษัทของเรายังได้รับการสนับสนุนโดยคณะนวัตกรรม จุฬาลงกรณ์มหาวิทยาลัย (CSII)',
  },
  {
    id: 'payment-methods',
    question: 'มีการชำระเงินแบบไหนบ้าง',
    answer: 'ระบบชำระเงินหลายรูปแบบ เช่น โอนธนาคาร, QR Code, บัตรเครดิต, ShopeePay',
  },
  {
    id: 'shipping-methods',
    question: 'ใช้ขนส่งอะไร ส่งในกี่วัน',
    answer:
      "โดยปกติจะเป็นขนส่งไปรษณีย์ไทยแบบ ems หรือ Flash ทุกออเดอร์ถึงใน 1-2 วัน แต่หากต้องการเปลี่ยนหรือระบุขนส่งเฉพาะ สามารถแจ้งเจ้าหน้าที่โดยกดปุ่ม 'แชท' ด้านล่างขวา หรือไลน์ @sopet ได้เลย",
  },
  {
    id: 'contact-us',
    question: 'ติดต่อแอดมินอย่างไร',
    answer: "สามารถกดที่ปุ่ม 'แชท' มุมขวาล่าง ไลน์ @sopet หรือโทร 096-876-5031 ได้เลย",
  },
  {
    id: 'about-us',
    question: 'Sopet คืออะไร',
    answer:
      'เราเป็นเว็บไซต์แพลตฟอร์มที่ค้นหายาและสินค้าราคาถูกที่สุดจากรพ.และร้านขายยาสัตว์ทั่วไทย พร้อมดีลโค้ดลด ส่วนลดพิเศษ',
  },
  {
    id: 'cut-off-time',
    question: 'ตัดรอบส่งเมื่อไหร่',
    answer: 'เที่ยง-บ่ายโมง (แต่ละวันอาจจะไม่เท่ากัน)',
  },
  {
    id: 'track-order',
    question: 'ติดตามออเดอร์อย่างไร',
    answer:
      "สามารถกดที่ปุ่ม 'แชท' ด้านล้างขวา หรือแอดไลน์ @sopet เพื่อให้เจ้าหน้าที่ส่ง Tracking Number ให้ได้เลย",
  },
];

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
