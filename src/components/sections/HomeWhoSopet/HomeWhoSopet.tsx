'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type StatItem = {
  value: string;
  hasPlus?: boolean;
  label: string;
};

const DEFAULT_STATS: StatItem[] = [
  { value: '5K', hasPlus: true, label: 'เจ้าของผู้ไว้วางใจ' },
  { value: '20K', hasPlus: true, label: 'ออเดอร์ที่จัดส่งแล้ว' },
  { value: '20', hasPlus: true, label: 'โรงพยาบาลพาร์ทเนอร์' },
  { value: '4.9', hasPlus: false, label: 'คะแนนรีวิวเฉลี่ย' },
];

function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, decimals: 0, suffix: value };
  const numStr = match[1];
  const suffix = match[2];
  const num = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { num, decimals, suffix };
}

function StatNumber({ value, isVisible }: { value: string; isVisible: boolean }) {
  const { num: target, decimals, suffix } = parseStatValue(value);
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current || target === 0) return;
    hasAnimatedRef.current = true;

    // Skip animation if user prefers reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    ) {
      setDisplayValue(value);
      return;
    }

    const duration = 1600; // ms
    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = target * easedProgress;

      if (decimals > 0) {
        setDisplayValue(`${current.toFixed(decimals)}${suffix}`);
      } else {
        setDisplayValue(`${Math.round(current)}${suffix}`);
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, target, decimals, suffix, value]);

  return <span>{displayValue}</span>;
}

export type HomeWhoSopetProps = {
  className?: string;
  readMoreHref?: string;
  stats?: StatItem[];
};

export function HomeWhoSopet({
  className,
  readMoreHref = '/about',
  stats = DEFAULT_STATS,
}: HomeWhoSopetProps) {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [isStatsInView, setIsStatsInView] = useState(false);

  useEffect(() => {
    const el = statsContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsStatsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);
  return (
    <section aria-labelledby="home-who-sopet-heading" className={cn('w-full', className)}>
      <div className="flex flex-col gap-10 md:gap-14 lg:gap-16">
        <div className="flex flex-col items-center justify-between gap-8 md:gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex w-full flex-col gap-3 md:gap-4 lg:max-w-[480px]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FA5A50]" aria-hidden="true" />
              <span className="sop-body-md-bold text-sop-neutral-gray-100">Sopet คือใคร ?</span>
            </div>

            <h2
              id="home-who-sopet-heading"
              className="sop-headline-md-bold text-sop-neutral-gray-100 md:sop-headline-lg-bold lg:text-[28px] lg:leading-[38px]"
            >
              แพลตฟอร์มศูนย์รวมยาและเวชภัณฑ์สัตว์ออนไลน์ที่ช่วยให้คุณค้นหาและสั่งซื้อยาสัตว์จากโรงพยาบาลและร้านขายยาทั่วประเทศ
            </h2>

            <p className="sop-body-sm-regular text-sop-neutral-gray-300 md:sop-body-md-regular">
              สนับสนุนโดยคณะนวัตกรรม <br className="md:hidden" aria-hidden="true" />
              จุฬาลงกรณ์มหาวิทยาลัย (CSII)
            </p>

            {/* ถ้ามีหน้า sopet คือใครแล้วค่อยเอากลับมา */}
            {/* <div className="pt-1">
              <Link
                href={readMoreHref}
                className="group inline-flex items-center gap-1.5 sop-body-md-medium text-sop-primary-500 transition-colors hover:text-sop-primary-600"
              >
                <span>อ่านเพิ่มเติม</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
            </div> */}
          </div>

          <div className="relative w-full max-w-[522px]">
            <div className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/home/who-sopet/Owner.svg"
                alt="ผู้ก่อตั้ง Sopet"
                width={522}
                height={412}
                className="h-auto w-full object-cover"
                priority={false}
              />
            </div>

            <div
              className="absolute -bottom-8 -left-8 z-10 hidden md:block lg:-bottom-10 lg:-left-10"
              aria-hidden="true"
            >
              <Image
                src="/images/home/who-sopet/ApproveLogo.svg"
                alt="Honest Dog Approved"
                width={149}
                height={159}
                className="h-auto w-[120px] lg:w-[140px] drop-shadow-md"
                priority={false}
              />
            </div>
          </div>
        </div>

        <div ref={statsContainerRef}>
          <div className="hidden md:flex md:items-center md:justify-between">
            {stats.map((item, index) => (
              <div key={item.label} className="flex flex-1 items-center">
                <div className="flex w-full flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold tracking-tight text-sop-neutral-gray-100 lg:text-[40px] lg:leading-[48px]">
                    <StatNumber value={item.value} isVisible={isStatsInView} />
                    {item.hasPlus && <span className="text-sop-primary-500 font-bold">+</span>}
                  </div>
                  <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-300 lg:sop-body-md-regular">
                    {item.label}
                  </p>
                </div>
                {index < stats.length - 1 && (
                  <div className="h-10 w-px bg-sop-neutral-grayalpha-200" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 text-center md:hidden">
            {stats.map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="text-3xl font-bold tracking-tight text-sop-neutral-gray-100">
                  <StatNumber value={item.value} isVisible={isStatsInView} />
                  {item.hasPlus && <span className="text-sop-primary-500 font-bold">+</span>}
                </div>
                <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
