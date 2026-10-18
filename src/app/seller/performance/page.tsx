"use client";

// DESIGN DIRECTION: locked performance scorecard with pip bars and peer benchmark — per brief.

import { AlertCircle, TrendingUp } from "lucide-react";
import { HolidayBanner } from "@/components/seller/holiday-banner";
import { useSellerOrders } from "@/lib/seller-orders";
import { SELLER_PERFORMANCE_PEER_BENCHMARK, getSellerPerformance, sellerPipBar } from "@/lib/seller-performance";

export default function SellerPerformancePage() {
  const orders = useSellerOrders();
  const performance = getSellerPerformance(orders);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-performance">
      <HolidayBanner />
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="mr-auto">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Health</p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">Performance</h1>
          <p className="mt-1 text-[13px] text-muted">How your store scores against Kora peers.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${performance.chip.classes}`} data-testid="seller-performance-chip">
          {performance.chip.label}
        </span>
      </div>
      <div className="grid gap-4 rounded-[14px] bg-paper p-5 shadow-sm md:grid-cols-[auto,1px,1fr]">
        <div className="text-center">
          <p className="text-[40px] font-bold leading-none text-ink" data-testid="seller-performance-score">
            {performance.score.toFixed(1)}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted">Out of 5.0</p>
        </div>
        <div className="hidden border-l border-border md:block" />
        <div>
          <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
            <TrendingUp size={16} aria-hidden="true" className="text-brand" />
            {SELLER_PERFORMANCE_PEER_BENCHMARK}
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Weighted across fulfilment speed, product rating, return rate and cancellation rate.
          </p>
        </div>
      </div>
      <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm" data-testid="seller-performance-dimensions">
        {performance.dimensions.map((dimension) => (
          <div key={dimension.label} className="grid gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink">
                {dimension.label}
                <span className="ml-2 text-[11px] font-normal text-muted">Weight {Math.round(dimension.weight * 100)}%</span>
              </p>
              <p className="text-[12px] font-bold text-muted" data-testid={`seller-performance-pips-${dimension.label}`}>
                {sellerPipBar(dimension.pips)}
              </p>
            </div>
            <div className="flex h-2.5 gap-1">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 flex-1 rounded-full ${index < Math.round(dimension.pips * 2) ? "bg-brand" : "bg-sand"}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 rounded-[14px] bg-warn-soft p-5">
        <AlertCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
        <div>
          <p className="text-[13px] font-bold text-warn">Keep your score moving up</p>
          <p className="mt-1 text-[13px] text-ink">Mark orders shipped within 24h and answer help requests within 2 hours to lift your fulfilment and rating pips.</p>
        </div>
      </div>
    </div>
  );
}
