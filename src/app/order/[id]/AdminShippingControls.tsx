"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SHIPPING_CARRIERS } from "@/lib/format";

export default function AdminShippingControls({
  orderId,
  status,
  initialTrackingNumber,
  initialCarrier,
}: {
  orderId: string;
  status: string;
  initialTrackingNumber: string | null;
  initialCarrier: string | null;
}) {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState(
    initialTrackingNumber ?? "",
  );
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alreadyShipped = status === "shipped" || status === "delivered";

  async function submit(notify: boolean) {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          carrier: carrier || undefined,
          notify,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update the order.");
        setSubmitting(false);
        return;
      }
      setMessage(
        notify
          ? "Marked shipped — customer notified by email."
          : "Saved tracking details (no email sent).",
      );
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-navy/30 bg-navy/[0.03] p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-navy px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          Admin
        </span>
        <h2 className="font-serif text-lg font-bold text-navy">
          {alreadyShipped ? "Update Shipping" : "Mark as Shipped"}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Carrier
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className={inputClass}
          >
            <option value="">— Select —</option>
            {SHIPPING_CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Tracking number
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="optional"
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={submitting}
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
        >
          {submitting
            ? "Working…"
            : alreadyShipped
              ? "Update & Re-notify Customer"
              : "Mark Shipped & Notify Customer"}
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={submitting}
          className="rounded-lg border border-black/15 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-navy disabled:opacity-60"
        >
          Save without emailing
        </button>
      </div>
    </div>
  );
}
