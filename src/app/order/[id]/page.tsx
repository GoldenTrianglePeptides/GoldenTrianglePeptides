import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate, carrierTrackingUrl } from "@/lib/format";
import OrderStatusWatcher from "./OrderStatusWatcher";
import AdminShippingControls from "./AdminShippingControls";
import CancelOrderButton from "@/components/CancelOrderButton";
import ReorderButton from "@/components/ReorderButton";
import {
  PAID_STATUSES,
  FAILED_STATUSES,
  SHIPPING_FLAT_CENTS,
} from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ");
}

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

  // Build a reorder list from items whose variant is still purchasable, using
  // current product data (slug/image/label/price) since order items only store
  // a name snapshot. Unavailable items are simply omitted.
  const variantIds = order.items
    .map((i) => i.variantId)
    .filter((v): v is string => v !== null);
  const liveVariants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      })
    : [];
  const reorderItems = order.items.flatMap((i) => {
    if (!i.variantId) return [];
    const v = liveVariants.find((lv) => lv.id === i.variantId);
    if (!v || !v.inStock || !v.product.inStock) return [];
    return [
      {
        variantId: v.id,
        productId: v.productId,
        slug: v.product.slug,
        name: v.product.name,
        variantLabel: v.label,
        priceCents: v.priceCents,
        imageUrl: v.product.imageUrl,
        quantity: i.quantity,
      },
    ];
  });

  const isPaid = PAID_STATUSES.includes(order.status);
  const isFailed = FAILED_STATUSES.includes(order.status);
  // Anything not paid or failed is still in flight (awaiting_payment, partial).
  const isPending = !isPaid && !isFailed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <OrderStatusWatcher orderId={order.id} status={order.status} />

      {isPaid && (
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
      )}

      {isPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-2xl text-white">
            ₿
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {order.status === "partial"
              ? "Partial payment received"
              : "Waiting for your payment"}
          </h1>
          <p className="mt-1 text-zinc-600">
            {order.status === "partial"
              ? "We received part of the amount. Please send the remaining balance to complete your order."
              : "Complete your payment on the secure checkout page. This page updates automatically once the blockchain confirms it."}
          </p>
          {order.paymentUrl && (
            <a
              href={order.paymentUrl}
              className="mt-4 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
            >
              Complete Payment
            </a>
          )}
          {order.status === "awaiting_payment" && (
            <div className="mt-4">
              <CancelOrderButton
                orderId={order.id}
                label="Cancel this order"
                className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
              />
            </div>
          )}
        </div>
      )}

      {isFailed && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-2xl text-white">
            !
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy">
            Payment not completed
          </h1>
          <p className="mt-1 text-zinc-600">
            This order&apos;s payment wasn&apos;t completed. You can place a new
            order to try again.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-dark"
          >
            Return to Shop
          </Link>
        </div>
      )}

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
            {humanizeStatus(order.status)}
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
          {order.discountCents > 0 && (
            <div className="flex justify-between text-green-700">
              <span>
                Discount{order.discountCode ? ` (${order.discountCode})` : ""}
              </span>
              <span>−{formatPrice(order.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">Shipping</span>
            <span>{formatPrice(SHIPPING_FLAT_CENTS)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-navy">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        {reorderItems.length > 0 && (
          <div className="mt-5 flex justify-end border-t border-black/10 pt-4">
            <ReorderButton items={reorderItems} />
          </div>
        )}
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

      {order.status === "shipped" && (
        <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="mb-2 flex items-center gap-2 font-serif text-lg font-bold text-navy">
            <span aria-hidden>📦</span> Your order has shipped
          </h2>
          {order.trackingNumber ? (
            <div className="text-sm text-zinc-700">
              {order.trackingCarrier && (
                <p>
                  <span className="text-zinc-500">Carrier:</span>{" "}
                  {order.trackingCarrier}
                </p>
              )}
              <p>
                <span className="text-zinc-500">Tracking #:</span>{" "}
                <span className="font-mono">{order.trackingNumber}</span>
              </p>
              {(() => {
                const url = carrierTrackingUrl(
                  order.trackingCarrier,
                  order.trackingNumber,
                );
                return url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
                  >
                    Track Your Package
                  </a>
                ) : null;
              })()}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">
              Your package is on its way.
            </p>
          )}
        </div>
      )}

      {user.isAdmin && isPaid && (
        <AdminShippingControls
          orderId={order.id}
          status={order.status}
          initialTrackingNumber={order.trackingNumber}
          initialCarrier={order.trackingCarrier}
        />
      )}

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
