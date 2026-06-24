import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/account/transactional routes out of search results.
      disallow: [
        "/admin",
        "/account",
        "/checkout",
        "/order/",
        "/api/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
