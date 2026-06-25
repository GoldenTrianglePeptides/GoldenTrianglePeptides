import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendOrderReceipt } from "@/lib/email";

// Mirrors the value used at checkout; if shipping ever varies, snapshot it on
// the order instead of re-deriving it here.
const SHIPPING_FLAT_CENTS = 1000;

// Once an order is paid or being fulfilled, nothing should move it backward.
// Shared by the webhook and the admin status-sync / manual-paid actions so they
// all agree on what "already settled" means.
export const SETTLED_PAID_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

/**
 * Settle an order as paid and run the one-time fulfillment side effects:
 * decrement tracked stock and email the receipt.
 *
 * Call this only on the transition INTO paid — callers must first check the
 * order isn't already in SETTLED_PAID_STATUSES, otherwise stock would be
 * double-decremented and a second receipt sent. Side-effect failures are logged
 * but never thrown, so a flaky email/stock update can't undo the paid status.
 */
export async function settleOrderPaid(
  order: Order,
  opts: {
    paymentStatus?: string | null;
    paymentRef?: string | null;
    /** Public site origin, used to build the receipt's order link. */
    siteOrigin: string;
  },
): Promise<void> {
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      ...(opts.paymentStatus ? { paymentStatus: opts.paymentStatus } : {}),
      ...(opts.paymentRef ? { paymentRef: opts.paymentRef } : {}),
    },
  });

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });

  // Decrement tracked stock; flip a variant out of stock when it hits zero.
  try {
    for (const item of items) {
      if (!item.variantId) continue;
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true },
      });
      if (!variant || variant.stockQty === null) continue; // untracked
      const remaining = Math.max(0, variant.stockQty - item.quantity);
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stockQty: remaining,
          ...(remaining === 0 ? { inStock: false } : {}),
        },
      });
    }
  } catch (err) {
    console.error("[fulfillment] Failed to decrement stock:", err);
  }

  try {
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );
    await sendOrderReceipt({
      to: order.shippingEmail,
      orderId: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(),
      items: items.map((i) => ({
        name: i.name,
        priceCents: i.priceCents,
        quantity: i.quantity,
      })),
      subtotalCents,
      shippingCents: SHIPPING_FLAT_CENTS,
      totalCents: order.totalCents,
      shipping: {
        name: order.shippingName,
        address: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        zip: order.shippingZip,
      },
      orderUrl: `${opts.siteOrigin}/order/${order.id}`,
    });
  } catch (err) {
    console.error("[fulfillment] Failed to enqueue receipt:", err);
  }
}
