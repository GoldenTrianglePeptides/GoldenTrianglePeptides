import crypto from "node:crypto";
import { prisma } from "./db";

// Password reset token helpers.
//
// Security model:
// - The raw token is 32 random bytes encoded as base64url and sent ONLY in the
//   reset email. Never stored.
// - The database stores only a SHA-256 hash of the token. A DB leak therefore
//   cannot be used to take over accounts.
// - Tokens expire after 30 minutes and are single-use (deleted on first
//   successful redemption). All older tokens for the same user are deleted
//   when a new one is issued so a reset link can't be reused after a fresh
//   one is requested.

export const RESET_TOKEN_TTL_MINUTES = 30;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a new password reset token for `userId`. Returns the raw token to
 * embed in the email URL. Invalidates any previous unused tokens for the user.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

/**
 * Look up a token by its raw value. Returns the matching record (with user) if
 * it exists, is unused, and hasn't expired. Returns null otherwise.
 */
export async function findValidResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  return record;
}

/** Mark a token as used so it can't be redeemed twice. */
export async function consumeResetToken(tokenId: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}
