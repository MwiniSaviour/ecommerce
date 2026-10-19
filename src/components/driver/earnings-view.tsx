"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, CalendarClock, CheckCircle2, Smartphone, XCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { sortTasksNewestFirst, type DriverTask } from "@/lib/driver-tasks";
import { formatGhc, formatTaskDay, pickupCode, relativeAge } from "@/components/driver/driver-ui";

type WeekKey = "this-week" | "last-week";

export function EarningsView() {
  const [week, setWeek] = useState<WeekKey>("this-week");
  const [rawTasks, setRawTasks] = useState<DriverTask[]>([]);

  useEffect(() => {
    let active = true;
    authApi
      .getDriverTasks()
      .then((fresh) => {
        if (active) setRawTasks(fresh);
      })
      .catch(() => {
        if (active) setRawTasks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const tasks = useMemo(() => sortTasksNewestFirst(rawTasks), [rawTasks]);

  const now = new Date();
  const mondayThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const weekStart = mondayThisWeek.getTime();
  const weekEnd = weekStart + 7 * 86_400_000;

  const windowTasks = tasks.filter((task) => {
    const deliveredAt = task.history[task.history.length - 1]?.at ?? 0;
    if (week === "this-week") return task.status === "delivered" && deliveredAt >= weekStart && deliveredAt < weekEnd;
    return task.status === "delivered" && deliveredAt >= weekStart - 7 * 86_400_000 && deliveredAt < weekStart;
  });

  const earnings = windowTasks.reduce((sum, task) => sum + task.earnings, 0);
  const codCollected = windowTasks.reduce((sum, task) => sum + (task.codAmount ?? 0), 0);
  const failedCount = tasks.filter((task) => task.status === "failed").length;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Earnings</h1>

      <div className="flex rounded-[4px] border border-border bg-paper p-1" role="tablist" aria-label="Earnings period">
        {(
          [
            ["this-week", "This week"],
            ["last-week", "Last week"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={week === key}
            onClick={() => setWeek(key)}
            className={`motion-safe:transition min-h-10 flex-1 rounded-[4px] text-[13px] font-bold ${
              week === key ? "bg-brand text-white" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="rounded-[4px] border border-info bg-info-soft p-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold uppercase tracking-wide text-info">Earned {week === "this-week" ? "this week" : "last week"}</p>
          <CalendarClock size={16} aria-hidden="true" className="text-info" />
        </div>
        <p className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-ink">{formatGhc(earnings)}</p>
        <p className="mt-1 text-[12px] text-muted">
          {windowTasks.length} trip{windowTasks.length === 1 ? "" : "s"} · GH₵ 8–25 per leg
        </p>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <Banknote size={15} aria-hidden="true" /> Payout
        </h2>
        <ul className="mt-2 flex flex-col gap-2 text-[12px] text-muted">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} aria-hidden="true" className="text-ok" /> Active earnings: {formatGhc(earnings)}
          </li>
          <li className="flex items-center gap-2">
            <Smartphone size={14} aria-hidden="true" className="text-info" /> COD collected: {formatGhc(codCollected)}
          </li>
          <li className="flex items-center gap-2">
            <XCircle size={14} aria-hidden="true" className="text-hold" /> Failed deliveries on record: {failedCount}
          </li>
          <li className="flex items-center gap-2">
            <Smartphone size={14} aria-hidden="true" className="text-info" /> Next payout — Saturday to MTN MoMo • 024
          </li>
        </ul>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="text-[13px] font-bold text-ink">Trip breakdown</h2>
        {windowTasks.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted">No delivered trips in this window yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border">
            {windowTasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-ink">
                    {task.dropoff.area} · {task.id}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatTaskDay(task.history[task.history.length - 1]?.at ?? 0)} · handover code {pickupCode(task)} ·{" "}
                    {relativeAge(task.history[task.history.length - 1]?.at ?? 0)}
                  </p>
                </div>
                <span className="text-[13px] font-bold text-ok">+{formatGhc(task.earnings)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/driver/tasks"
        className="motion-safe:transition inline-flex min-h-11 items-center justify-center rounded-[4px] border border-border bg-paper text-[13px] font-bold text-ink hover:border-brand"
      >
        View all trips
      </Link>
    </main>
  );
}
