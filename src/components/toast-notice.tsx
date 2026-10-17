"use client";

import { Check } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";

export function ToastNotice() {
  const { toastMessage } = useStorefront();
  if (!toastMessage) return null;

  return (
    <div className="toast-enter pointer-events-none fixed bottom-[88px] left-1/2 z-[100] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 sm:bottom-6" role="status" aria-live="polite" aria-atomic="true">
      <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-forest px-4 py-3.5 text-sm text-white shadow-[0_16px_40px_rgba(24,51,43,0.22)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-leaf"><Check aria-hidden="true" size={15} strokeWidth={2.5} /></span>
        <p className="min-w-0 flex-1 text-[12px] font-medium leading-snug sm:text-[13px]">{toastMessage}</p>
      </div>
    </div>
  );
}
