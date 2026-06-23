"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "./CartProvider";

export default function AddToCartButton({
  product,
  disabled,
}: {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-zinc-300 px-6 py-3 font-semibold text-zinc-600"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleAdd}
          className="flex-1 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
        >
          {added ? "✓ Added to cart" : "Add to Cart"}
        </button>
        <button
          onClick={() => {
            addItem(product, qty);
            router.push("/cart");
          }}
          className="flex-1 rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
