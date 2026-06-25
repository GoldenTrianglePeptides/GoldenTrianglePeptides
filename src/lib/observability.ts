/**
 * Single chokepoint for non-fatal errors — swallowed side-effect failures
 * (receipt email, stock decrement), webhook hiccups, cron errors, etc. Today it
 * writes to the console (Vercel function logs). To add real alerting, wire a
 * monitor here ONCE and every existing call site is covered:
 *
 *   import * as Sentry from "@sentry/nextjs";
 *   Sentry.captureException(error, { tags: { context }, extra });
 *
 * Keeping it dependency-free for now so there's nothing to misconfigure.
 */
export function reportError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (extra) {
    console.error(`[${context}]`, error, extra);
  } else {
    console.error(`[${context}]`, error);
  }
}
