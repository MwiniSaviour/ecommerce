/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { readStorageRaw, writeStorage } from "@/lib/local-store";

export const DRIVER_PROFILE_KEY = "kora-market-driver-profile-v1";
export const DRIVER_AVAILABILITY_KEY = "kora-market-driver-availability-v1";
export const DRIVER_TASKS_KEY = "kora-market-driver-tasks-v1";

export type DriverProfileStatus = "apply-form" | "verification-pending" | "approved";

export type DriverTaskStatus =
  | "offered"
  | "accepted"
  | "picked-up"
  | "en-route"
  | "delivered"
  | "failed"
  | "returned";

export type DriverPayment = "prepaid" | "COD";

export type DriverProfile = {
  status: DriverProfileStatus;
  name: string;
  phone: string;
  city: string;
  vehicle: string;
  plate: string;
  license: string;
  submittedAt: number;
  approvedAt: number | null;
};

export type DriverTaskHistoryEntry = {
  at: number;
  label: string;
};

export type DriverTask = {
  id: string;
  pickup: { name: string; address: string; hub: string };
  dropoff: { name: string; address: string; area: string };
  customer: string;
  phone: string;
  payment: DriverPayment;
  codAmount: number | null;
  itemsSummary: string;
  distanceKm: number;
  etaMin: number;
  earnings: number;
  status: DriverTaskStatus;
  history: DriverTaskHistoryEntry[];
};

const PROFILE_STATUSES: DriverProfileStatus[] = ["apply-form", "verification-pending", "approved"];
const TASK_STATUSES: DriverTaskStatus[] = [
  "offered",
  "accepted",
  "picked-up",
  "en-route",
  "delivered",
  "failed",
  "returned",
];

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function parseDriverProfile(raw: string | null): DriverProfile | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const entry = parsed as Record<string, unknown>;
    const status = entry.status;
    if (typeof status !== "string" || !PROFILE_STATUSES.includes(status as DriverProfileStatus)) {
      return null;
    }
    if (status !== "approved" && typeof entry.name !== "string") return null;
    const submittedAt = asNumber(entry.submittedAt, Date.now());
    const approvedAtRaw = entry.approvedAt;
    const approvedAt =
      typeof approvedAtRaw === "number" && Number.isFinite(approvedAtRaw) ? approvedAtRaw : null;
    return {
      status: status as DriverProfileStatus,
      name: asString(entry.name, ""),
      phone: asString(entry.phone, ""),
      city: asString(entry.city, "Accra"),
      vehicle: asString(entry.vehicle, "Motorbike"),
      plate: asString(entry.plate, ""),
      license: asString(entry.license, ""),
      submittedAt,
      approvedAt,
    };
  } catch {
    return null;
  }
}

export function getDriverProfile(): DriverProfile | null {
  return parseDriverProfile(readStorageRaw(DRIVER_PROFILE_KEY));
}

export function writeDriverProfile(profile: DriverProfile): void {
  writeStorage(DRIVER_PROFILE_KEY, JSON.stringify(profile));
}

export function clearDriverData(): void {
  writeStorage(DRIVER_PROFILE_KEY, null);
  writeStorage(DRIVER_AVAILABILITY_KEY, null);
  writeStorage(DRIVER_TASKS_KEY, null);
}

export function parseDriverAvailability(raw: string | null): "online" | "offline" {
  if (raw === "online" || raw === '"online"') return "online";
  return "offline";
}

export function getDriverAvailability(): "online" | "offline" {
  return parseDriverAvailability(readStorageRaw(DRIVER_AVAILABILITY_KEY));
}

export function writeDriverAvailability(value: "online" | "offline"): void {
  writeStorage(DRIVER_AVAILABILITY_KEY, value);
}

function asLocationHub(value: unknown, fallback: { name: string; address: string; hub: string }) {
  if (typeof value !== "object" || value === null) return fallback;
  const entry = value as Record<string, unknown>;
  return {
    name: asString(entry.name, fallback.name),
    address: asString(entry.address, fallback.address),
    hub: asString(entry.hub, fallback.hub),
  };
}

