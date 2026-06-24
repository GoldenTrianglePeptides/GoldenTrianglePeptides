"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete order #${orderNumber}? This permanently removes the order and its line items and cannot be undone.`,
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Could not delete the order.");
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
      aria-label={`Delete order ${orderNumber}`}
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
