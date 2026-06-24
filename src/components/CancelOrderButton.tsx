"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({
  orderId,
  className,
  label = "Cancel order",
}: {
  orderId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    // The button may live inside a clickable card — don't trigger that.
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm(
      "Cancel this order? This can't be undone. If you've already sent payment, do not cancel — contact support instead.",
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Could not cancel the order.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={
        className ??
        "rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
      }
    >
      {busy ? "Cancelling…" : label}
    </button>
  );
}
