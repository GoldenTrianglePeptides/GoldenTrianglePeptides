/**
 * The public origin of the site, used for canonical URLs, sitemaps, Open Graph
 * tags, and email links. Set NEXT_PUBLIC_SITE_URL in the environment; falls
 * back to the production domain.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || "https://goldentrianglepeptide.com").replace(/\/$/, "");
}

export const SITE_NAME = "Golden Triangle Peptides";
