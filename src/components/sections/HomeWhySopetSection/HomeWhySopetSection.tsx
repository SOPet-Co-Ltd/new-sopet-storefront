import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ASSET_BASE = '/images/home/why-sopet';

function PlusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        fill="currentColor"
        d="M10.25 3.75h3.5v6.5h6.5v3.5h-6.5v6.5h-3.5v-6.5h-6.5v-3.5h6.5V3.75Z"
      />
    </svg>
  );
}

type WhySopetCardProps = {
  title: string;
  description: ReactNode;
  cardClassName: string;
  wellClassName: string;
  /** Desktop overlays (well-relative). Hidden on mobile. */
  desktopMedia?: ReactNode;
  /** Mobile stage overlays (photo + icons). Hidden on md+. */
  mobileMedia?: ReactNode;
};

function WhySopetCard({
  title,
  description,
  cardClassName,
  wellClassName,
  desktopMedia,
  mobileMedia,
}: WhySopetCardProps) {
  return (
    <article
      className={cn(
        'relative flex w-full flex-col items-center overflow-hidden rounded-sop-28 px-5 pb-5 pt-6 md:min-h-[228px] md:flex-row md:items-center md:gap-5 md:p-6',
        cardClassName,
      )}
    >
      <div className="relative z-10 flex w-full flex-col gap-1 text-center text-sop-neutral-gray-200 md:min-w-0 md:flex-1 md:gap-3 md:text-left">
        <h3 className="sop-headline-sm-bold">{title}</h3>
        <p className="sop-body-lg-regular">{description}</p>
      </div>

      {/* Mobile: well is a stage; photo sits on it and can rise above the well top */}
      <div className="relative mt-5 w-full pt-16 md:hidden">
        <div className={cn('h-[180px] w-full rounded-sop-36', wellClassName)} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0">{mobileMedia}</div>
      </div>

      {/* Desktop: fixed well with Figma overlays */}
      <div
        className={cn(
          'relative hidden h-[180px] w-[223px] shrink-0 overflow-visible rounded-sop-36 md:block',
          wellClassName,
        )}
      >
        {desktopMedia}
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
              <br aria-hidden />
              สัตว์เลี้ยงของคุณ
            </>
          }
          cardClassName="bg-sop-secondary-300"
          wellClassName="bg-sop-secondary-400 md:w-[247px]"
          mobileMedia={
            <>
              <PlusMark className="absolute left-[12%] top-[42%] size-7 text-white/90" />
              <PlusMark className="absolute right-[14%] top-[48%] size-5 text-white/80" />
              <div className="absolute bottom-0 left-1/2 h-[225px] w-[280px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/vet.png`}
                  alt=""
                  fill
                  className="object-cover object-[70%_100%]"
                  sizes="280px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute left-[-8px] top-[-104px] size-[355px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/vet-plus.svg`}
                  alt=""
                  className="size-full max-w-none"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-[-21px] right-[-90px] h-[225px] w-[337px]">
                <Image
                  src={`${ASSET_BASE}/vet.png`}
                  alt=""
                  fill
                  className="object-cover object-right-bottom"
                  sizes="337px"
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
              <br aria-hidden />
              มั่นใจทุกการเลือก
            </>
          }
          cardClassName="bg-sop-primary-300"
          wellClassName="bg-sop-neutral-orangealpha-400"
          mobileMedia={
            <>
              <div className="absolute left-[10%] top-[46%] size-7 -translate-y-1/2">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-icons.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute right-[10%] top-[40%] size-7">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-phone.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute bottom-0 left-1/2 h-[220px] w-[200px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/consult.png`}
                  alt=""
                  fill
                  className="object-cover object-[88%_15%]"
                  sizes="200px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute bottom-0 right-[-21px] h-[204px] w-[337px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop offsets require raw img sizing */}
                <img
                  src={`${ASSET_BASE}/consult.png`}
                  alt=""
                  className="absolute left-[-89.91%] top-[-15.7%] h-[137.29%] w-[207.51%] max-w-none object-cover"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-[38%] left-[8%] size-[27px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-icons.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-[6%] top-[14%] h-[28px] w-[29px]">
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
          description={
            <>
              ส่งตรงจากโรงพยาบาล และ
              <br className="md:hidden" aria-hidden />
              สนุนโดยคณะนวัตกรรม (CSII)
            </>
          }
          cardClassName="bg-sop-primary-300"
          wellClassName="bg-sop-neutral-orangealpha-600"
          mobileMedia={
            <>
              <div className="absolute left-[12%] top-1/2 size-6 -translate-y-1/2">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-star.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute right-[12%] top-[38%] size-8">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-shield.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute bottom-[-8px] left-1/2 h-[200px] w-[160px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/verify.png`}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="160px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute left-[38px] top-[25px] h-[172px] w-[143px]">
                <Image
                  src={`${ASSET_BASE}/verify.png`}
                  alt=""
                  fill
                  className="object-contain object-bottom"
                  sizes="143px"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-[6%] top-[17px] size-[41px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-shield.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute left-[20px] top-[121px] size-[26px]">
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
              <br aria-hidden />
              ราคาพิเศษตลอดปี
            </>
          }
          cardClassName="bg-sop-additionalblue-200"
          wellClassName="bg-sop-additionalblue-300"
          mobileMedia={
            <>
              <div className="absolute left-[8%] top-[42%] flex size-11 items-center justify-center">
                <div className="size-9 rotate-[56deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-tag.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="absolute right-[8%] top-[44%] flex size-11 items-center justify-center">
                <div className="size-9 -rotate-[15deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-gift.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 h-[225px] w-[260px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/discount.png`}
                  alt=""
                  fill
                  className="object-cover object-[78%_100%]"
                  sizes="260px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute bottom-0 right-[-54px] h-[239px] w-[358px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop offsets require raw img sizing */}
                <img
                  src={`${ASSET_BASE}/discount.png`}
                  alt=""
                  className="absolute left-[-34.82%] top-0 h-full w-[118.46%] max-w-none object-cover"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-[58%] left-[4%] flex size-[62px] items-center justify-center">
                <div className="size-[44px] rotate-[56deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-tag.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute right-[2%] top-[48%] flex size-[59px] items-center justify-center">
                <div className="size-12 -rotate-[15deg]">
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
