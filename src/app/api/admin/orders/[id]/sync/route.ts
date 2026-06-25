import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as nowpayments from "@/lib/nowpayments";
import { SETTLED_PAID_STATUSES, settleOrderPaid } from "@/lib/fulfillment";

// Needs Node (downstream crypto/email) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveSiteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

/**
 * Admin-only: pull the real payment status for an order directly from
 * NOWPayments and reconcile our order to match. This is the backstop for when
 * the IPN webhook never arrived — it asks NOWPayments "is this paid?" instead of
 * waiting to be told. Settling to paid runs the same fulfillment side effects
 * (stock + receipt) as the webhook, exactly once.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!nowpayments.canQueryPayments()) {
    return NextResponse.json(
      {
        error:
          "Status sync isn't configured. Add NOWPAYMENTS_EMAIL and NOWPAYMENTS_PASSWORD in Vercel and redeploy.",
      },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Already paid / being fulfilled — never move it backward.
  if (SETTLED_PAID_STATUSES.has(order.status)) {
    return NextResponse.json({
      ok: true,
      status: order.status,
      note: "Order is already paid.",
    });
  }

  let payment: nowpayments.NowPaymentsPayment | null;
  try {
    payment = await nowpayments.fetchLatestPaymentForOrder(order.id, {
      // Look back a day before the order to be safe against clock/timezone skew.
      since: new Date(order.createdAt.getTime() - 24 * 60 * 60 * 1000),
    });
  } catch (err) {
    console.error("[sync] NOWPayments lookup failed:", err);
    return NextResponse.json(
      { error: "Couldn't reach NOWPayments. Please try again." },
      { status: 502 },
    );
  }

  if (!payment?.payment_status) {
    return NextResponse.json({
      ok: true,
      status: order.status,
      note: "No payment found at NOWPayments for this order yet.",
    });
  }

  const nextStatus = nowpayments.mapPaymentStatusToOrderStatus(
    payment.payment_status,
  );

  if (nextStatus === "paid") {
    // Defense in depth: only settle if the invoice's USD amount matches the
    // order total, mirroring the webhook.
    if (typeof payment.price_amount === "number") {
      const expectedUsd = order.totalCents / 100;
      if (Math.abs(payment.price_amount - expectedUsd) > 0.01) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "partial", paymentStatus: payment.payment_status },
        });
        return NextResponse.json({
          ok: true,
          status: "partial",
          note: "Payment amount doesn't match the order total — marked partial.",
        });
      }
    }

    await settleOrderPaid(order, {
      paymentStatus: payment.payment_status,
      paymentRef: payment.payment_id
        ? String(payment.payment_id)
        : order.paymentRef,
      siteOrigin: resolveSiteOrigin(request),
    });
    return NextResponse.json({ ok: true, status: "paid" });
  }

  // Don't resurrect a cancelled order from a non-payment status — only a
  // completed payment (handled above) revives it. Mirrors the webhook.
  if (order.status === "cancelled") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: payment.payment_status },
    });
    return NextResponse.json({
      ok: true,
      status: order.status,
      note: "No completed payment found — order stays cancelled.",
    });
  }

  // Not paid yet (waiting/confirming) or a terminal non-paid state — just record
  // the latest status so the order reflects reality.
  await prisma.order.update({
    where: { id: order.id },
    data: { status: nextStatus, paymentStatus: payment.payment_status },
  });
  return NextResponse.json({ ok: true, status: nextStatus });
}
