"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeAlert, Camera, Check, KeyRound, PackageCheck, PenLine } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import {
  FAILED_DELIVERY_REASONS,
  getDriverTaskById,
  getDriverTasks,
  saveDriverTasks,
  updateTaskStatus,
  type DriverTask,
} from "@/lib/driver-tasks";
import { formatGhc, StatusBadge, pickupCode } from "@/components/driver/driver-ui";

type ProofTab = "photo" | "signature" | "otp";

const OTP_LENGTH = 4;

export function DropoffView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { showToast } = useStorefront();
  const [tasks, setTasks] = useState<DriverTask[]>(() => getDriverTasks());
  const task = getDriverTaskById(id, tasks);
  const [tab, setTab] = useState<ProofTab>("photo");
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [showReasons, setShowReasons] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  if (!task || task.status === "offered" || task.status === "accepted") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <PackageCheck size={28} aria-hidden="true" className="text-muted" />
        <p className="text-[14px] font-bold text-ink">Dropoff unavailable</p>
        <p className="max-w-[26ch] text-[12px] text-muted">Complete the pickup step before starting dropoff.</p>
        <Link href={`/driver/job?id=${id}`} className="text-[12px] font-bold text-info hover:underline">
          Back to the task
        </Link>
      </main>
    );
  }

  const otpValue = otp.join("");
  const otpValid = otpValue === pickupCode(task);
  const podCaptured = photoCaptured || signatureCaptured;
  const canDeliver = task.status === "picked-up" || task.status === "en-route";

  if (!canDeliver) {
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
            <PackageCheck size={24} aria-hidden="true" className="mx-auto text-muted" />
            <p className="text-[14px] font-bold text-ink">Task closed</p>
            <p className="max-w-[26ch] text-[12px] text-muted">This task is finished, so its dropoff step is no longer available.</p>
          </main>
        ) : (
          <section className="rounded-[4px] border border-ok bg-ok-soft p-4 text-center">
            <PackageCheck size={24} aria-hidden="true" className="mx-auto text-ok" />
            <p className="mt-2 text-[14px] font-bold text-ink">Delivered</p>
            <p className="mt-1 text-[12px] text-muted">Proof of delivery was confirmed at {task.dropoff.area}.</p>
          </section>
        )}
        <Link href="/driver/earnings" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-brand px-5 text-[14px] font-bold text-white hover:opacity-90">
          Go to earnings
        </Link>
      </main>
    );
  }

  const tabNames: { key: ProofTab; label: string; icon: ReactNode }[] = [
    { key: "photo", label: "Photo", icon: <Camera size={14} aria-hidden="true" /> },
    { key: "signature", label: "Signature", icon: <PenLine size={14} aria-hidden="true" /> },
    { key: "otp", label: "OTP", icon: <KeyRound size={14} aria-hidden="true" /> },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <Link href={`/driver/job?id=${task.id}`} className="text-[12px] font-bold text-info hover:underline">
          {task.id}
        </Link>
        <StatusBadge status={task.status} />
      </div>
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Dropoff</h1>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <p className="text-[12px] font-bold text-ink">{task.dropoff.name}</p>
        <p className="mt-0.5 text-[11px] text-muted">{task.dropoff.address}</p>
        <p className="mt-2 text-[12px] text-ink/80">{task.itemsSummary}</p>
        <p className="mt-1 text-[12px] font-bold text-ink">
          {task.payment === "COD" ? `COD — collect ${formatGhc(task.codAmount ?? 0)} from the customer` : "Prepaid"}
        </p>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="text-[13px] font-bold text-ink">Proof of delivery</h2>
        <div className="mt-2 flex rounded-[4px] border border-border bg-sand p-1" role="tablist" aria-label="Proof of delivery method">
          {tabNames.map((entry) => (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={tab === entry.key}
              onClick={() => setTab(entry.key)}
              className={`motion-safe:transition flex flex-1 items-center justify-center gap-1 rounded-[3px] py-2 text-[12px] font-bold ${
                tab === entry.key ? "bg-paper text-ink shadow-sm" : "text-muted"
              }`}
            >
              {entry.icon} {entry.label}
            </button>
          ))}
        </div>

        {tab === "photo" && (
          <div className="mt-3 flex flex-col gap-2">
            {photoCaptured && (
              <p className="rounded-[4px] border border-ok bg-ok-soft px-3 py-2 text-[12px] font-bold text-ok">Photo captured</p>
            )}
            <button
              type="button"
              onClick={() => setPhotoCaptured(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-border bg-sand px-4 text-[13px] font-bold text-ink hover:bg-border"
            >
              <Camera size={16} aria-hidden="true" /> {photoCaptured ? "Photo submitted" : "Capture proof photo"}
            </button>
          </div>
        )}

        {tab === "signature" && (
          <div className="mt-3 flex flex-col gap-2">
            {signatureCaptured && (
              <p className="rounded-[4px] border border-ok bg-ok-soft px-3 py-2 text-[12px] font-bold text-ok">Signature recorded</p>
            )}
            <button
              type="button"
              onClick={() => setSignatureCaptured(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-border bg-sand px-4 text-[13px] font-bold text-ink hover:bg-border"
            >
              <PenLine size={16} aria-hidden="true" /> {signatureCaptured ? "Signature submitted" : "Record customer signature"}
            </button>
          </div>
        )}

        {tab === "otp" && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-[11px] text-muted">Ask the customer for the 4-digit PIN from their order screen.</p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node;
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${index + 1}`}
                  value={digit}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "");
                    const next = [...otp];
                    next[index] = value;
                    setOtp(next);
                    if (value && index < OTP_LENGTH - 1) {
                      otpRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !otp[index] && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                  className={`motion-safe:transition size-12 rounded-[4px] border text-center font-mono text-[20px] font-bold outline-none ${
                    otpValid ? "border-ok bg-ok-soft text-ok" : "border-border bg-sand text-ink focus:border-info"
                  }`}
                />
              ))}
            </div>
            {otpValue.length === OTP_LENGTH && !otpValid && (
              <p className="text-center text-[11px] font-bold text-hold">PIN does not match. Re-check with the customer.</p>
            )}
          </div>
        )}
      </section>

      <button
        type="button"
        disabled={!podCaptured && !otpValid}
        onClick={() => {
          const updated = tasks.map((entry) =>
            entry.id === id ? updateTaskStatus(entry, "delivered", "Delivered — proof of delivery confirmed") : entry,
          );
          saveDriverTasks(updated);
          setTasks(updated);
          showToast(task.payment === "COD" ? `Collect ${formatGhc(task.codAmount ?? 0)} from the customer` : "Delivery confirmed");
          router.push("/driver/earnings");
        }}
        className={`motion-safe:transition inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] px-5 text-[14px] font-bold text-white ${
          podCaptured || otpValid ? "bg-ok hover:opacity-90" : "cursor-not-allowed bg-sand text-muted"
        }`}
      >
        <Check size={16} aria-hidden="true" /> Confirm delivery
      </button>

      <button
        type="button"
        onClick={() => setShowReasons(true)}
        className="mt-1 text-center text-[12px] font-bold text-hold hover:underline"
      >
        Can’t deliver? Report a problem
      </button>

      {showReasons && (
        <section className="rounded-[4px] border border-hold bg-hold-soft p-4">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
            <BadgeAlert size={15} aria-hidden="true" /> Why couldn’t you deliver?
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {FAILED_DELIVERY_REASONS.map((reason) => (
              <li key={reason}>
                <button
                  type="button"
                  onClick={() => {
                    const updated = tasks.map((entry) =>
                      entry.id === id ? updateTaskStatus(entry, "failed", reason) : entry,
                    );
                    saveDriverTasks(updated);
                    setTasks(updated);
                    setShowReasons(false);
                    router.push(`/driver/job?id=${id}`);
                  }}
                  className="min-h-10 w-full rounded-[4px] border border-border bg-paper px-3 py-2 text-start text-[12px] text-ink hover:bg-sand"
                >
                  {reason}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
