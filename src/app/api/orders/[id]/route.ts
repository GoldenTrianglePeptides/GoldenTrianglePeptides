import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Statuses a customer is allowed to permanently remove from their own order
// history. Only dead, never-paid orders — anything paid (or still awaiting
// payment) stays so there's a record and the customer can't hide an unpaid
// order mid-checkout.
const DELETABLE_STATUSES = ["cancelled", "failed", "expired"];

/**
 * Delete one of the customer's own orders from their history. The owner (or an
 * admin) may delete an order that is cancelled, failed, or expired. Paid and
 * still-pending orders can't be deleted here. Items cascade-delete via schema.
 */
export async function DELETE(
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

  if (!DELETABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      {
        error:
          "Only cancelled, failed, or expired orders can be removed. Contact support for help with this order.",
      },
      { status: 400 },
    );
  }

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
