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

      {/* Mobile: well stage; photo can rise above the well top into pt-* space */}
      <div className="relative mt-5 w-full pt-14 md:hidden">
        <div className={cn('h-[180px] w-full rounded-sop-36', wellClassName)} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0">{mobileMedia}</div>
      </div>

      {/* Desktop: well stays put; subjects can overflow and clip to the card */}
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
              <PlusMark className="absolute left-[10%] top-[48%] size-7 text-white/90" />
              <PlusMark className="absolute right-[12%] top-[52%] size-5 text-white/80" />
              {/* Head peeks above well; bottom flush with well */}
              <div className="absolute -bottom-[21px] left-1/2 h-[236px] w-[220px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/vet.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="220px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <PlusMark className="absolute left-[8%] top-[40%] z-10 size-6 text-white/90" />
              <PlusMark className="absolute right-[10%] top-[46%] z-10 size-5 text-white/80" />
              <div className="pointer-events-none absolute -bottom-5 left-1/2 z-20 h-[220px] w-[280px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/vet.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="280px"
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
              <div className="absolute bottom-[18%] left-[8%] size-7">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-icons.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute right-[8%] top-[38%] size-7">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-phone.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute bottom-0 left-1/2 h-[230px] w-[190px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/consult.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="190px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute bottom-[18%] left-[6%] z-10 size-[27px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-icons.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-[6%] top-[14%] z-10 size-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/consult-phone.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-[200px] w-[230px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/consult.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="230px"
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
              <div className="absolute bottom-[22%] left-[10%] size-6">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-star.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute right-[10%] top-[36%] size-8">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-shield.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 top-14 flex items-center justify-center">
                <div className="relative h-[155px] w-[130px]">
                  <Image
                    src={`${ASSET_BASE}/verify.webp`}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="130px"
                    aria-hidden
                  />
                </div>
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute left-[8%] top-[62%] z-10 size-[26px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-star.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute right-[6%] top-[10%] z-10 size-[36px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                <img
                  src={`${ASSET_BASE}/verify-shield.svg`}
                  alt=""
                  className="size-full"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-[150px] w-[125px]">
                  <Image
                    src={`${ASSET_BASE}/verify.webp`}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="125px"
                    aria-hidden
                  />
                </div>
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
              <div className="absolute left-[6%] top-[46%] flex size-11 items-center justify-center">
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
              <div className="absolute bottom-[14%] right-[6%] flex size-11 items-center justify-center">
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
              {/* Tall frame so head clearly clears the well top */}
              <div className="absolute bottom-0 left-1/2 h-[250px] w-[210px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/discount.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="210px"
                  aria-hidden
                />
              </div>
            </>
          }
          desktopMedia={
            <>
              <div className="pointer-events-none absolute bottom-[48%] left-[4%] z-10 flex size-[48px] items-center justify-center">
                <div className="size-[36px] rotate-[56deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-tag.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-[10%] right-[4%] z-10 flex size-[48px] items-center justify-center">
                <div className="size-10 -rotate-[15deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG from design export */}
                  <img
                    src={`${ASSET_BASE}/discount-gift.svg`}
                    alt=""
                    className="size-full"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-[200px] w-[220px] -translate-x-1/2">
                <Image
                  src={`${ASSET_BASE}/discount.webp`}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain object-bottom"
                  sizes="220px"
                  aria-hidden
                />
              </div>
            </>
          }
        />
      </div>
    </section>
  );
}
