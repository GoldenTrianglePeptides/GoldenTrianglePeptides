import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  verifyIpnSignature,
  mapPaymentStatusToOrderStatus,
} from "@/lib/nowpayments";
import { settleOrderPaid } from "@/lib/fulfillment";
import { isSettledPaid } from "@/lib/orderStatus";

function resolveSiteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

// HMAC verification needs the Node crypto module.
export const runtime = "nodejs";
// Never cache a webhook.
export const dynamic = "force-dynamic";

/**
 * NOWPayments IPN (Instant Payment Notification) endpoint.
 *
 * NOWPayments POSTs here whenever a payment changes state. We verify the
 * `x-nowpayments-sig` HMAC, then advance the matching order's status. Returning
 * 200 tells NOWPayments the notification was accepted; non-2xx triggers retries.
 */
export async function POST(request: Request) {
  // Read the raw body exactly as sent — required for signature verification.
  const rawBody = await request.text();

  const headerList = await headers();
  const signature = headerList.get("x-nowpayments-sig");

  if (!verifyIpnSignature(rawBody, signature)) {
    // Either the IPN secret isn't configured or the signature doesn't match.
    // Reject so an attacker can't mark orders paid by forging a callback.
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: {
    order_id?: string;
    payment_id?: string | number;
    payment_status?: string;
    price_amount?: number;
    pay_currency?: string;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const orderId = payload.order_id;
  const paymentStatus = payload.payment_status;
  if (!orderId || !paymentStatus) {
    return new Response("Missing order_id or payment_status", { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    // Unknown order — acknowledge so NOWPayments stops retrying.
    return new Response("Order not found", { status: 200 });
  }

  // Already paid / being fulfilled: never move it backward, just record the
  // latest raw status and stop.
  if (isSettledPaid(order.status)) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus },
    });
    return new Response("Already paid", { status: 200 });
  }

  const nextStatus = mapPaymentStatusToOrderStatus(paymentStatus);

  if (nextStatus === "paid") {
    // Defense in depth: only mark paid if the invoice's USD amount matches the
    // order total. The signature already authenticates the payload, but this
    // guards against an order being settled for the wrong amount.
    if (typeof payload.price_amount === "number") {
      const expectedUsd = order.totalCents / 100;
      if (Math.abs(payload.price_amount - expectedUsd) > 0.01) {
        // Wrong amount: don't resurrect a cancelled/expired order into "partial"
        // — that would silently reopen it. Only record the raw status and leave
        // it for an admin to review.
        if (order.status === "cancelled") {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus },
          });
          return new Response("Stays cancelled", { status: 200 });
        }
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "partial", paymentStatus },
        });
        return new Response("Amount mismatch", { status: 200 });
      }
    }
    // A completed, correct payment settles the order even if the customer had
    // cancelled it or it had expired — money received wins. Falls through to
    // the paid update below.
  } else if (order.status === "cancelled") {
    // Don't resurrect a cancelled order from a non-payment ping (waiting,
    // expired, etc.). Only a completed payment (handled above) can revive it.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus },
    });
    return new Response("Stays cancelled", { status: 200 });
  }

  // When an order is confirmed paid, settle it: flip to paid, decrement tracked
  // inventory, and email the receipt. This only runs on the transition to paid
  // (a repeat "finished" webhook hits the SETTLED_PAID short-circuit above), so
  // stock isn't double-decremented. Side-effect failures are logged but never
  // fail the webhook.
  if (nextStatus === "paid") {
    await settleOrderPaid(order, {
      paymentStatus,
      paymentRef: payload.payment_id
        ? String(payload.payment_id)
        : order.paymentRef,
      siteOrigin: resolveSiteOrigin(request),
    });
    return new Response("OK", { status: 200 });
  }

  // Still in flight or a non-paid terminal state — just record the latest status.
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      paymentStatus,
      paymentRef: payload.payment_id ? String(payload.payment_id) : order.paymentRef,
    },
  });

  return new Response("OK", { status: 200 });
}
