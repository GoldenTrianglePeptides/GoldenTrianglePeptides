import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  verifyIpnSignature,
  mapPaymentStatusToOrderStatus,
} from "@/lib/nowpayments";

// HMAC verification needs the Node crypto module.
export const runtime = "nodejs";
// Never cache a webhook.
export const dynamic = "force-dynamic";

// Statuses we treat as final — once an order reaches one of these we don't let
// a later (possibly out-of-order) webhook move it backwards.
const TERMINAL_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

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

  // Already in a terminal state: just record the latest raw status and stop.
  if (TERMINAL_STATUSES.has(order.status)) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus },
    });
    return new Response("Already final", { status: 200 });
  }

  const nextStatus = mapPaymentStatusToOrderStatus(paymentStatus);

  // Defense in depth: only mark paid if the invoice's USD amount matches the
  // order total. The signature already authenticates the payload, but this
  // guards against an order being settled for the wrong amount.
  if (nextStatus === "paid" && typeof payload.price_amount === "number") {
    const expectedUsd = order.totalCents / 100;
    if (Math.abs(payload.price_amount - expectedUsd) > 0.01) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "partial", paymentStatus },
      });
      return new Response("Amount mismatch", { status: 200 });
    }
  }

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
