import crypto from "node:crypto";

/** Percent off the subtotal for a newsletter first-order code. */
export const WELCOME_DISCOUNT_PERCENT = 10;

/** Generate a readable, unique-enough welcome code, e.g. "WELCOME-7K2QM9". */
export function newWelcomeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += alphabet[bytes[i] % alphabet.length];
  return `WELCOME-${suffix}`;
}

/** The discount in cents for a given subtotal. */
export function welcomeDiscountCents(subtotalCents: number): number {
  return Math.round((subtotalCents * WELCOME_DISCOUNT_PERCENT) / 100);
}
