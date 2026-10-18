"use client";

// DESIGN DIRECTION: seller product review modal — inspired by Jumia product edit restrictions; not Jumia-verified.

import { useState } from "react";
import { X } from "lucide-react";

import { useStorefront } from "@/components/storefront-provider";
import type { CatalogOverride, CatalogRow, SellerProductStatus } from "@/lib/seller-catalog";

type Props = {
  product: CatalogRow;
  onSave: (override: CatalogOverride) => void;
  onClose: () => void;
};

export function ProductEditModal({ product, onSave, onClose }: Props) {
  const { showToast } = useStorefront();
  const [price, setPrice] = useState(String(product.activePrice));
  const [stock, setStock] = useState(String(product.activeStock));
  const [status, setStatus] = useState<SellerProductStatus>(product.activeStatus);

  const save = () => {
    const nextPrice = Number(price);
    const nextStock = Number(stock);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      showToast("Price must be greater than zero");
      return;
    }
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      showToast("Stock must be a whole number of 0 or more");
      return;
    }
    onSave({ price: nextPrice, stock: nextStock, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4" data-testid="seller-product-modal">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${product.name}`}
        className="w-full max-w-md rounded-[14px] bg-paper p-5 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <div className="mr-auto">
            <h3 className="text-[15px] font-bold text-ink">{product.name}</h3>
            <p className="mt-0.5 font-mono text-[12px] text-muted">{product.sku}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            data-testid="seller-product-modal-close"
            className="flex size-9 items-center justify-center rounded-full bg-sand text-ink hover:bg-border"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          Seller price, stock and listing status are editable. Product details with a blue tag are controlled by Kora Market.
        </p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-[12px] font-medium text-ink">
            Selling price (GH¢)
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              data-testid="seller-product-modal-price"
              className="min-h-11 rounded-[10px] border border-border bg-white px-3 text-[13px] text-ink"
            />
          </label>
          <label className="grid gap-1 text-[12px] font-medium text-ink">
            Stock ready to ship
            <input
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              inputMode="numeric"
              data-testid="seller-product-modal-stock"
              className="min-h-11 rounded-[10px] border border-border bg-white px-3 text-[13px] text-ink"
            />
          </label>
          <div className="grid gap-1 text-[12px] font-medium text-ink">
            Listing status
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  data-testid={`seller-product-modal-status-${option}`}
                  className={`min-h-9 flex-1 rounded-full px-3 text-[12px] font-bold transition-colors ${
                    status === option ? "bg-brand text-white" : "border border-border bg-white text-ink hover:bg-sand"
                  }`}
                >
                  {option === "active" ? "Active" : "Inactive"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          data-testid="seller-product-modal-save"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
