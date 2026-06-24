import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Admin-only: hard-delete an order (and its line items, via the schema's
 * cascade). Used by the trash button on the admin dashboard.
 */
export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    await prisma.order.delete({ where: { id } });
  } catch {
    // Order didn't exist or was already deleted — treat as success so a
    // duplicate click from the admin UI doesn't surface an error.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
