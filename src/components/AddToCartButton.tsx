"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";

export type AddToCartVariant = {
  id: string;
  label: string;
  priceCents: number;
  inStock: boolean;
};

export type AddToCartProduct = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
};

export default function AddToCartButton({
  product,
  variants,
}: {
  product: AddToCartProduct;
  variants: AddToCartVariant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();

  // Default to the first in-stock variant; fall back to the first one.
  const defaultIdx = Math.max(
    0,
    variants.findIndex((v) => v.inStock),
  );
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants[selectedIdx];

  if (!selected) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-zinc-300 px-6 py-3 font-semibold text-zinc-600"
      >
        No sizes available
      </button>
    );
  }

  function lineItem(v: AddToCartVariant) {
    return {
      variantId: v.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantLabel: v.label,
      priceCents: v.priceCents,
      imageUrl: product.imageUrl,
    };
  }

  function handleAdd() {
    if (!selected.inStock) return;
    addItem(lineItem(selected), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!selected.inStock) return;
    addItem(lineItem(selected), qty);
    router.push("/cart");
  }

  return (
    <div className="space-y-4">
      {/* Variant picker — only render when there's more than one size */}
      {variants.length > 1 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy">
              Quantity (mg)
            </p>
            <p className="text-sm font-bold text-navy">
              {formatPrice(selected.priceCents)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => {
              const isSelected = i === selectedIdx;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  disabled={!v.inStock}
                  className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "border-navy bg-navy text-white"
                      : "border-black/15 bg-white text-navy hover:border-navy"
                  } ${!v.inStock ? "cursor-not-allowed opacity-50 line-through" : ""}`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity stepper */}
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium text-navy">
          Quantity
        </label>
        <div className="flex items-center rounded-lg border border-black/15">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg text-navy hover:bg-zinc-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span id="qty" className="w-10 text-center font-medium">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="px-3 py-2 text-lg text-navy hover:bg-zinc-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons */}
      {!selected.inStock ? (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-zinc-300 px-6 py-3 font-semibold text-zinc-600"
        >
          {selected.label} — Out of Stock
        </button>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
          >
            {added ? "✓ Added to cart" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
