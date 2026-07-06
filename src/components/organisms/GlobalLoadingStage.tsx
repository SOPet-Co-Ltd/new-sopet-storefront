"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function GlobalLoadingStage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sop-primary-100 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <DotLottieReact
          style={{ width: 262, height: 131 }}
          src="/runningDog.lottie"
          loop
          autoplay
        />

        <label className="sop-body-lg-medium text-sop-secondary-500 text-center">
          กำลังโหลด ...
        </label>
      </div>
    </div>
  )
}