function asLocationArea(value: unknown, fallback: { name: string; address: string; area: string }) {
  if (typeof value !== "object" || value === null) return fallback;
  const entry = value as Record<string, unknown>;
  return {
    name: asString(entry.name, fallback.name),
    address: asString(entry.address, fallback.address),
    area: asString(entry.area, fallback.area),
  };
}

function sanitizeDriverTask(entry: unknown, fallback: DriverTask): DriverTask {
  const task = (typeof entry === "object" && entry !== null ? entry : {}) as Record<string, unknown>;
  const status = typeof task.status === "string" && TASK_STATUSES.includes(task.status as DriverTaskStatus)
    ? (task.status as DriverTaskStatus)
    : fallback.status;
  const payment = task.payment === "COD" || task.payment === "prepaid" ? task.payment : fallback.payment;
  const codAmountRaw = task.codAmount;
  const codAmount = typeof codAmountRaw === "number" && Number.isFinite(codAmountRaw) ? codAmountRaw : null;
  const history: DriverTaskHistoryEntry[] = Array.isArray(task.history)
    ? task.history
        .map((rawPoint) => {
          if (typeof rawPoint !== "object" || rawPoint === null) return null;
          const point = rawPoint as Record<string, unknown>;
          return {
            at: asNumber(point.at, fallback.history[0]?.at ?? Date.now()),
            label: asString(point.label, "Task updated"),
          };
        })
        .filter((point): point is DriverTaskHistoryEntry => point !== null)
    : [];
  return {
    id: asString(task.id, fallback.id),
    pickup: asLocationHub(task.pickup, fallback.pickup),
    dropoff: asLocationArea(task.dropoff, fallback.dropoff),
    customer: asString(task.customer, fallback.customer),
    phone: asString(task.phone, fallback.phone),
    payment,
    codAmount,
    itemsSummary: asString(task.itemsSummary, fallback.itemsSummary),
    distanceKm: asNumber(task.distanceKm, fallback.distanceKm),
    etaMin: asNumber(task.etaMin, fallback.etaMin),
    earnings: asNumber(task.earnings, fallback.earnings),
    status,
    history: history.length > 0 ? history : fallback.history,
  };
}

export function parseDriverTasks(raw: string | null): DriverTask[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry, index) => sanitizeDriverTask(entry, seedDriverTasks()[index] ?? seedDriverTasks()[0]));
  } catch {
    return [];
  }
}

export function getDriverTasks(): DriverTask[] {
  const raw = readStorageRaw(DRIVER_TASKS_KEY);
  if (raw === null) return seedDriverTasks();
  return parseDriverTasks(raw);
}

export function saveDriverTasks(tasks: DriverTask[]): void {
  writeStorage(DRIVER_TASKS_KEY, JSON.stringify(tasks));
}

export function getDriverTaskById(id: string, tasks: DriverTask[]): DriverTask | null {
  return tasks.find((task) => task.id === id) ?? null;
}

export function updateTaskStatus(task: DriverTask, status: DriverTaskStatus, label: string): DriverTask {
  return { ...task, status, history: [...task.history, { at: Date.now(), label }] };
}

export function sortTasksNewestFirst(tasks: DriverTask[]): DriverTask[] {
  return [...tasks].sort((a, b) => lastAt(b) - lastAt(a));
}

function lastAt(task: DriverTask): number {
  return task.history[task.history.length - 1]?.at ?? 0;
}

export const FAILED_DELIVERY_REASONS = [
  "Customer unreachable",
  "No answer at door",
  "Address not found",
  "Address inaccessible",
  "Customer refused delivery",
  "Package damaged",
] as const;

