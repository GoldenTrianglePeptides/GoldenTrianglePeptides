import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import * as nowpayments from "@/lib/nowpayments";
import { SETTLED_PAID_STATUSES, settleOrderPaid } from "@/lib/fulfillment";

export type ReconcileResult = {
  status: string;
  changed: boolean;
  note?: string;
};

/**
 * Reconcile a single order against its real NOWPayments status. This is the
 * shared core behind the admin "Sync status" button and the cron sweep, so they
 * behave identically. Mirrors the webhook's rules: amount must match to settle,
 * a completed payment can revive a cancelled order (money wins), but a non-
 * payment status never resurrects a cancelled one.
 *
 * Pass `payment` when you've already fetched the payments list (the cron does
 * this once for all orders); omit it to look the order up on demand.
 */
export async function reconcileOrder(
  order: Order,
  siteOrigin: string,
  payment?: nowpayments.NowPaymentsPayment | null,
): Promise<ReconcileResult> {
  // Already paid / being fulfilled — never move it backward.
  if (SETTLED_PAID_STATUSES.has(order.status)) {
    return { status: order.status, changed: false, note: "Order is already paid." };
  }

  const p =
    payment !== undefined
      ? payment
      : await nowpayments.fetchLatestPaymentForOrder(order.id, {
          since: new Date(order.createdAt.getTime() - 24 * 60 * 60 * 1000),
        });

  if (!p?.payment_status) {
    return {
      status: order.status,
      changed: false,
      note: "No payment found at NOWPayments for this order yet.",
    };
  }

  const nextStatus = nowpayments.mapPaymentStatusToOrderStatus(p.payment_status);

  if (nextStatus === "paid") {
    // Only settle if the invoice's USD amount matches the order total.
    if (typeof p.price_amount === "number") {
      const expectedUsd = order.totalCents / 100;
      if (Math.abs(p.price_amount - expectedUsd) > 0.01) {
        // Wrong amount: don't resurrect a cancelled order into "partial".
        if (order.status === "cancelled") {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: p.payment_status },
          });
          return {
            status: order.status,
            changed: false,
            note: "Payment amount doesn't match — order stays cancelled.",
          };
        }
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "partial", paymentStatus: p.payment_status },
        });
        return {
          status: "partial",
          changed: order.status !== "partial",
          note: "Payment amount doesn't match the order total — marked partial.",
        };
      }
    }

    await settleOrderPaid(order, {
      paymentStatus: p.payment_status,
      paymentRef: p.payment_id ? String(p.payment_id) : order.paymentRef,
      siteOrigin,
    });
    return { status: "paid", changed: true };
  }

  // Don't resurrect a cancelled order from a non-payment status.
  if (order.status === "cancelled") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: p.payment_status },
    });
    return {
      status: order.status,
      changed: false,
      note: "No completed payment found — order stays cancelled.",
    };
  }

  // Still in flight or a non-paid terminal state — record the latest status.
  await prisma.order.update({
    where: { id: order.id },
    data: { status: nextStatus, paymentStatus: p.payment_status },
  });
  return { status: nextStatus, changed: order.status !== nextStatus };
}
