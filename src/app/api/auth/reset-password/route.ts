import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import {
  findValidResetToken,
  consumeResetToken,
} from "@/lib/passwordReset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
});

/**
 * Redeem a password reset token and set a new password. On success the user is
 * signed in immediately so they don't have to remember-then-type the same
 * password again.
 */
export async function POST(request: Request) {
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

  const { token, password } = parsed.data;
  const record = await findValidResetToken(token);
  if (!record) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await consumeResetToken(record.id);

  await createSession(record.userId);

  return NextResponse.json({
    user: {
      id: record.user.id,
      name: record.user.name,
      email: record.user.email,
      isAdmin: record.user.isAdmin,
    },
  });
}
