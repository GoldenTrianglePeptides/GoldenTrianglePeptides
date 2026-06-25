import { siteUrl } from "./site";

/**
 * CSRF defense for state-changing API routes. Our session cookie is
 * `sameSite: "lax"`, which blocks cross-site `fetch`/XHR POSTs but NOT
 * auto-submitted top-level form POSTs. Requiring the request to originate from
 * our own site closes that gap.
 *
 * Returns true when the request is same-origin. Browsers send `Sec-Fetch-Site`
 * (preferred) and/or `Origin` on state-changing requests, so a genuine in-app
 * `fetch` always passes. Use only on session-authenticated routes — NOT on the
 * webhook or cron endpoints (those are server-to-server with their own auth and
 * send no Origin).
 */
export function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) {
    // "none" = user-initiated (e.g. typed URL); "same-origin" = our own page.
    return fetchSite === "same-origin" || fetchSite === "none";
  }

  const origin = request.headers.get("origin");
  if (!origin) return true; // No Origin and no Sec-Fetch-Site — can't be a forged cross-site form.
  try {
    return new URL(origin).host === new URL(siteUrl()).host;
  } catch {
    return false;
  }
}
