"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-navy">Check your inbox</h1>
          <p className="mt-2 text-zinc-600">
            If an account exists for <strong>{email}</strong>, we just emailed a
            password reset link. It&apos;s valid for 30 minutes.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Don&apos;t see it? Check your spam folder, or try again with a
            different email.
          </p>
        </div>
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-navy hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-navy">Forgot password?</h1>
      <p className="mt-2 text-zinc-500">
        Enter your email and we&apos;ll send you a link to set a new one.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-navy hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
