'use client';

import { useLottie } from 'lottie-react';
import runningDogAnimation from '@/assets/lottie/runningDog.json';

export function LottiePlayer({ onReady }: { onReady: () => void }) {
  const { View } = useLottie(
    {
      animationData: runningDogAnimation,
      loop: true,
      autoplay: true,
      onDOMLoaded: onReady,
    },
    { width: 262, height: 131 },
  );

  return View;
}

export default LottiePlayer;
