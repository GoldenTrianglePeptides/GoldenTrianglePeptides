"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/CartProvider";

/**
 * Adds a previous order's still-purchasable items back into the cart and sends
 * the customer to the cart. Items that are no longer available are resolved
 * server-side and simply omitted from `items`.
 */
export default function ReorderButton({
  items,
  className,
}: {
  items: CartItem[];
  className?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();

  function handleClick() {
    for (const { quantity, ...rest } of items) {
      addItem(rest, quantity);
    }
    router.push("/cart");
  }

  if (items.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-lg border border-navy/20 px-4 py-2 text-sm font-semibold text-navy transition hover:border-navy hover:bg-navy/5"
      }
    >
      Reorder available items
    </button>
  );
}
