// Lightweight, dependency-free rate limiter.
//
// NOTE: state lives in memory, so on serverless it is per-instance, not shared
// across all concurrent instances. It meaningfully raises the bar against naive
// brute-force / spam at zero cost, but for strict, distributed limits use a
// shared store (e.g. Upstash Redis) — see the README. Good enough as a first
// line of defense for auth endpoints.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  // Occasionally drop expired buckets so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

/**
 * Allow up to `limit` calls per `windowMs` for a given `key`. Returns ok:false
 * with a retry-after hint once the limit is exceeded within the window.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Build a NextResponse-compatible 429 body + Retry-After header. */
export function tooManyRequests(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many attempts. Please wait a bit and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, retryAfterSec)),
      },
    },
  );
}