export function seedDriverTasks(): DriverTask[] {
  const now = Date.now();
  const offered: DriverTask[] = [
    {
      id: "KOF-3021",
      pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
      dropoff: { name: "Ama Serwaa Boateng", address: "12 Spintex Rd, near Panama Junction", area: "Spintex" },
      customer: "Ama Serwaa Boateng",
      phone: "+233 24 611 2408",
      payment: "COD",
      codAmount: 164,
      itemsSummary: "2 parcels · clothes",
      distanceKm: 6.8,
      etaMin: 28,
      earnings: 14,
      status: "offered",
      history: [{ at: now - 6 * 60_000, label: "Task offered to you" }],
    },
    {
      id: "KOF-3024",
      pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
      dropoff: { name: "Yaw Mensah", address: "Osu Oxford St, opposite Melcom", area: "Osu" },
      customer: "Yaw Mensah",
      phone: "+233 55 743 1180",
      payment: "prepaid",
      codAmount: null,
      itemsSummary: "1 parcel · phone accessories",
      distanceKm: 3.1,
      etaMin: 15,
      earnings: 9,
      status: "offered",
      history: [{ at: now - 12 * 60_000, label: "Task offered to you" }],
    },
    {
      id: "KOF-3026",
      pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
      dropoff: { name: "Nana Adjei", address: "64 East Legon, Boundary Rd", area: "East Legon" },
      customer: "Nana Adjei",
      phone: "+233 20 925 5541",
      payment: "COD",
      codAmount: 412,
      itemsSummary: "3 parcels · kitchen set",
      distanceKm: 11.4,
      etaMin: 42,
      earnings: 25,
      status: "offered",
      history: [{ at: now - 21 * 60_000, label: "Task offered to you" }],
    },
    {
      id: "KOF-3030",
      pickup: { name: "Tema Hub", address: "Community 1 Market St", hub: "Tema Hub" },
      dropoff: { name: "Efia Danso", address: "Madina Market, Fire Station Rd", area: "Madina" },
      customer: "Efia Danso",
      phone: "+233 26 588 9027",
      payment: "prepaid",
      codAmount: null,
      itemsSummary: "1 parcel · cosmetics",
      distanceKm: 8.2,
      etaMin: 30,
      earnings: 16,
      status: "offered",
      history: [{ at: now - 34 * 60_000, label: "Task offered to you" }],
    },
    {
      id: "KOF-3033",
      pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
      dropoff: { name: "Kwame Osei", address: "Kaneshie First Light Rd, Flat 6", area: "Kaneshie" },
      customer: "Kwame Osei",
      phone: "+233 27 431 6682",
      payment: "COD",
      codAmount: 88,
      itemsSummary: "1 parcel · shoes",
      distanceKm: 4.5,
      etaMin: 19,
      earnings: 11,
      status: "offered",
      history: [{ at: now - 47 * 60_000, label: "Task offered to you" }],
    },
    {
      id: "KOF-3035",
      pickup: { name: "Tema Hub", address: "Community 1 Market St", hub: "Tema Hub" },
      dropoff: { name: "Adjoa Nyarko", address: "Tema Comm. 9, School Lane", area: "Tema" },
      customer: "Adjoa Nyarko",
      phone: "+233 24 190 7736",
      payment: "prepaid",
      codAmount: null,
      itemsSummary: "2 parcels · books",
      distanceKm: 2.4,
      etaMin: 12,
      earnings: 8,
      status: "offered",
      history: [{ at: now - 58 * 60_000, label: "Task offered to you" }],
    },
  ];

  const deliveredSeed = [
    { id: "KOF-2971", area: "Spintex", dropoff: "12 Spintex Rd, near Panama Junction", customer: "Ama Serwaa Boateng", phone: "+233 24 611 2408", items: "2 parcels · clothes", distanceKm: 6.8, etaMin: 28, earnings: 14, payment: "COD" as DriverPayment, cod: 164, endMinsAgo: 105, startMinsAgo: 180 },
    { id: "KOF-2965", area: "Osu", dropoff: "Osu Oxford St, opposite Melcom", customer: "Yaw Mensah", phone: "+233 55 743 1180", items: "1 parcel · phone accessories", distanceKm: 3.1, etaMin: 15, earnings: 9, payment: "prepaid" as DriverPayment, cod: null, endMinsAgo: 260, startMinsAgo: 330 },
    { id: "KOF-2958", area: "East Legon", dropoff: "64 East Legon, Boundary Rd", customer: "Nana Adjei", phone: "+233 20 925 5541", items: "3 parcels · kitchen set", distanceKm: 11.4, etaMin: 42, earnings: 25, payment: "COD" as DriverPayment, cod: 412, endMinsAgo: 400, startMinsAgo: 480 },
    { id: "KOF-2942", area: "Madina", dropoff: "Madina Market, Fire Station Rd", customer: "Efia Danso", phone: "+233 26 588 9027", items: "1 parcel · cosmetics", distanceKm: 8.2, etaMin: 30, earnings: 16, payment: "prepaid" as DriverPayment, cod: null, endMinsAgo: 1450, startMinsAgo: 1530 },
    { id: "KOF-2917", area: "Kaneshie", dropoff: "Kaneshie First Light Rd, Flat 6", customer: "Kwame Osei", phone: "+233 27 431 6682", items: "1 parcel · shoes", distanceKm: 4.5, etaMin: 19, earnings: 11, payment: "COD" as DriverPayment, cod: 88, endMinsAgo: 1730, startMinsAgo: 1810 },
    { id: "KOF-2893", area: "Tema", dropoff: "Tema Comm. 9, School Lane", customer: "Adjoa Nyarko", phone: "+233 24 190 7736", items: "2 parcels · books", distanceKm: 2.4, etaMin: 12, earnings: 8, payment: "prepaid" as DriverPayment, cod: null, endMinsAgo: 1970, startMinsAgo: 2040 },
    { id: "KOF-2866", area: "Spintex", dropoff: "98 Spintex Rd, Kokomlemle Frontage", customer: "Kojo Ansah", phone: "+233 57 336 4419", items: "1 parcel · blender", distanceKm: 9.6, etaMin: 36, earnings: 20, payment: "COD" as DriverPayment, cod: 257, endMinsAgo: 4210, startMinsAgo: 4300 },
    { id: "KOF-2844", area: "Osu", dropoff: "Osu Badu St, House 21", customer: "Abena Owusu", phone: "+233 50 812 6604", items: "2 parcels · toys", distanceKm: 5.2, etaMin: 22, earnings: 12, payment: "prepaid" as DriverPayment, cod: null, endMinsAgo: 6400, startMinsAgo: 6490 },
  ];

  const delivered: DriverTask[] = deliveredSeed.map((seed) => ({
    id: seed.id,
    pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
    dropoff: { name: seed.customer, address: seed.dropoff, area: seed.area },
    customer: seed.customer,
    phone: seed.phone,
    payment: seed.payment,
    codAmount: seed.cod,
    itemsSummary: seed.items,
    distanceKm: seed.distanceKm,
    etaMin: seed.etaMin,
    earnings: seed.earnings,
    status: "delivered",
    history: [
      { at: now - seed.startMinsAgo * 60_000, label: "Task offered to you" },
      { at: now - (seed.startMinsAgo - 3) * 60_000, label: "Task accepted" },
      { at: now - (seed.startMinsAgo - 10) * 60_000, label: "Package picked up at Accra Central Hub" },
      { at: now - (seed.endMinsAgo - 6) * 60_000, label: "En route to dropoff" },
      { at: now - seed.endMinsAgo * 60_000, label: "Delivered — proof of delivery confirmed" },
    ],
  }));

  const failed: DriverTask = {
    id: "KOF-2930",
    pickup: { name: "Accra Central Hub", address: "Hub 4, Kojo Thompson Rd", hub: "Accra Central Hub" },
    dropoff: { name: "Fiifi Barnes", address: "Weija, behind Pentecost Church", area: "Weija" },
    customer: "Fiifi Barnes",
    phone: "+233 28 455 3311",
    payment: "prepaid",
    codAmount: null,
    itemsSummary: "1 parcel · stationery",
    distanceKm: 13.8,
    etaMin: 45,
    earnings: 18,
    status: "failed",
    history: [
      { at: now - 2900 * 60_000, label: "Task offered to you" },
      { at: now - 2896 * 60_000, label: "Task accepted" },
      { at: now - 2888 * 60_000, label: "Package picked up at Accra Central Hub" },
      { at: now - 2852 * 60_000, label: "En route to dropoff" },
      { at: now - 2840 * 60_000, label: "Delivery failed — Address not found. Package returned to hub." },
    ],
  };

  return [...offered, failed, ...delivered];
}
