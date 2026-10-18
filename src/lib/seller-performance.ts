// DESIGN DIRECTION: seller score dashboard — inspired by Jumia seller trading performance with four weighted dimensions; not Jumia-verified.

import type { SellerOrder } from "@/lib/seller-orders";

export type SellerPerformanceDimension = {
  label: string;
  weight: number;
  value: number;
  pips: number;
};

export type SellerPerformance = {
  dimensions: SellerPerformanceDimension[];
  score: number;
  chip: { label: string; classes: string };
  peerBenchmark: number;
};

export const SELLER_PERFORMANCE_PEER_BENCHMARK = "Average for phones & electronics peers: 3.8";

function clampPips(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value * 10) / 10));
}

function sellerPerformanceChip(score: number): { label: string; classes: string } {
  if (score >= 4.2) return { label: "Strong performer", classes: "bg-ok-soft text-ok" };
  if (score >= 3.5) return { label: "In good standing", classes: "bg-warn-soft text-ink" };
  return { label: "Needs attention", classes: "bg-warn-soft text-warn" };
}

export function getSellerPerformance(orders: SellerOrder[]): SellerPerformance {
  const total = orders.length;
  const shipped = orders.filter((order) => order.status === "shipped").length;
  const returned = orders.filter((order) => order.status === "returned").length;
  const cancelled = orders.filter((order) => order.status === "cancelled").length;
  const late = returned + cancelled;

  const onTime = 4 + Math.min(1, total === 0 ? 0 : shipped / total) - (total === 0 ? 0 : (late / total) * 4);
  const rating = 4.4;
  const returnRate = 5 - (total === 0 ? 0 : (returned / total) * 9);
  const cancellation = 5 - (total === 0 ? 0 : (cancelled / total) * 11);

  const dimensions: SellerPerformanceDimension[] = [
    { label: "On-time shipping quality", weight: 0.25, value: clampPips(onTime), pips: clampPips(onTime) },
    { label: "Product ratings", weight: 0.25, value: clampPips(rating), pips: clampPips(rating) },
    { label: "Return rate", weight: 0.25, value: clampPips(returnRate), pips: clampPips(returnRate) },
    { label: "Cancellation rate", weight: 0.25, value: clampPips(cancellation), pips: clampPips(cancellation) },
  ];
  const score =
    Math.round(dimensions.reduce((sum, dimension) => sum + dimension.weight * dimension.pips, 0) * 100) / 100;

  return { dimensions, score, chip: sellerPerformanceChip(score), peerBenchmark: 3.8 };
}

export function sellerPipBar(pips: number): string {
  return `${Math.round(clampPips(pips) * 2)}/10`;
}
