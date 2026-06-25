"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin actions for an unpaid/pending order:
 *  - Sync: pull the real status from NOWPayments and reconcile (preferred).
 *  - Mark paid: manual override when the API can't confirm but you know it paid.
 */
export default function OrderStatusActions({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "sync" | "mark">(null);

  async function run(action: "sync" | "mark", url: string) {
    setBusy(action);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error ?? "Action failed. Please try again.");
        setBusy(null);
        return;
      }
      if (data.note) window.alert(data.note);
      router.refresh();
    } catch {
      window.alert("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function handleSync() {
    void run("sync", `/api/admin/orders/${orderId}/sync`);
  }

  function handleMarkPaid() {
    const ok = window.confirm(
      `Mark order #${orderNumber} as PAID? Only do this if you've confirmed the funds actually arrived. This emails a receipt and adjusts stock.`,
    );
    if (!ok) return;
    void run("mark", `/api/admin/orders/${orderId}/mark-paid`);
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={busy !== null}
        className="rounded-md border border-navy/20 px-3 py-1 text-xs font-semibold text-navy transition hover:border-navy hover:bg-navy/5 disabled:opacity-50"
        aria-label={`Sync payment status for order ${orderNumber}`}
      >
        {busy === "sync" ? "Syncing…" : "Sync status"}
      </button>
      <button
        type="button"
        onClick={handleMarkPaid}
        disabled={busy !== null}
        className="rounded-md border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 transition hover:border-green-400 hover:bg-green-50 disabled:opacity-50"
        aria-label={`Mark order ${orderNumber} as paid`}
      >
        {busy === "mark" ? "Marking…" : "Mark paid"}
      </button>
    </div>
  );
}
