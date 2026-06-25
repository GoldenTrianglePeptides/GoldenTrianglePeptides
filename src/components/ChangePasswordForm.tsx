"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);

    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (newPassword !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not change your password.");
        setBusy(false);
        return;
      }
      form.reset();
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-navy";

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-navy">Current password</span>
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy">New password</span>
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy">
          Confirm new password
        </span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          required
          className={field}
        />
      </label>

      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      {done && (
        <p className="text-sm font-medium text-green-700">
          Password updated.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
