"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * While the admin dashboard is open and there are pending orders, periodically
 * asks the server to reconcile them against NOWPayments and refreshes the page
 * only when something actually changed — so the "Pending & Unpaid Orders" list
 * settles itself without manual Sync clicks.
 */
export default function AdminPendingAutoSync({
  pendingCount,
}: {
  pendingCount: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (pendingCount === 0) return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/admin/orders/sync-pending", {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.updated > 0) router.refresh();
      } catch {
        // Network blip — try again next tick.
      }
    }

    const id = setInterval(tick, 12000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pendingCount, router]);

  return null;
}
