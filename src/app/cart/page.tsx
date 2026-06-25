"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_CENTS } from "@/lib/orderStatus";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents, ready } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-zinc-500">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Your cart is empty
        </h1>
        <p className="mt-2 text-zinc-500">
          Browse our research peptides and add something to get started.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-dark"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  const total = subtotalCents + SHIPPING_FLAT_CENTS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-navy">
        Shopping Cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-50">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold text-navy hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="font-semibold text-navy">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">{item.variantLabel}</p>
                <p className="text-sm text-zinc-500">
                  {formatPrice(item.priceCents)} each
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-black/15">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="px-3 py-1 text-navy hover:bg-zinc-100"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="px-3 py-1 text-navy hover:bg-zinc-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight text-navy">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping</span>
              <span className="font-medium">
                {formatPrice(SHIPPING_FLAT_CENTS)}
              </span>
            </div>
            <div className="my-3 border-t border-black/10" />
            <div className="flex justify-between text-base font-bold text-navy">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-lg bg-gold px-6 py-3 text-center font-semibold text-navy-dark transition hover:bg-gold-light"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-navy hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
