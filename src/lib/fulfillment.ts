import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendOrderReceipt } from "@/lib/email";
import { reportError } from "@/lib/observability";
import { SETTLED_PAID_STATUSES, SHIPPING_FLAT_CENTS } from "@/lib/orderStatus";

/**
 * Settle an order as paid and email the receipt. Stock was already reserved at
 * checkout, so a paid order just keeps its reservation — no stock change here.
 *
 * The transition to paid is atomic (conditional updateMany below), so even under
 * concurrent webhook/cron/sync deliveries only the winning caller emails the
 * receipt — it's sent exactly once. Receipt failures are reported but never
 * thrown, so a flaky email can't undo the paid status.
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
  // Flip to paid atomically: the conditional WHERE means only the first caller
  // that transitions a not-yet-settled order proceeds to run the side effects.
  // Concurrent webhook/cron/sync deliveries that lose this race update zero rows
  // and return early, so stock is never double-decremented and the receipt is
  // sent exactly once. (A still-`cancelled` order is allowed through here —
  // money received wins — because cancelled isn't in SETTLED_PAID_STATUSES.)
  const { count } = await prisma.order.updateMany({
    where: { id: order.id, status: { notIn: [...SETTLED_PAID_STATUSES] } },
    // SETTLED_PAID_STATUSES is a readonly array; spread to a mutable one for Prisma.
    data: {
      status: "paid",
      ...(opts.paymentStatus ? { paymentStatus: opts.paymentStatus } : {}),
      ...(opts.paymentRef ? { paymentRef: opts.paymentRef } : {}),
    },
  });
  if (count === 0) {
    // Another concurrent settle already paid/fulfilled this order — don't repeat.
    return;
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });

  // Stock was already reserved at checkout (see lib/inventory.reserveStock), so
  // a paid order simply keeps its reservation — nothing to decrement here.

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
    reportError("fulfillment.receipt", err, { orderId: order.id });
  }
}
