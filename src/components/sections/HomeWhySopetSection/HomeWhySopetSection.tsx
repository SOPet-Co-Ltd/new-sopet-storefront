import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ASSET_BASE = '/images/home/why-sopet';

type WhySopetCardProps = {
  title: string;
  description: ReactNode;
  cardClassName: string;
  wellClassName: string;
  media: ReactNode;
};

function WhySopetCard({
  title,
  description,
  cardClassName,
  wellClassName,
  media,
}: WhySopetCardProps) {
  return (
    <article
      className={cn(
        'relative flex w-full min-h-[200px] items-center gap-4 overflow-hidden rounded-sop-28 p-6 md:min-h-[228px] md:gap-5',
        cardClassName,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 text-sop-neutral-gray-200">
        <h3 className="sop-headline-sm-bold">{title}</h3>
        <p className="sop-body-lg-regular">{description}</p>
      </div>
      <div
        className={cn(
          'relative h-[140px] w-[140px] shrink-0 rounded-sop-36 sm:h-[180px] sm:w-[223px]',
          wellClassName,
        )}
      >
        {media}
      </div>
    </article>
  );
}

export function HomeWhySopetSection() {
  return (
    <section
      className="flex w-full flex-col items-center gap-10"
      aria-labelledby="home-why-sopet-heading"
    >
      <h2
        id="home-why-sopet-heading"
        className="text-center sop-headline-md-medium text-sop-neutral-gray-200"
      >
        ทำไมต้องซื้อสินค้ากับ Sopet ?
      </h2>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
        <WhySopetCard
          title="สัตวแพทย์แนะนำ"
          description={
            <>
              ช่วยแนะนำสินค้าให้เหมาะกับ
              <br className="hidden md:block" aria-hidden />
              สัตว์เลี้ยงของคุณ
            </>
          }
          cardClassName="bg-sop-secondary-300"
          wellClassName="sm:w-[247px] bg-sop-secondary-400"
          media={
            <>
              <div className="pointer-events-none absolute -right-10 -top-16 size-[280px] sm:-right-4 sm:-top-20 sm:size-[355px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/vet-plus.svg`}
                  alt=""
                  className="size-full max-w-none"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute inset-y-0 -right-4 w-[160%] sm:-right-6 sm:w-[180%]">
                <Image
                  src={`${ASSET_BASE}/vet.png`}
                  alt=""
                  fill
                  className="object-contain object-right-bottom"
                  sizes="(max-width: 640px) 140px, 247px"
                  aria-hidden
                />
              </div>
            </>
          }
        />

        <WhySopetCard
          title="ปรึกษาทุกปัญหา"
          description={
            <>
              สอบถามได้ก่อนซื้อ
              <br className="hidden md:block" aria-hidden />
              มั่นใจทุกการเลือก
            </>
          }
          cardClassName="bg-sop-primary-300"
          wellClassName="bg-sop-neutral-orangealpha-400"
          media={
            <>
              <div className="pointer-events-none absolute inset-y-0 -right-8 w-[200%] overflow-hidden sm:-right-6 sm:w-[220%]">
                <Image
                  src={`${ASSET_BASE}/consult.png`}
                  alt=""
                  fill
                  className="object-contain object-right-bottom"
                  sizes="(max-width: 640px) 140px, 223px"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute left-[12%] top-1/2 size-6 -translate-y-1/2 sm:left-[8%]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-icons.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-2 top-6 size-7">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-phone.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
            </>
          }
        />

        <WhySopetCard
          title="ของแท้ 100%"
          description="ส่งตรงจากโรงพยาบาล และ สนุนโดยคณะนวัตกรรม (CSII)"
          cardClassName="bg-sop-primary-300"
          wellClassName="bg-sop-neutral-orangealpha-600"
          media={
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
                <Image
                  src={`${ASSET_BASE}/verify.png`}
                  alt=""
                  width={143}
                  height={172}
                  className="h-full w-auto max-w-none object-contain"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-3 top-4 size-[41px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-shield.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-6 left-1 size-[26px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-star.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
            </>
          }
        />

        <WhySopetCard
          title="ส่วนลดพิเศษ"
          description={
            <>
              ช้อปง่าย โปรคุ้ม
              <br className="hidden md:block" aria-hidden />
              ราคาพิเศษตลอดปี
            </>
          }
          cardClassName="bg-sop-additionalblue-200"
          wellClassName="bg-sop-additionalblue-300"
          media={
            <>
              <div className="pointer-events-none absolute inset-y-0 -right-10 w-[200%] sm:-right-8 sm:w-[220%]">
                <Image
                  src={`${ASSET_BASE}/discount.png`}
                  alt=""
                  fill
                  className="object-contain object-right-bottom"
                  sizes="(max-width: 640px) 140px, 223px"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-[90px] left-1 flex size-[52px] items-center justify-center sm:bottom-[100px] sm:left-2 sm:size-[62px]">
                <div className="size-11 rotate-[56deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-tag.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute right-1 top-[80px] flex size-[52px] items-center justify-center sm:right-2 sm:top-[100px] sm:size-[59px]">
                <div className="size-11 -rotate-[15deg] sm:size-12">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-gift.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
            </>
          }
        />
      </div>
    </section>
  );
}
