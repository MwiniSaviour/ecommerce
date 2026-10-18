"use client";

// DESIGN DIRECTION: seller product management — inspired by Jumia seller catalog with per-listing edits; not Jumia-verified.

import Link from "next/link";
import { useState } from "react";
import { Pencil, Upload } from "lucide-react";

import { HolidayBanner } from "@/components/seller/holiday-banner";
import { ProductEditModal } from "@/components/seller/product-edit-modal";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import {
  type CatalogRow,
  buildCatalogRows,
  saveSellerCatalogOverride,
  useSellerCatalogOverrides,
} from "@/lib/seller-catalog";
export default function SellerProductsPage() {
  const { showToast } = useStorefront();
  const overrides = useSellerCatalogOverrides();
  const rows = buildCatalogRows(overrides);
  const [editing, setEditing] = useState<CatalogRow | null>(null);

  const saveRow = (row: CatalogRow, price: number, stock: number, status: "active" | "inactive") => {
    saveSellerCatalogOverride(row.id, { price, stock, status });
    showToast(`${row.name} updated`);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-products">
      <HolidayBanner />
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="mr-auto">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Catalog</p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">Products</h1>
          <p className="mt-1 text-[13px] text-muted">
            Price, stock and listing status are editable here. Numbers, name, brand and images stay controlled by Kora Market.
          </p>
        </div>
        <Link
          href="/seller/products/import"
          className="flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep"
        >
          <Upload size={16} aria-hidden="true" />
          Import products
        </Link>
      </div>
      <div className="overflow-hidden rounded-[14px] bg-paper shadow-sm">
        <table className="w-full text-left text-[13px]" data-testid="seller-products-table">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-bold">Product</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="hidden px-4 py-3 font-bold sm:table-cell">Stock</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Product image sourced from frozen seller-products data */}
                    <img src={row.image} alt="" className="size-10 rounded-[8px] object-cover" />
                    <div>
                      <p className="font-bold text-ink">{row.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {row.brand} · <span className="font-mono">{row.sku}</span>
                      </p>
                    </div>
                    {row.overridden ? (
                      <span className="ml-1 hidden rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-bold text-ink lg:inline">
                        Adjusted
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-ink">{formatPrice(row.activePrice)}</td>
                <td className="hidden px-4 py-3 text-ink sm:table-cell">{row.activeStock}</td>
                <td className="px-4 py-3">
                  {row.activeStatus === "active" ? (
                    <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[11px] font-bold text-ok">Active</span>
                  ) : (
                    <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    data-testid={`seller-product-edit-${row.sku}`}
                    className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[12px] font-bold text-ink transition-colors hover:bg-sand"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-muted">
        Need to change more at once? <Link href="/seller/products/import" className="font-bold text-brand">Bulk import</Link> edits the same fields from a CSV.
      </p>
      {editing ? (
        <ProductEditModal
          key={editing.id}
          product={editing}
          onSave={(override) => saveRow(editing, override.price ?? editing.activePrice, override.stock ?? editing.activeStock, override.status ?? editing.activeStatus)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
