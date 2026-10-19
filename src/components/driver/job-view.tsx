"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Check, MapPin, Package, Phone, X } from "lucide-react";
import { authApi } from "@/lib/api";
import {
  FAILED_DELIVERY_REASONS,
  getDriverTaskById,
  updateTaskStatus,
  type DriverTask,
} from "@/lib/driver-tasks";
import { StatusBadge, formatGhc, formatTaskTime, relativeAge, taskTextClass } from "@/components/driver/driver-ui";

const OFFER_WINDOW_SECONDS = 20;

function OfferTimer({ onExpire }: { onExpire: () => void }) {
  const [seconds, setSeconds] = useState(OFFER_WINDOW_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onExpire]);

  return (
    <p aria-live="polite" className="text-[11px] font-bold text-warn">
      Offer expires in {seconds}s
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className="text-right text-[12px] font-medium text-ink">{value}</span>
    </li>
  );
}

function Timeline({ task }: { task: DriverTask }) {
  return (
    <section className="rounded-[4px] border border-border bg-paper p-4">
      <h2 className="text-[13px] font-bold text-ink">Activity</h2>
      <ol className="mt-2 flex flex-col gap-2 border-l border-border pl-3">
        {[...task.history].reverse().map((entry) => (
          <li key={`${entry.at}-${entry.label}`} className="relative text-[12px] text-muted">
            <span aria-hidden="true" className="absolute -left-[15px] top-1.5 size-1.5 rounded-full bg-brand" />
            <span className="font-medium text-ink">{entry.label}</span>
            <span className="ml-1 text-[11px]">
              {formatTaskTime(entry.at)} · {relativeAge(entry.at)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function JobView() {
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
  const [offerExpired, setOfferExpired] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [reporting, setReporting] = useState(false);

  function updateCurrent(status: DriverTask["status"], label: string) {
    if (!task) return;
    const updated = tasks.map((entry) => (entry.id === id ? updateTaskStatus(entry, status, label) : entry));
    void authApi.setDriverTasks(updated);
    setTasks(updated);
  }

  if (declined || !task) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <Package size={28} aria-hidden="true" className="text-muted" />
        <p className="text-[14px] font-bold text-ink">{declined ? "Offer declined" : "Task not found"}</p>
        <p className="max-w-[26ch] text-[12px] text-muted">
          {declined ? "The task was removed from your list." : "It may have been completed or reassigned."}
        </p>
        <Link
          href="/driver/tasks"
          className="motion-safe:transition inline-flex min-h-11 items-center justify-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white hover:opacity-90"
        >
          Back to My tasks
        </Link>
      </main>
    );
  }

  const active = task.status === "accepted" || task.status === "picked-up" || task.status === "en-route";
  const nextCtaClass =
    "motion-safe:transition inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-brand px-5 text-[14px] font-bold text-white hover:opacity-90";
  const secondaryCtaClass =
    "motion-safe:transition inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] border border-border text-[13px] font-bold text-ink hover:bg-sand";
  const dangerCtaClass =
    "motion-safe:transition inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] text-[12px] font-bold text-hold hover:bg-[#8a1f1f]/5";

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <Link href="/driver/tasks" className="flex items-center gap-1.5 text-[12px] font-bold text-info hover:underline">
          My tasks
        </Link>
        <StatusBadge status={task.status} />
      </div>
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">{task.id}</h1>

      <section className={`rounded-[4px] border p-4 ${active ? "border-info bg-info-soft" : "border-border bg-paper"}`}>
        <div className="flex items-center gap-2 text-[12px] font-bold text-ink">
          <MapPin size={14} aria-hidden="true" /> {task.pickup.hub} → {task.dropoff.area}
        </div>
        <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-ink/80">
          <li>Pickup: {task.pickup.name}, {task.pickup.address}</li>
          <li>Dropoff: {task.dropoff.name}, {task.dropoff.address}</li>
        </ul>
        <div className="mt-3 flex flex-col divide-y divide-border text-[11px] text-muted">
          <p className="flex justify-between py-1">
            <span>Distance</span>
            <span>{task.distanceKm} km · ~{task.etaMin} min</span>
          </p>
          <p className="flex justify-between py-1">
            <span>{task.payment === "COD" ? "Collect on delivery" : "Payment"}</span>
            <span className={taskTextClass("delivered")}>
              {task.payment === "COD" ? `GH₵ ${task.codAmount ?? 0}` : "Paid online"}
            </span>
          </p>
          <p className="flex justify-between py-1">
            <span>Your leg fee</span>
            <span className="font-bold text-ink">{formatGhc(task.earnings)}</span>
          </p>
        </div>
      </section>

      {task.status === "offered" && !offerExpired && (
        <section className="rounded-[4px] border border-warn bg-warn-soft p-4">
          <OfferTimer onExpire={() => setOfferExpired(true)} />
          <button type="button" onClick={() => updateCurrent("accepted", "Task accepted")} className={`mt-2 ${nextCtaClass}`}>
            <Check size={16} aria-hidden="true" /> Accept task
          </button>
          <button
            type="button"
            onClick={() => {
              void authApi.setDriverTasks(tasks.filter((entry) => entry.id !== id));
              setDeclined(true);
            }}
            className={`mt-2 ${secondaryCtaClass}`}
          >
            <X size={16} aria-hidden="true" /> Decline
          </button>
        </section>
      )}

      {task.status === "offered" && offerExpired && (
        <p className="rounded-[4px] border border-dashed border-hold/40 bg-paper p-4 text-[12px] text-hold">
          This offer expired. It may be reassigned to another rider.
        </p>
      )}

      {task.status === "accepted" && (
        <Link href={`/driver/job/pickup?id=${task.id}`} className={nextCtaClass}>
          Proceed to pickup <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      {task.status === "picked-up" && (
        <button type="button" onClick={() => updateCurrent("en-route", "En route to dropoff")} className={nextCtaClass}>
          Mark en route <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}

      {task.status === "en-route" && (
        <Link href={`/driver/job/dropoff?id=${task.id}`} className={nextCtaClass}>
          Complete delivery <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      {active && (
        <section>
          {reporting ? (
            <ul className="flex flex-col gap-1.5">
              {FAILED_DELIVERY_REASONS.map((reason) => (
                <li key={reason}>
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrent("failed", `Delivery failed — ${reason}`);
                      setReporting(false);
                    }}
                    className="motion-safe:transition min-h-11 w-full rounded-[4px] border border-border bg-paper px-3 text-left text-[13px] text-ink hover:bg-[#8a1f1f]/5"
                  >
                    {reason}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button type="button" onClick={() => setReporting(true)} className={dangerCtaClass}>
              <AlertTriangle size={14} aria-hidden="true" /> Report delivery problem
            </button>
          )}
        </section>
      )}

      {task.status === "failed" && (
        <button type="button" onClick={() => updateCurrent("returned", "Package returned to hub")} className={nextCtaClass}>
          Return package to hub <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}

      {(task.status === "delivered" || task.status === "failed" || task.status === "returned") && (
        <section className="rounded-[4px] border border-border bg-paper p-4">
          <ul className="flex flex-col gap-1.5 text-[12px] text-muted">
            <InfoRow label="Customer" value={task.customer} />
            <li className="flex items-start justify-between gap-3">
              <span className="text-[11px] uppercase tracking-wide text-muted">Phone</span>
              <a href={`tel:${task.phone.replace(/\s/g, "")}`} className="text-[12px] font-bold text-info hover:underline">
                <Phone size={12} className="inline" aria-hidden="true" /> {task.phone}
              </a>
            </li>
            <InfoRow label="Items" value={task.itemsSummary} />
          </ul>
        </section>
      )}

      {task.status !== "offered" && <Timeline task={task} />}
    </main>
  );
}
