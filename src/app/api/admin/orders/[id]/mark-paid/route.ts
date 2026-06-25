import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { settleOrderPaid } from "@/lib/fulfillment";
import { isSettledPaid } from "@/lib/orderStatus";
import { isSameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only manual override: mark an order paid by hand. Use this only after
 * confirming the funds actually landed (e.g. in NOWPayments or on-chain) — it
 * runs the same fulfillment as a real payment (stock decrement + receipt email).
 * Prefer the /sync action, which verifies against NOWPayments; this is the
 * last-resort fallback when the API can't be queried.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (isSettledPaid(order.status)) {
    return NextResponse.json({
      ok: true,
      status: order.status,
      note: "Order is already paid.",
    });
  }

  await settleOrderPaid(order, {
    paymentStatus: "manually_marked_paid",
    paymentRef: order.paymentRef,
    siteOrigin: siteUrl(),
  });

  return NextResponse.json({ ok: true, status: "paid" });
}
