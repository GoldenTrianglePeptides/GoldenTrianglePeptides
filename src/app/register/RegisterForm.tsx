"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const { refresh } = useAuth();

  // `website` is a honeypot — hidden from users, often auto-filled by bots.
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("You must confirm you are a qualified researcher 21 or older.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        setSubmitting(false);
        return;
      }
      await refresh();
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-navy">Create Account</h1>
      <p className="mt-2 text-zinc-500">
        Join Golden Triangle Peptides to place and track orders.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-xl border border-black/10 bg-white p-6"
      >
        {/* Honeypot: hidden from people, tempting to bots. Real users leave it empty. */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm">
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-zinc-400">
            At least 8 characters.
          </span>
        </label>

        <label className="flex items-start gap-2 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I certify that I am a qualified researcher 21 years or older and that
            all products will be used strictly for laboratory research purposes.
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-gold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
