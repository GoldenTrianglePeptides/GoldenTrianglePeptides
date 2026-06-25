import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getCurrentUser,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters"),
});

/** Let a signed-in user change their own password (verifying the current one). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }

  const rl = rateLimit(`change-password:${clientIp(request)}`, 10, 15 * 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record || !(await verifyPassword(currentPassword, record.passwordHash))) {
    return NextResponse.json(
      { error: "Your current password is incorrect" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
