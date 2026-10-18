// DESIGN DIRECTION: seller financial statements — inspired by Jumia seller income statements with due/open/paid tiles; not Jumia-verified.

import { useCallback, useSyncExternalStore } from "react";

import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";
import { sellerNowMs } from "@/lib/seller-orders";

export const SELLER_STATEMENTS_KEY = "kora-market-seller-statements-v1";

export type SellerStatementStatus = "due-unpaid" | "open" | "paid";

export type SellerStatement = {
  id: string;
  monthLabel: string;
  issueDate: string;
  status: SellerStatementStatus;
  gross: number;
  commission: number;
  shipment: number;
  serviceFee: number;
  refunds: number;
  net: number;
  paidLabel: string | null;
};

type SellerStatementSeed = {
  monthOffset: number;
  status: SellerStatementStatus;
  gross: number;
  commission: number;
  shipment: number;
  refunds: number;
};

const sellerStatementSeeds: SellerStatementSeed[] = [
  { monthOffset: 0, status: "open", gross: 2140, commission: 535, shipment: 180, refunds: 0 },
  { monthOffset: 1, status: "due-unpaid", gross: 4880, commission: 1220, shipment: 380, refunds: 250 },
  { monthOffset: 2, status: "paid", gross: 6120, commission: 1530, shipment: 420, refunds: 120 },
];

function isSellerStatement(entry: unknown): entry is SellerStatement {
  if (typeof entry !== "object" || entry === null) return false;
  const statement = entry as Partial<SellerStatement>;
  return (
    typeof statement.id === "string" &&
    typeof statement.monthLabel === "string" &&
    typeof statement.issueDate === "string" &&
    typeof statement.status === "string" &&
    typeof statement.gross === "number" &&
    typeof statement.commission === "number" &&
    typeof statement.shipment === "number" &&
    typeof statement.serviceFee === "number" &&
    typeof statement.refunds === "number" &&
    typeof statement.net === "number"
  );
}

function isSellerStatementList(entry: unknown): entry is SellerStatement[] {
  return Array.isArray(entry) && entry.every(isSellerStatement);
}

function parseStatements(raw: string | null): SellerStatement[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSellerStatementList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function statementServiceFee(commission: number): number {
  return Math.round(commission * 0.25) + 20;
}

function monthLabelFor(monthOffset: number): string {
  const date = new Date(sellerNowMs());
  date.setDate(1);
  date.setMonth(date.getMonth() - monthOffset);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function issueDateFor(monthOffset: number): string {
  const date = new Date(sellerNowMs());
  date.setDate(1);
  date.setMonth(date.getMonth() - monthOffset);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function buildSeedStatements(): SellerStatement[] {
  return sellerStatementSeeds.map((seed, index) => {
    const serviceFee = statementServiceFee(seed.commission);
    const net = seed.gross - seed.commission - seed.shipment - serviceFee - seed.refunds;
    return {
      id: `KST-${1042 - index}`,
      monthLabel: monthLabelFor(seed.monthOffset),
      issueDate: issueDateFor(seed.monthOffset),
      status: seed.status,
      gross: seed.gross,
      commission: seed.commission,
      shipment: seed.shipment,
      serviceFee,
      refunds: seed.refunds,
      net,
      paidLabel: seed.status === "paid" ? issueDateFor(Math.max(seed.monthOffset - 1, 0)) : null,
    };
  });
}

function statementStatusLabel(status: SellerStatementStatus): string {
  switch (status) {
    case "due-unpaid":
      return "Due";
    case "open":
      return "Open";
    case "paid":
      return "Paid";
  }
}

function statementStatusClasses(status: SellerStatementStatus): string {
  switch (status) {
    case "due-unpaid":
      return "bg-warn-soft text-warn";
    case "open":
      return "bg-info-soft text-ink";
    case "paid":
      return "bg-ok-soft text-ok";
  }
}

export function statementToCsv(statement: SellerStatement): string {
  const rows = [
    ["Field", "Amount (GH¢)"],
    ["Statement", statement.id],
    ["Month", statement.monthLabel],
    ["Gross sales", String(statement.gross)],
    ["Commission", String(statement.commission)],
    ["Shipment earnings", String(statement.shipment)],
    ["Service fee", String(statement.serviceFee)],
    ["Refunds", String(statement.refunds)],
    ["Net payout", String(statement.net)],
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

let sellerStatementsRaw: string | null | undefined;
let sellerStatementsSnapshot: SellerStatement[] | null = null;

function browserSellerStatements(): SellerStatement[] {
  const raw = readStorageRaw(SELLER_STATEMENTS_KEY);
  if (sellerStatementsSnapshot === null || raw !== sellerStatementsRaw) {
    sellerStatementsRaw = raw;
    sellerStatementsSnapshot = parseStatements(raw) ?? buildSeedStatements();
  }
  return sellerStatementsSnapshot;
}

export function readSellerStatements(): SellerStatement[] {
  if (typeof window === "undefined") return buildSeedStatements();
  return browserSellerStatements();
}

export function updateSellerStatements(updater: (statements: SellerStatement[]) => SellerStatement[]): void {
  const next = updater(browserSellerStatements());
  if (next.length > 0) writeStorage(SELLER_STATEMENTS_KEY, JSON.stringify(next));
}

let sellerStatementsSeed: SellerStatement[] | null = null;

function serverSellerStatements(): SellerStatement[] {
  if (sellerStatementsSeed === null) {
    sellerStatementsSeed = buildSeedStatements();
  }
  return sellerStatementsSeed;
}

export function useSellerStatements(): SellerStatement[] {
  return useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_STATEMENTS_KEY, onStoreChange),
    browserSellerStatements,
    serverSellerStatements,
  );
}

export function useSellerStatementActions(): {
  downloadCsv: (statement: SellerStatement) => void;
  markStatementPaid: (statementId: string) => void;
} {
  const downloadCsv = useCallback((statement: SellerStatement) => {
    const url = URL.createObjectURL(new Blob([statementToCsv(statement)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${statement.id}-${statement.monthLabel.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  const markStatementPaid = useCallback((statementId: string) => {
    writeStorage(
      SELLER_STATEMENTS_KEY,
      JSON.stringify(
        browserSellerStatements().map((statement) =>
          statement.id === statementId
            ? { ...statement, status: "paid" as const, paidLabel: issueDateFor(0) }
            : statement,
        ),
      ),
    );
  }, []);
  return { downloadCsv, markStatementPaid };
}

export { statementStatusLabel, statementStatusClasses };
