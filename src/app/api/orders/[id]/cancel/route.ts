import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Cancel an unpaid order. The owner (or an admin) may cancel an order that is
 * still awaiting payment — i.e. no crypto has been received yet. Paid or
 * already-final orders can't be cancelled here (a paid order would need a
 * manual refund).
 */
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order || (order.userId !== user.id && !user.isAdmin)) {
    // Don't reveal whether the order exists to non-owners.
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "awaiting_payment") {
    return NextResponse.json(
      {
        error:
          "Only orders awaiting payment can be cancelled. Contact support for help with this order.",
      },
      { status: 400 },
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ ok: true });
}
