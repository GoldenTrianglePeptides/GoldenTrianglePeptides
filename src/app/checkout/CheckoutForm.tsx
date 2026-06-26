"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_CENTS } from "@/lib/orderStatus";

export default function CheckoutForm({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const { items, subtotalCents, ready } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: userName,
    email: userEmail,
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [discountCode, setDiscountCode] = useState("");

  // Optimistic preview only — the server validates the code and is the source
  // of truth for the actual charge.
  const WELCOME_PERCENT = 10;
  const estDiscount = discountCode.trim()
    ? Math.round((subtotalCents * WELCOME_PERCENT) / 100)
    : 0;

  // Send shoppers with an empty cart back to the shop.
  useEffect(() => {
    if (ready && items.length === 0 && !submitting) {
      router.replace("/products");
    }
  }, [ready, items.length, submitting, router]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          shipping: form,
          discountCode: discountCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Send the customer to the hosted crypto payment page. Keep the cart
      // intact until the order is confirmed paid (handled on the order page)
      // so an abandoned payment doesn't lose their items.
      if (!data.invoiceUrl) {
        setError("Could not start the payment. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.invoiceUrl;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-zinc-500">
        Loading…
      </div>
    );
  }

  const total = subtotalCents - estDiscount + SHIPPING_FLAT_CENTS;
  const inputClass =
    "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-serif text-3xl font-bold text-navy">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="mb-4 font-serif text-xl font-bold text-navy">
              Shipping Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                Street address
                <input
                  required
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                City
                <input
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                State / Region
                <input
                  required
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                ZIP / Postal code
                <input
                  required
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="mb-4 font-serif text-xl font-bold text-navy">
              Payment
            </h2>
            <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
              <p className="flex items-center gap-2 font-semibold text-navy">
                <span aria-hidden>₿</span> Pay with cryptocurrency
              </p>
              <p className="mt-2">
                When you place your order you&apos;ll be taken to a secure
                payment page to pay with Bitcoin, Ethereum, USDT and other
                coins. Your order is confirmed automatically as soon as the
                payment is received on the blockchain.
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 font-serif text-xl font-bold text-navy">
            Your Order
          </h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between">
                <span className="text-zinc-600">
                  {i.name} ({i.variantLabel}) × {i.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(i.priceCents * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-black/10" />
          <label className="block text-sm">
            <span className="text-zinc-500">Discount code (optional)</span>
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="WELCOME-XXXXXX"
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm uppercase outline-none focus:border-navy"
            />
          </label>
          <div className="my-3 border-t border-black/10" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            {estDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({WELCOME_PERCENT}%)</span>
                <span>−{formatPrice(estDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping</span>
              <span>{formatPrice(SHIPPING_FLAT_CENTS)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-navy">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {estDiscount > 0 && (
              <p className="text-xs text-zinc-400">
                Discount applied at payment if the code is valid.
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
          >
            {submitting
              ? "Starting payment…"
              : `Pay with Crypto · ${formatPrice(total)}`}
          </button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-navy hover:underline"
          >
            Back to cart
          </Link>
        </div>
      </form>
    </div>
  );
}
