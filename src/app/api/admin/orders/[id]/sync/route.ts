import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as nowpayments from "@/lib/nowpayments";
import { siteUrl } from "@/lib/site";
import { reconcileOrder } from "@/lib/reconcile";

// Needs Node (downstream crypto/email) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: pull the real payment status for an order directly from
 * NOWPayments and reconcile our order to match. This is the backstop for when
 * the IPN webhook never arrived — it asks NOWPayments "is this paid?" instead of
 * waiting to be told. Settling to paid runs the same fulfillment side effects
 * (stock + receipt) as the webhook, exactly once.
 */
export async function POST(
  _request: Request,
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

  try {
    const result = await reconcileOrder(order, siteUrl());
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[sync] reconcile failed:", err);
    return NextResponse.json(
      { error: "Couldn't reach NOWPayments. Please try again." },
      { status: 502 },
    );
  }
}
