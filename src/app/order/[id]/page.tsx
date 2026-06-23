import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const SHIPPING_FLAT_CENTS = 1000;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/order/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  // Only allow the owner (or an admin) to view an order.
  if (!order || (order.userId !== user.id && !user.isAdmin)) {
    notFound();
  }

  const subtotal = order.items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
          ✓
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy">
          Thank you for your order!
        </h1>
        <p className="mt-1 text-zinc-600">
          A confirmation has been sent to {order.shippingEmail}.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
          <div>
            <p className="font-mono text-sm text-zinc-500">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-zinc-500">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-800">
            {order.status}
          </span>
        </div>

        <div className="divide-y divide-black/5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3">
              <span className="text-zinc-700">
                {item.name}{" "}
                <span className="text-zinc-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-navy">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Shipping</span>
            <span>{formatPrice(SHIPPING_FLAT_CENTS)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-navy">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <h2 className="mb-2 font-serif text-lg font-bold text-navy">
          Shipping To
        </h2>
        <address className="text-sm not-italic text-zinc-600">
          {order.shippingName}
          <br />
          {order.shippingAddress}
          <br />
          {order.shippingCity}, {order.shippingState} {order.shippingZip}
        </address>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href="/account"
          className="rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-dark"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-black/15 px-6 py-3 font-semibold text-navy hover:border-navy"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
