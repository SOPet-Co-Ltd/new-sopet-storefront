'use client';

import dynamic from 'next/dynamic';

const GlobalLoadingStage = dynamic(
  () => import('@/components/organisms/GlobalLoadingStage').then((mod) => mod.GlobalLoadingStage),
  { ssr: false },
);

export default function Loading() {
  return <GlobalLoadingStage />;
}
