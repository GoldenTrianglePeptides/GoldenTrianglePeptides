"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

// Statuses where the customer's payment is still in flight — keep polling so
// the page flips to a final state on its own.
const PENDING = new Set(["awaiting_payment", "partial"]);

/**
 * Client-side helper for the order page:
 *  - clears the cart once the order is confirmed paid
 *  - while a crypto payment is still pending, every few seconds it asks the
 *    server to reconcile this order against NOWPayments (auto-sync) and then
 *    refreshes, so the page settles on its own without a manual Sync or waiting
 *    for the daily cron.
 */
export default function OrderStatusWatcher({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready && status === "paid") {
      clear();
    }
  }, [ready, status, clear]);

  useEffect(() => {
    if (!PENDING.has(status)) return;
    let cancelled = false;

    async function tick() {
      try {
        await fetch(`/api/orders/${orderId}/refresh`, { method: "POST" });
      } catch {
        // Network blip — just try again next tick.
      }
      if (!cancelled) router.refresh();
    }

    const id = setInterval(tick, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [orderId, status, router]);

  return null;
}
