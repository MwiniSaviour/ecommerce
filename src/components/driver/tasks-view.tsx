"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getDriverTasks, sortTasksNewestFirst, type DriverTask } from "@/lib/driver-tasks";
import { StatusBadge, taskCardClass, relativeAge, formatGhc } from "@/components/driver/driver-ui";

function TaskRow({ task }: { task: DriverTask }) {
  const linked = task.status !== "delivered" && task.status !== "failed" && task.status !== "returned";
  const navigate = linked ? `/driver/job/${task.id}` : `/driver/job/${task.id}`;

  return (
    <li>
      <Link
        href={navigate}
        className={`motion-safe:transition flex items-center gap-3 rounded-[4px] border p-3.5 hover:opacity-90 ${taskCardClass(task.status)}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-ink">{task.id}</p>
            <StatusBadge status={task.status} />
          </div>
          <p className="mt-1 truncate text-[12px] text-ink/80">
            {task.pickup.hub} → {task.dropoff.area}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            <MapPin size={11} className="inline" aria-hidden="true" /> {task.distanceKm} km · {formatGhc(task.earnings)} ·{" "}
            {relativeAge(task.history[0]?.at ?? 0)}
          </p>
        </div>
        <ArrowRight size={16} aria-hidden="true" className={linked ? "text-ink" : "text-muted"} />
      </Link>
    </li>
  );
}

export function TasksView() {
  const tasks = sortTasksNewestFirst(getDriverTasks());
  const offers = tasks.filter((task) => task.status === "offered");
  const active = tasks.filter((task) => ["accepted", "picked-up", "en-route"].includes(task.status));
  const completed = tasks.filter((task) => ["delivered", "failed", "returned"].includes(task.status));

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">My tasks</h1>

      {active.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">Active deliveries</h2>
          <ul className="flex flex-col gap-2">
            {active.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">
          Offers {offers.length === 0 ? "(none available)" : `(${offers.length})`}
        </h2>
        {offers.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {offers.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        ) : (
          <p className="rounded-[4px] border border-dashed border-border bg-paper p-4 text-[12px] text-muted">
            No open offers. Go online on Home to start receiving them.
          </p>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted">Completed</h2>
          <ul className="flex flex-col gap-2">
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
