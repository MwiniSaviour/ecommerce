"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Banknote, Bike, MapPin, Package, Timer, TriangleAlert } from "lucide-react";
import { getDriverTaskById, sortTasksNewestFirst, updateTaskStatus, type DriverTask } from "@/lib/driver-tasks";
import { authApi } from "@/lib/api";
import { formatGhc, relativeAge, StatusBadge } from "@/components/driver/driver-ui";

function useAvailability() {
  const [value, setValue] = useState<"online" | "offline" | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      authApi
        .getDriverAvailability()
        .then((next) => {
          if (active) setValue(next);
        })
        .catch(() => {
          if (active) setValue("offline");
        });
    };
    load();
    const unsubscribe = authApi.subscribeDriverAvailability(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return [value, (next: "online" | "offline") => void authApi.setDriverAvailability(next)] as const;
}

export function HomeView() {
  const router = useRouter();
  const [availability, setAvailability] = useAvailability();
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    authApi
      .getDriverTasks()
      .then((next) => {
        if (active) setTasks(next);
      })
      .catch(() => {
        if (active) setTasks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    void tick;
    return sortTasksNewestFirst(tasks);
  }, [tasks, tick]);
  const today = new Date().setHours(0, 0, 0, 0);
  const todayDelivered = sorted.filter(
    (task) => task.status === "delivered" && (task.history[task.history.length - 1]?.at ?? 0) >= today,
  );
  const todayEarnings = todayDelivered.reduce((sum, task) => sum + task.earnings, 0) - todayDelivered.reduce((sum, task) => sum + (task.codAmount ?? 0), 0) * 0;
  const activeCount = sorted.filter((task) => ["accepted", "picked-up", "en-route"].includes(task.status)).length;
  const nextTask = sorted.find((task) => task.status === "offered") ?? null;

  function acceptNext() {
    if (!nextTask) return;
    const copy = tasks;
    const updated = updateTaskStatus(getDriverTaskById(nextTask.id, copy) ?? nextTask, "accepted", "Task accepted from Kora Fleet");
    void authApi
      .setDriverTasks(copy.map((task) => (task.id === updated.id ? updated : task)))
      .then(() => authApi.getDriverTasks())
      .then((fresh) => setTasks(fresh));
    router.push(`/driver/job?id=${nextTask.id}`);
  }

  return (
    <main data-tick={tick} className="flex flex-1 flex-col gap-4 px-4 py-5">
      <section
        className={`rounded-[4px] border p-4 ${availability === "online" ? "border-ok bg-ok-soft" : "border-border bg-paper"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${availability === "online" ? "bg-ok" : "bg-muted"}`}
            />
            <div>
              <p className={`text-[14px] font-bold ${availability === "online" ? "text-ok" : "text-ink"}`}>
                {availability === "online" ? "You are online" : "You are offline"}
              </p>
              <p className="text-[11px] text-muted">
                {availability === "online" ? "Receiving offers near Accra Central Hub" : "Go online to receive delivery offers"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAvailability(availability === "online" ? "offline" : "online")}
            aria-pressed={availability === "online"}
            className={`motion-safe:transition min-h-11 rounded-[99px] px-4 text-[12px] font-bold ${
              availability === "online"
                ? "border border-ok/40 text-ok hover:bg-ok/10"
                : "bg-brand text-white hover:bg-brand-deep"
            }`}
          >
            {availability === "online" ? "Go offline" : "Go online"}
          </button>
        </div>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted">Today&apos;s earnings</h2>
        <p className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-ink">{formatGhc(todayEarnings)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[4px] bg-sand p-2">
            <p className="text-[16px] font-bold text-ink">{todayDelivered.length}</p>
            <p className="text-[10px] text-muted">Trips today</p>
          </div>
          <div className="rounded-[4px] bg-sand p-2">
            <p className="text-[16px] font-bold text-ink">{activeCount}</p>
            <p className="text-[10px] text-muted">In progress</p>
          </div>
          <div className="rounded-[4px] bg-sand p-2">
            <p className="text-[16px] font-bold text-ink">98%</p>
            <p className="text-[10px] text-muted">Acceptance</p>
          </div>
        </div>
      </section>

      {nextTask ? (
        <section className={`rounded-[4px] border p-4 ${availability === "online" ? "border-brand bg-leaf" : "border-border bg-paper"}`}>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-brand-deep">
              <Package size={14} aria-hidden="true" /> Next task
            </p>
            <StatusBadge status="offered" />
          </div>
          <h2 className="mt-2 text-[15px] font-bold text-ink">{nextTask.pickup.hub} → {nextTask.dropoff.area}</h2>
          <p className="text-[12px] text-muted">
            {nextTask.itemsSummary} · {nextTask.distanceKm} km · {nextTask.etaMin} min
          </p>
          <p className="mt-2 flex items-center gap-1 text-[13px] font-bold text-ok">
            <Banknote size={14} aria-hidden="true" /> Earn {formatGhc(nextTask.earnings)}
            {nextTask.payment === "COD" && nextTask.codAmount !== null ? ` · collect GH₵ ${nextTask.codAmount} cash` : ""}
          </p>
          <button
            type="button"
            onClick={acceptNext}
            disabled={availability === "offline"}
            className="motion-safe:transition mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-brand text-[13px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Accept task <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      ) : (
        <section className="rounded-[4px] border border-border bg-paper p-4 text-center">
          <TriangleAlert size={20} aria-hidden="true" className="mx-auto text-muted" />
          <p className="mt-2 text-[13px] font-bold text-ink">No new offers right now</p>
          <p className="mt-1 text-[12px] text-muted">Check back when you&apos;re online — offers arrive near your hub.</p>
        </section>
      )}

      {(sorted.find((task) => ["accepted", "picked-up", "en-route"].includes(task.status))) != null && (
        <Link
          href={`/driver/job?id=${sorted.find((task) => ["accepted", "picked-up", "en-route"].includes(task.status))!.id}`}
          className="motion-safe:transition flex items-center justify-between rounded-[4px] border border-info bg-info-soft p-4 hover:border-info/60"
        >
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-info">
              <Bike size={14} aria-hidden="true" /> Continue delivery
            </p>
            <p className="mt-1 text-[14px] font-bold text-ink">
              {sorted.find((task) => ["accepted", "picked-up", "en-route"].includes(task.status))!.id}
            </p>
          </div>
          <ArrowRight size={18} aria-hidden="true" className="text-info" />
        </Link>
      )}

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="text-[13px] font-bold text-ink">Recent trips</h2>
        <ul className="mt-2 flex flex-col divide-y divide-border">
          {sorted
            .filter((task) => task.status === "delivered")
            .slice(0, 3)
            .map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink">{task.dropoff.area}</p>
                  <p className="text-[11px] text-muted">
                    {task.id} · <MapPin size={11} className="inline" aria-hidden="true" /> {relativeAge(task.history[task.history.length - 1]?.at ?? 0)}
                  </p>
                </div>
                <span className="text-[13px] font-bold text-ok">+{formatGhc(task.earnings)}</span>
              </li>
            ))}
        </ul>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
          <BadgeCheck size={13} aria-hidden="true" /> Verified rider badge · <Timer size={13} aria-hidden="true" /> Saturday payout to MTN MoMo • 024
        </p>
      </section>
    </main>
  );
}
