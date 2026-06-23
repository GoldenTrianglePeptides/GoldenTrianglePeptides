"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "support@goldentrianglepeptides.com";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const message = String(data.get("message") ?? "");

    const subject = `Storefront inquiry from ${name || "a researcher"}`;
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`;
    // Open the visitor's email client pre-filled — no server needed.
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-gold/5 p-8 text-center">
        <h2 className="text-xl font-extrabold text-navy">Thank you</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Your email draft is ready in your mail app. If it didn&rsquo;t open,
          reach us directly at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-gold hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-semibold text-navy hover:text-gold"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
        Get in touch
      </p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
        Tell us what you need
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Share enough detail for a useful reply: product name, order number,
        certificate request, or shipping question.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-navy">Name</span>
          <input name="name" required className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-navy">Email</span>
          <input name="email" type="email" required className={field} />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-navy">Phone (optional)</span>
        <input name="phone" className={field} />
      </label>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-navy">Message</span>
        <textarea name="message" rows={5} required className={field} />
      </label>

      <button
        type="submit"
        className="mt-5 w-full rounded-md bg-navy py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gold hover:text-navy-dark"
      >
        Send Message
      </button>
    </form>
  );
}
