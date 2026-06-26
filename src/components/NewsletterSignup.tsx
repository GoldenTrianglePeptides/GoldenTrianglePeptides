"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-white/80">
        Thanks! Check your email for your <strong>10% off</strong> code.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-white/80">
        Get <strong>10% off your first order</strong> — research news &amp; new
        products.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-gold-light"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy-dark transition hover:bg-gold-light disabled:opacity-50"
        >
          {busy ? "…" : "Join"}
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </form>
  );
}
