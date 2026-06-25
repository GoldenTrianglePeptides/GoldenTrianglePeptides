"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteOrderButton({
  orderId,
  className,
  label = "Delete order",
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
      "Remove this order from your history? This can't be undone.",
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Could not remove the order.");
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
      {busy ? "Removing…" : label}
    </button>
  );
}
