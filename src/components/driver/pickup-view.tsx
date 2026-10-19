"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ClipboardCheck, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api";
import {
  getDriverTaskById,
  updateTaskStatus,
  type DriverTask,
} from "@/lib/driver-tasks";
import { StatusBadge, pickupCode } from "@/components/driver/driver-ui";

const CHECKLIST = [
  "Parcel received from the hub team",
  "Parcel count matches the manifest",
  "No visible damage on the box",
];

export function PickupView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [tasks, setTasks] = useState<DriverTask[]>([]);

  useEffect(() => {
    let active = true;
    authApi
      .getDriverTasks()
      .then((fresh) => {
        if (active) setTasks(fresh);
      })
      .catch(() => {
        if (active) setTasks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const task = getDriverTaskById(id, tasks);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  if (!task || task.status === "offered") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <ClipboardCheck size={28} aria-hidden="true" className="text-muted" />
        <p className="text-[14px] font-bold text-ink">Pickup unavailable</p>
        <p className="max-w-[26ch] text-[12px] text-muted">Accept the task in My tasks before starting its pickup.</p>
        <Link href="/driver/tasks" className="text-[12px] font-bold text-info hover:underline">
          Back to My tasks
        </Link>
      </main>
    );
  }

  const checkedCount = checked.filter(Boolean).length;
  const allChecked = checkedCount === CHECKLIST.length;
  const confirmClass =
    "motion-safe:transition inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] px-5 text-[14px] font-bold text-white";
  const ready = task.status === "accepted" || task.status === "picked-up";

  if (task.status !== "accepted") {
    const closed = task.status === "delivered" || task.status === "failed" || task.status === "returned";
    return (
      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <Link href={`/driver/job?id=${task.id}`} className="text-[12px] font-bold text-info hover:underline">
            {task.id}
          </Link>
          <StatusBadge status={task.status} />
        </div>
        {closed ? (
          <main className="flex flex-col items-center gap-3 py-10 text-center">
            <ClipboardCheck size={24} aria-hidden="true" className="mx-auto text-muted" />
            <p className="text-[14px] font-bold text-ink">Task closed</p>
            <p className="max-w-[26ch] text-[12px] text-muted">This task is finished, so its pickup step is no longer available.</p>
          </main>
        ) : (
          <section className="rounded-[4px] border border-ok bg-ok-soft p-4 text-center">
            <ClipboardCheck size={24} aria-hidden="true" className="mx-auto text-ok" />
            <p className="mt-2 text-[14px] font-bold text-ink">Picked up</p>
            <p className="mt-1 text-[12px] text-muted">The parcel was collected from {task.pickup.hub}.</p>
          </section>
        )}
        <Link
          href={`/driver/job?id=${task.id}`}
          className={`${confirmClass} bg-brand hover:opacity-90`}
        >
          Continue
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <Link href={`/driver/job?id=${task.id}`} className="text-[12px] font-bold text-info hover:underline">
          {task.id}
        </Link>
        <StatusBadge status={task.status} />
      </div>
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Pickup</h1>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <p className="text-[12px] font-bold text-ink">{task.pickup.hub}</p>
        <p className="mt-0.5 text-[11px] text-muted">{task.pickup.address}</p>
        <p className="mt-2 text-[12px] text-ink/80">{task.itemsSummary}</p>
      </section>

      <section className="rounded-[4px] border border-info bg-info-soft p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <KeyRound size={15} aria-hidden="true" /> Handover PIN
        </h2>
        <p aria-live="polite" className="mt-2 text-center font-mono text-[28px] font-bold tracking-[0.35em] text-info">
          {pickupCode(task)}
        </p>
        <p className="mt-1 text-center text-[11px] text-muted">Share this PIN with the hub agent to confirm handover.</p>
      </section>

      {ready && (
        <section className="rounded-[4px] border border-border bg-paper p-4">
          <h2 className="text-[13px] font-bold text-ink">Pre-departure checklist</h2>
          <p className="mt-0.5 text-[11px] text-muted">{checkedCount} of {CHECKLIST.length} confirmed</p>
          <ul className="mt-3 flex flex-col gap-2">
            {CHECKLIST.map((item, index) => {
              const isChecked = checked[index] ?? false;
              return (
                <li key={item}>
                  <label className="motion-safe:transition flex min-h-11 cursor-pointer items-center gap-3 rounded-[4px] border border-border px-3 hover:bg-sand">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setChecked((prev) => {
                          const next = [...prev];
                          next[index] = !isChecked;
                          return next;
                        })
                      }
                      className="size-4 accent-[#f68b1e]"
                    />
                    <span className="text-[12px] text-ink">{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        type="button"
        disabled={!allChecked}
        onClick={() => {
          const updated = tasks.map((entry) =>
            entry.id === id ? updateTaskStatus(entry, "picked-up", `Package picked up at ${task.pickup.hub}`) : entry,
          );
          void authApi.setDriverTasks(updated);
          setTasks(updated);
        }}
        className={`${confirmClass} ${allChecked ? "bg-brand hover:opacity-90" : "cursor-not-allowed bg-sand text-muted"}`}
      >
        <Check size={16} aria-hidden="true" /> {allChecked ? "Confirm pickup" : `Confirm all ${CHECKLIST.length} checks first`}
      </button>
    </main>
  );
}
