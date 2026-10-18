"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import type { DriverTask, DriverTaskStatus } from "@/lib/driver-tasks";

const STATUS_LABELS: Record<DriverTaskStatus, string> = {
  offered: "New offer",
  accepted: "Accepted",
  "picked-up": "Picked up",
  "en-route": "En route",
  delivered: "Delivered",
  failed: "Failed",
  returned: "Returned to hub",
};

const STATUS_CARD_CLASSES: Record<DriverTaskStatus, string> = {
  offered: "border-warn bg-warn-soft",
  accepted: "border-info bg-info-soft",
  "picked-up": "border-info bg-info-soft",
  "en-route": "border-info bg-info-soft",
  delivered: "border-border bg-ok-soft",
  failed: "border-hold/30 bg-[#8a1f1f]/5",
  returned: "border-border bg-sand",
};

const STATUS_TEXT_CLASSES: Record<DriverTaskStatus, string> = {
  offered: "text-warn",
  accepted: "text-info",
  "picked-up": "text-info",
  "en-route": "text-info",
  delivered: "text-ok",
  failed: "text-hold",
  returned: "text-hold",
};

export function taskStatusLabel(status: DriverTaskStatus): string {
  return STATUS_LABELS[status];
}

export function StatusBadge({ status }: { status: DriverTaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-[99px] px-2.5 py-0.5 text-[11px] font-bold ${STATUS_CARD_CLASSES[status]} ${STATUS_TEXT_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function taskCardClass(status: DriverTaskStatus): string {
  return STATUS_CARD_CLASSES[status];
}

export function taskTextClass(status: DriverTaskStatus): string {
  return STATUS_TEXT_CLASSES[status];
}

export function pickupCode(task: DriverTask): string {
  const digits: number[] = [];
  for (let i = 0; i < task.id.length && digits.length < 4; i += 1) {
    const code = task.id.charCodeAt(i);
    if (code >= 48 && code <= 57) digits.push(code - 48);
  }
  while (digits.length < 4) {
    digits.push(((task.id.length * digits.length * 7) + 3) % 10);
  }
  return digits.join("");
}

export function formatTaskTime(at: number): string {
  return new Intl.DateTimeFormat("en-GH", { hour: "numeric", minute: "2-digit" }).format(at);
}

export function formatTaskDay(at: number): string {
  return new Intl.DateTimeFormat("en-GH", { weekday: "short", day: "numeric", month: "short" }).format(at);
}

export function relativeAge(at: number): string {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatGhc(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function weekBounds(offsetWeeks: number): { start: number; end: number } {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day - offsetWeeks * 7);
  const start = monday.getTime();
  const end = start + ((offsetWeeks === 0 ? 7 : 7) * 86_400_000);
  return { start, end: Math.min(end, Date.now() + 86_400_000) };
}
