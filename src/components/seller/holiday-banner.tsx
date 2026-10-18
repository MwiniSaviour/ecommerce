"use client";

// DESIGN DIRECTION: seller holiday break notice — inspired by Jumia holiday pause banner; not Jumia-verified.

import Link from "next/link";
import { PauseCircle, Plane } from "lucide-react";

import { useSellerSettings } from "@/lib/seller-settings";

export function HolidayBanner() {
  const settings = useSellerSettings();
  if (settings.holidayMode) {
    return (
      <div
        className="flex flex-wrap items-center gap-3 rounded-[14px] bg-warn-soft px-4 py-3 shadow-sm"
        data-testid="seller-holiday-banner"
      >
        <PauseCircle size={18} className="text-warn" aria-hidden="true" />
        <p className="mr-auto text-[13px] font-bold text-ink">
          Holiday Mode is on — buyers cannot check out your listings and no cancellation penalties apply.
        </p>
        <Link
          href="/seller/settings"
          className="flex min-h-9 items-center rounded-full border border-warn/40 px-4 text-[12px] font-bold text-warn hover:bg-warn/10"
        >
          Manage
        </Link>
      </div>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-[14px] bg-info-soft px-4 py-3 shadow-sm"
      data-testid="seller-holiday-banner"
    >
      <Plane size={18} className="text-brand" aria-hidden="true" />
      <p className="mr-auto text-[13px] text-ink">
        Going on break? Holiday Mode pauses your storefront and shields your seller score from cancellations.
      </p>
      <Link
        href="/seller/settings"
        className="flex min-h-9 items-center rounded-full bg-brand px-4 text-[12px] font-bold text-white transition-colors hover:bg-brand-deep"
      >
        Pause for holidays
      </Link>
    </div>
  );
}
