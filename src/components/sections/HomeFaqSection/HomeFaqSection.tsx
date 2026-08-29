'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DownArrowIcon } from '@/components/atoms/icons/filled/DownArrowIcon';

export type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type HomeFaqSectionProps = {
  heading?: string;
  items: HomeFaqItem[];
};

export function HomeFaqSection({ heading = 'คำถามที่พบบ่อย', items }: HomeFaqSectionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(items[0]?.id ?? null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});

  const measureHeights = useCallback(() => {
    const nextHeights = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = contentRefs.current[item.id]?.scrollHeight ?? 0;
      return acc;
    }, {});

    setContentHeights(nextHeights);
  }, [items]);

  useEffect(() => {
    measureHeights();
    window.addEventListener('resize', measureHeights);

    return () => {
      window.removeEventListener('resize', measureHeights);
    };
  }, [measureHeights]);

  const toggleItem = (itemId: string) => {
    setOpenItemId((prevItemId) => (prevItemId === itemId ? null : itemId));
  };

  return (
    <div className="relative flex w-full flex-col items-center py-sop-32px px-sop-12px md:py-sop-64px md:px-sop-24px">
      {/* Soft ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[500px] sm:w-[700px] md:w-[900px] rounded-full bg-gradient-to-r from-orange-200/50 via-amber-100/60 to-orange-100/40 blur-[100px] opacity-80"
      />

      {/* Heading */}
      <div className="relative z-10 text-center mb-6 md:mb-8">
        <h2 className="sop-headline-md-medium text-sop-neutral-gray-200 md:sop-headline-lg-medium">
          {heading}
        </h2>
      </div>

      {/* Dogs Illustration */}
      <div className="relative z-10 -mb-8 sm:-mb-12 md:-mb-16 flex justify-center px-4 pointer-events-none">
        {/* Warm orange radial glow directly behind dogs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[260px] sm:h-[320px] md:h-[380px] w-[320px] sm:w-[480px] md:w-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/45 via-amber-300/30 to-transparent blur-[50px] sm:blur-[70px] md:blur-[80px]"
        />
        <Image
          src="/images/faq/sop-faq-dog.png"
          alt="SOPet Pets"
          width={520}
          height={220}
          priority
          className="relative z-10 h-auto w-auto max-w-[280px] sm:max-w-[380px] md:max-w-[480px]"
        />
      </div>

      {/* FAQ Card Container */}
      <div className="relative z-0 mx-auto flex w-full max-w-4xl flex-col rounded-sop-24 md:rounded-sop-32 bg-sop-base-white px-6 py-6 md:px-12 md:py-10 shadow-sm border border-sop-neutral-grayalpha-100">
        {items.map((item) => {
          const isOpen = openItemId === item.id;
          const buttonId = `home-faq-button-${item.id}`;
          const panelId = `home-faq-panel-${item.id}`;

          return (
            <div
              key={item.id}
              className="border-b border-sop-neutral-grayalpha-200 last:border-b-0"
            >
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between py-4 md:py-5 text-left cursor-pointer transition-colors hover:opacity-80"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
              >
                <p className="sop-body-md-medium md:sop-headline-sm-medium text-sop-neutral-gray-200 pr-4">
                  {item.question}
                </p>
                <div className="shrink-0">
                  <DownArrowIcon
                    size={{ mobile: 14, desktop: 16 }}
                    className={`transition-transform duration-300 text-sop-neutral-gray-300 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="overflow-hidden"
                style={{
                  maxHeight: isOpen ? `${contentHeights[item.id] ?? 0}px` : '0px',
                  opacity: isOpen ? 1 : 0,
                  transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out',
                }}
              >
                <div
                  ref={(node) => {
                    contentRefs.current[item.id] = node;
                  }}
                  className="pb-4 md:pb-5"
                >
                  <p className="sop-body-sm-regular md:sop-body-md-regular text-sop-neutral-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
