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
 *  - refreshes the server component every few seconds while a crypto payment
 *    is still pending, so the page updates without a manual reload
 */
export default function OrderStatusWatcher({ status }: { status: string }) {
  const router = useRouter();
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready && status === "paid") {
      clear();
    }
  }, [ready, status, clear]);

  useEffect(() => {
    if (!PENDING.has(status)) return;
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [status, router]);

  return null;
}
